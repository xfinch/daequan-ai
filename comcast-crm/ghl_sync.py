#!/usr/bin/env python3
"""
GHL Comcast Integration - Sync Service
Handles bidirectional sync between local SQLite and GHL
"""

import sqlite3
import json
import os
import requests
from datetime import datetime
from typing import Optional, Dict, List

# Config
DB_PATH = "/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db"
GHL_LOCATION_ID = os.getenv("GHL_COMCAST_LOCATION_ID", "nPubo6INanVq94ovAQNW")  # Comcast - Xavier sub-account
GHL_API_KEY = os.getenv("GHL_COMCAST_TOKEN", os.getenv("GHL_TTL_TOKEN", ""))  # Use Comcast location token

class GHLComcastSync:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = sqlite3.Row
        
    def add_visit(self, 
                  business_name: str,
                  zip_code: str,
                  contact_name: str = "",
                  phone: str = "",
                  email: str = "",
                  address: str = "",
                  city: str = "",
                  notes: str = "",
                  status: str = "interested",
                  lat: float = None,
                  lng: float = None,
                  source: str = "whatsapp") -> int:
        """Add a new business visit to local DB"""
        
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO business_visits 
            (business_name, contact_name, phone, email, address, city, zip_code, 
             notes, visit_status, lat, lng, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (business_name, contact_name, phone, email, address, city, zip_code,
              notes, status, lat, lng, source))
        
        self.conn.commit()
        visit_id = cursor.lastrowid
        
        # Try to sync to GHL immediately
        if GHL_LOCATION_ID:
            self.sync_to_ghl(visit_id)
        
        return visit_id
    
    def sync_to_ghl(self, visit_id: int) -> bool:
        """Sync a local visit to GHL"""
        
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM business_visits WHERE id = ?", (visit_id,))
        row = cursor.fetchone()
        
        if not row:
            return False
        
        visit = dict(row)
        
        # Prepare GHL contact data
        contact_data = {
            "firstName": visit['contact_name'].split()[0] if visit['contact_name'] else visit['business_name'][:20],
            "lastName": " ".join(visit['contact_name'].split()[1:]) if visit['contact_name'] and len(visit['contact_name'].split()) > 1 else "",
            "email": visit['email'] or f"{visit['id']}@placeholder.com",
            "phone": visit['phone'],
            "address1": visit['address'],
            "city": visit['city'] or "Tacoma",
            "state": "WA",
            "postalCode": visit['zip_code'],
            "customFields": [
                {"key": "business_name", "value": visit['business_name']},
                {"key": "zip_code", "value": visit['zip_code']},
                {"key": "visit_status", "value": visit['visit_status']},
                {"key": "latitude", "value": str(visit['lat']) if visit['lat'] else ""},
                {"key": "longitude", "value": str(visit['lng']) if visit['lng'] else ""},
            ],
            "tags": ["comcast-prospect", f"zip-{visit['zip_code']}", visit['visit_status']]
        }
        
        try:
            if visit['ghl_contact_id']:
                # Update existing
                response = requests.put(
                    f"https://services.leadconnectorhq.com/contacts/{visit['ghl_contact_id']}",
                    headers={
                        "Authorization": f"Bearer {GHL_API_KEY}",
                        "Content-Type": "application/json",
                        "Version": "2021-07-28"
                    },
                    json=contact_data,
                    timeout=30
                )
            else:
                # Create new
                response = requests.post(
                    "https://services.leadconnectorhq.com/contacts/",
                    headers={
                        "Authorization": f"Bearer {GHL_API_KEY}",
                        "Content-Type": "application/json",
                        "Version": "2021-07-28"
                    },
                    json={**contact_data, "locationId": GHL_LOCATION_ID},
                    timeout=30
                )
            
            if response.status_code in [200, 201]:
                result = response.json()
                ghl_id = result.get('contact', {}).get('id') or result.get('id')
                
                # Update local record
                cursor.execute("""
                    UPDATE business_visits 
                    SET ghl_contact_id = ?, synced_to_ghl = 1, last_sync_error = NULL
                    WHERE id = ?
                """, (ghl_id, visit_id))
                
                # Log success
                cursor.execute("""
                    INSERT INTO sync_log (action, table_name, record_id, ghl_contact_id, status, message)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, ('create' if not visit['ghl_contact_id'] else 'update', 
                      'business_visits', visit_id, ghl_id, 'success', ''))
                
                self.conn.commit()
                return True
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                cursor.execute("""
                    UPDATE business_visits SET last_sync_error = ? WHERE id = ?
                """, (error_msg, visit_id))
                
                cursor.execute("""
                    INSERT INTO sync_log (action, table_name, record_id, status, message)
                    VALUES (?, ?, ?, ?, ?)
                """, ('create', 'business_visits', visit_id, 'error', error_msg))
                
                self.conn.commit()
                return False
                
        except Exception as e:
            error_msg = str(e)[:200]
            cursor.execute("""
                UPDATE business_visits SET last_sync_error = ? WHERE id = ?
            """, (error_msg, visit_id))
            self.conn.commit()
            return False
    
    def get_visits_by_zip(self, zip_code: str) -> List[Dict]:
        """Get all visits for a zip code"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM business_visits 
            WHERE zip_code = ? 
            ORDER BY visit_date DESC
        """, (zip_code,))
        return [dict(row) for row in cursor.fetchall()]
    
    def get_all_visits(self) -> List[Dict]:
        """Get all visits for map display"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM business_visits 
            WHERE lat IS NOT NULL AND lng IS NOT NULL
            ORDER BY visit_date DESC
        """)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_ghl_deep_link(self, visit_id: int) -> str:
        """Generate deep link to GHL contact"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT ghl_contact_id, ghl_location_id FROM business_visits WHERE id = ?", (visit_id,))
        row = cursor.fetchone()
        
        if row and row['ghl_contact_id']:
            loc_id = row['ghl_location_id'] or GHL_LOCATION_ID
            return f"https://app.gohighlevel.com/v2/location/{loc_id}/contacts/{row['ghl_contact_id']}"
        return ""
    
    def sync_all_pending(self):
        """Sync all unsynced records to GHL"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM business_visits WHERE synced_to_ghl = 0")
        pending = cursor.fetchall()
        
        results = {"success": 0, "failed": 0}
        for row in pending:
            if self.sync_to_ghl(row['id']):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        return results

if __name__ == "__main__":
    import sys
    
    sync = GHLComcastSync()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "sync":
            results = sync.sync_all_pending()
            print(f"Sync complete: {results['success']} success, {results['failed']} failed")
        elif sys.argv[1] == "test":
            # Add test record
            vid = sync.add_visit(
                business_name="Test Business",
                zip_code="98404",
                contact_name="Test Contact",
                phone="253-555-0100",
                address="123 Test St",
                notes="Test visit"
            )
            print(f"Added test visit: {vid}")
    else:
        print("Usage: python3 ghl_sync.py [sync|test]")
