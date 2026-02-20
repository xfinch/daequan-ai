#!/usr/bin/env python3
"""
Comcast CRM API Server
Serves map data and accepts WhatsApp webhook updates
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import sqlite3

# Add parent dir to path
sys.path.insert(0, '/Users/xfinch/.openclaw/workspace/comcast-crm')
from ghl_sync import GHLComcastSync

DB_PATH = "/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class APIHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
        pass
    
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        
        if path == '/api/visits':
            self.handle_get_visits()
        elif path == '/api/visits/by-zip':
            self.handle_get_by_zip(query.get('zip', [''])[0])
        elif path == '/api/stats':
            self.handle_get_stats()
        elif path == '/health':
            self.send_json({"status": "ok"})
        else:
            self.send_error(404)
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/visits':
            self.handle_create_visit()
        elif path == '/api/whatsapp':
            self.handle_whatsapp_webhook()
        else:
            self.send_error(404)
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def handle_get_visits(self):
        """Get all visits with coordinates for map"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, business_name, contact_name, phone, email, 
                   address, zip_code, lat, lng, visit_status, 
                   visit_date, notes, ghl_contact_id
            FROM business_visits
            WHERE lat IS NOT NULL AND lng IS NOT NULL
            ORDER BY visit_date DESC
        """)
        
        visits = []
        for row in cursor.fetchall():
            visit = dict(row)
            # Add deep link if GHL contact exists
            if visit['ghl_contact_id']:
                loc_id = os.getenv("GHL_COMCAST_LOCATION_ID", "")
                visit['ghl_url'] = f"https://app.gohighlevel.com/v2/location/{loc_id}/contacts/{visit['ghl_contact_id']}"
            visits.append(visit)
        
        self.send_json({"visits": visits, "count": len(visits)})
    
    def handle_get_by_zip(self, zip_code):
        """Get visits for specific zip"""
        if not zip_code:
            self.send_json({"error": "zip required"}, 400)
            return
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM business_visits 
            WHERE zip_code = ? 
            ORDER BY visit_date DESC
        """, (zip_code,))
        
        visits = [dict(row) for row in cursor.fetchall()]
        self.send_json({"zip": zip_code, "visits": visits, "count": len(visits)})
    
    def handle_get_stats(self):
        """Get territory stats"""
        conn = get_db()
        cursor = conn.cursor()
        
        # Total visits
        cursor.execute("SELECT COUNT(*) as total FROM business_visits")
        total = cursor.fetchone()['total']
        
        # By status
        cursor.execute("""
            SELECT visit_status, COUNT(*) as count 
            FROM business_visits 
            GROUP BY visit_status
        """)
        by_status = {row['visit_status']: row['count'] for row in cursor.fetchall()}
        
        # By zip
        cursor.execute("""
            SELECT zip_code, COUNT(*) as count 
            FROM business_visits 
            GROUP BY zip_code
        """)
        by_zip = {row['zip_code']: row['count'] for row in cursor.fetchall()}
        
        self.send_json({
            "total_visits": total,
            "by_status": by_status,
            "by_zip": by_zip
        })
    
    def handle_create_visit(self):
        """Create new visit from API"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
        except:
            self.send_json({"error": "Invalid JSON"}, 400)
            return
        
        sync = GHLComcastSync()
        visit_id = sync.add_visit(
            business_name=data.get('business_name', ''),
            zip_code=data.get('zip_code', ''),
            contact_name=data.get('contact_name', ''),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            notes=data.get('notes', ''),
            status=data.get('status', 'interested'),
            lat=data.get('lat'),
            lng=data.get('lng'),
            source=data.get('source', 'api')
        )
        
        self.send_json({"id": visit_id, "status": "created"}, 201)
    
    def handle_whatsapp_webhook(self):
        """Handle incoming WhatsApp messages"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            message = data.get('message', '')
            
            # TODO: Parse message using NLP
            # For now, just log it
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sync_log (action, table_name, status, message)
                VALUES (?, ?, ?, ?)
            """, ('whatsapp_webhook', 'incoming', 'received', message[:500]))
            conn.commit()
            
            self.send_json({"status": "received"})
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

def run_server(port=8081):
    server = HTTPServer(('127.0.0.1', port), APIHandler)
    print(f"Comcast CRM API running on http://127.0.0.1:{port}")
    print(f"  GET  /api/visits       - List all visits")
    print(f"  GET  /api/stats        - Territory stats")
    print(f"  POST /api/visits       - Create visit")
    print(f"  POST /api/whatsapp     - WhatsApp webhook")
    server.serve_forever()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    run_server(port)
