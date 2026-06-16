#!/usr/bin/env python3
"""
Comcast CRM API Server - Flask version for Railway
Serves map data and accepts WhatsApp webhook updates
"""

import json
import os
import sys
import csv
import io
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, Response
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

@app.route('/api/reports/contacts')
def report_contacts():
    """Generate CSV report of contacts filtered by email/phone availability"""
    
    # Get filter parameters
    filter_type = request.args.get('filter', 'all')  # all, email_only, phone_only, both, missing_both
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Base query with new structured contact fields
    base_query = """
        SELECT 
            id,
            business_name,
            contact_name,
            phone,
            email,
            address,
            city,
            zip_code,
            visit_status,
            visit_date,
            notes,
            ghl_contact_id,
            account_id_8498,
            source,
            created_at,
            gatekeeper_first_name,
            gatekeeper_last_name,
            decision_maker_first_name,
            decision_maker_last_name,
            other_contacts
        FROM business_visits
        WHERE 1=1
    """
    
    # Apply filters
    params = []
    if filter_type == 'email_only':
        base_query += " AND (email IS NOT NULL AND email != '') AND (phone IS NULL OR phone = '')"
    elif filter_type == 'phone_only':
        base_query += " AND (phone IS NOT NULL AND phone != '') AND (email IS NULL OR email = '')"
    elif filter_type == 'both':
        base_query += " AND (email IS NOT NULL AND email != '') AND (phone IS NOT NULL AND phone != '')"
    elif filter_type == 'missing_both':
        base_query += " AND (email IS NULL OR email = '') AND (phone IS NULL OR phone = '')"
    # 'all' = no filter
    
    base_query += " ORDER BY visit_date DESC"
    
    cursor.execute(base_query, params)
    rows = cursor.fetchall()
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers with new structured contact fields
    writer.writerow([
        'ID', 'Business Name', 'Contact Name (Original)', 
        'Gatekeeper First Name', 'Gatekeeper Last Name',
        'Decision Maker First Name', 'Decision Maker Last Name',
        'Other Contacts (JSON)', 'Phone', 'Email',
        'Address', 'City', 'ZIP', 'Status', 'Visit Date',
        'Notes', 'GHL Contact ID', 'Account ID 8498', 'Source', 'Created At'
    ])
    
    # Write data
    for row in rows:
        writer.writerow([
            row['id'],
            row['business_name'] or '',
            row['contact_name'] or '',
            row['gatekeeper_first_name'] or '',
            row['gatekeeper_last_name'] or '',
            row['decision_maker_first_name'] or '',
            row['decision_maker_last_name'] or '',
            row['other_contacts'] or '',
            row['phone'] or '',
            row['email'] or '',
            row['address'] or '',
            row['city'] or '',
            row['zip_code'] or '',
            row['visit_status'] or '',
            row['visit_date'] or '',
            row['notes'] or '',
            row['ghl_contact_id'] or '',
            row['account_id_8498'] or '',
            row['source'] or '',
            row['created_at'] or ''
        ])
    
    # Prepare response
    output.seek(0)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"comcast_contacts_{filter_type}_{timestamp}.csv"
    
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename={filename}',
            'Content-Type': 'text/csv; charset=utf-8'
        }
    )

@app.route('/api/reports/stats')
def report_stats():
    """Get quick stats on contact data completeness"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM business_visits")
    total = cursor.fetchone()['total']
    
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email,
            SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as with_phone,
            SUM(CASE WHEN (email IS NOT NULL AND email != '') AND (phone IS NOT NULL AND phone != '') THEN 1 ELSE 0 END) as with_both,
            SUM(CASE WHEN (email IS NULL OR email = '') AND (phone IS NULL OR phone = '') THEN 1 ELSE 0 END) as with_neither
        FROM business_visits
    """)
    row = cursor.fetchone()
    
    return jsonify({
        "total_contacts": total,
        "with_email_only": row['with_email'] - row['with_both'],
        "with_phone_only": row['with_phone'] - row['with_both'],
        "with_both": row['with_both'],
        "with_neither": row['with_neither'],
        "filters_available": ["all", "email_only", "phone_only", "both", "missing_both"]
    })

@app.route('/reports')
def serve_reports_page():
    """Serve reports web interface"""
    return """<!DOCTYPE html>
<html>
<head>
    <title>Comcast CRM Reports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
        .card { background: white; border-radius: 8px; padding: 24px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 20px 0; }
        .stat-box { background: #f8f9fa; padding: 16px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; color: #0066cc; }
        .stat-label { font-size: 14px; color: #666; margin-top: 4px; }
        .btn { display: inline-block; padding: 12px 24px; margin: 8px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .btn:hover { background: #0052a3; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .btn-warning { background: #ffc107; color: #333; }
        .btn-warning:hover { background: #e0a800; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .filter-section { margin: 20px 0; }
        .filter-section h3 { margin-bottom: 12px; color: #555; }
    </style>
</head>
<body>
    <h1>📊 Comcast CRM Reports</h1>
    
    <div class="card">
        <h2>Contact Data Overview</h2>
        <div class="stat-grid" id="stats">
            <div class="stat-box">
                <div class="stat-number" id="total">-</div>
                <div class="stat-label">Total Contacts</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="both">-</div>
                <div class="stat-label">Email + Phone</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="email-only">-</div>
                <div class="stat-label">Email Only</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="phone-only">-</div>
                <div class="stat-label">Phone Only</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="missing-both">-</div>
                <div class="stat-label">Missing Both</div>
            </div>
        </div>
    </div>
    
    <div class="card">
        <h2>Download CSV Reports</h2>
        <p>Export contacts with structured fields (Gatekeeper, Decision Maker, etc.)</p>
        
        <div class="filter-section">
            <h3>By Contact Info</h3>
            <a href="/api/reports/contacts?filter=both" class="btn btn-success">📧📞 Has Both</a>
            <a href="/api/reports/contacts?filter=email_only" class="btn">📧 Email Only</a>
            <a href="/api/reports/contacts?filter=phone_only" class="btn btn-secondary">📞 Phone Only</a>
            <a href="/api/reports/contacts?filter=missing_both" class="btn btn-warning">⚠️ Missing Both</a>
            <a href="/api/reports/contacts?filter=all" class="btn btn-danger">📋 All Contacts</a>
        </div>
    </div>
    
    <div class="card">
        <h2>🔗 Quick Links</h2>
        <a href="/comcast/review" class="btn btn-secondary">Review Queue</a>
        <a href="/" class="btn btn-secondary">🗺️ Territory Map</a>
    </div>
    
    <script>
        // Load stats on page load
        fetch('/api/reports/stats')
            .then(r => r.json())
            .then(data => {
                document.getElementById('total').textContent = data.total_contacts;
                document.getElementById('both').textContent = data.with_both;
                document.getElementById('email-only').textContent = data.with_email_only;
                document.getElementById('phone-only').textContent = data.with_phone_only;
                document.getElementById('missing-both').textContent = data.with_neither;
            })
            .catch(err => console.error('Failed to load stats:', err));
    </script>
</body>
</html>"""

@app.route('/')
def serve_map():
    """Serve main map HTML"""
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    return send_from_directory(os.path.join(parent_dir, '..', 'comcast'), 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8081))
    app.run(host='0.0.0.0', port=port, debug=False)