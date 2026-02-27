#!/usr/bin/env python3
"""
Comcast CRM API Server - Flask version for Railway
Serves map data and accepts WhatsApp webhook updates
"""

import json
import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3

# Add parent dir to path
sys.path.insert(0, '/Users/xfinch/.openclaw/workspace/comcast-crm')
from ghl_sync import GHLComcastSync

app = Flask(__name__)
CORS(app)

DB_PATH = "/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/health')
def health():
    return jsonify({"status": "ok", "service": "comcast-crm-api"})

@app.route('/api/visits')
def get_visits():
    """Get all visits with coordinates for map"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, business_name, contact_name, phone, email, 
               address, zip_code, lat, lng, visit_status, 
               visit_date, notes, ghl_contact_id, account_id_8498
        FROM business_visits
        WHERE lat IS NOT NULL AND lng IS NOT NULL
        ORDER BY visit_date DESC
    """)
    
    visits = []
    for row in cursor.fetchall():
        row_dict = dict(row)
        # Convert snake_case to camelCase for frontend compatibility
        visit = {
            '_id': str(row_dict['id']),
            'businessName': row_dict['business_name'],
            'contactName': row_dict['contact_name'],
            'phone': row_dict['phone'],
            'email': row_dict['email'],
            'address': row_dict['address'],
            'zip': row_dict['zip_code'],
            'lat': row_dict['lat'],
            'lng': row_dict['lng'],
            'status': row_dict['visit_status'],
            'visitDate': row_dict['visit_date'],
            'notes': row_dict['notes'],
            'ghlContactId': row_dict['ghl_contact_id'],
            'accountId8498': row_dict['account_id_8498'],
            'createdAt': row_dict['visit_date'],
            'updatedAt': row_dict['visit_date']
        }
        # Add deep link if GHL contact exists
        if visit['ghlContactId']:
            loc_id = os.getenv("GHL_COMCAST_LOCATION_ID", "")
            visit['ghlUrl'] = f"https://app.gohighlevel.com/v2/location/{loc_id}/contacts/{visit['ghlContactId']}"
        visits.append(visit)
    
    return jsonify({"visits": visits, "count": len(visits)})

@app.route('/api/visits/by-zip')
def get_by_zip():
    """Get visits for specific zip"""
    zip_code = request.args.get('zip', '')
    if not zip_code:
        return jsonify({"error": "zip required"}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM business_visits 
        WHERE zip_code = ? 
        ORDER BY visit_date DESC
    """, (zip_code,))
    
    visits = [dict(row) for row in cursor.fetchall()]
    return jsonify({"zip": zip_code, "visits": visits, "count": len(visits)})

@app.route('/api/stats')
def get_stats():
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
    
    return jsonify({
        "total_visits": total,
        "by_status": by_status,
        "by_zip": by_zip
    })

@app.route('/api/visits', methods=['POST'])
def create_visit():
    """Create new visit from API"""
    data = request.get_json()
    
    # Support both camelCase (frontend) and snake_case (legacy)
    business_name = data.get('businessName') or data.get('business_name', '')
    zip_code = data.get('zip') or data.get('zip_code', '')
    contact_name = data.get('contactName') or data.get('contact_name', '')
    account_id_8498 = data.get('accountId8498') or data.get('account_id_8498', '')
    
    sync = GHLComcastSync()
    visit_id = sync.add_visit(
        business_name=business_name,
        zip_code=zip_code,
        contact_name=contact_name,
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        address=data.get('address', ''),
        city=data.get('city', ''),
        notes=data.get('notes', ''),
        status=data.get('status', 'interested'),
        lat=data.get('lat'),
        lng=data.get('lng'),
        source=data.get('source', 'api'),
        account_id_8498=account_id_8498
    )
    
    return jsonify({"id": str(visit_id), "status": "created"}), 201

@app.route('/api/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages"""
    data = request.get_json()
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
    
    return jsonify({"status": "received"})

@app.route('/comcast/review')
def serve_review():
    """Serve review queue HTML"""
    return send_from_directory('.', 'review.html')

@app.route('/')
def serve_map():
    """Serve main map HTML"""
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    return send_from_directory(os.path.join(parent_dir, '..', 'comcast'), 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8081))
    app.run(host='0.0.0.0', port=port, debug=False)