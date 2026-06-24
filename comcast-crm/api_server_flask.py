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
    
    # Helper function to parse name for mail merge (first name includes Dr., last name separate)
    def parse_name_for_mail_merge(full_name):
        """Parse 'John Smith' or 'Dr. John Smith' into (first_name, last_name)"""
        if not full_name:
            return '', ''
        parts = full_name.strip().split()
        if len(parts) == 0:
            return '', ''
        if len(parts) == 1:
            return parts[0], ''
        # Check for Dr. prefix - keep it in first name
        if parts[0].lower() in ['dr.', 'dr']:
            if len(parts) >= 3:
                return f"{parts[0]} {parts[1]}", parts[2]
            else:
                return f"{parts[0]} {parts[1]}", ''
        # Standard: last part is last name, rest is first name
        return ' '.join(parts[:-1]), parts[-1]
    
    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers - MAIL MERGE FORMAT with separate first/last names
    writer.writerow([
        'ID', 'Business Name', 'Contact Name (Original)', 
        'First Name', 'Last Name',  # Primary contact for mail merge
        'Gatekeeper First Name', 'Gatekeeper Last Name',
        'Decision Maker First Name', 'Decision Maker Last Name',
        'Other Contacts (JSON)', 'Phone', 'Email',
        'Address', 'City', 'ZIP', 'Status', 'Visit Date',
        'Notes', 'GHL Contact ID', 'Account ID 8498', 'Source', 'Created At'
    ])
    
    # Write data
    for row in rows:
        # Parse contact_name into first/last for mail merge
        first_name, last_name = parse_name_for_mail_merge(row['contact_name'])
        
        # Use structured fields if available, otherwise fall back to parsed contact_name
        dm_first = row['decision_maker_first_name'] or first_name
        dm_last = row['decision_maker_last_name'] or last_name
        
        writer.writerow([
            row['id'],
            row['business_name'] or '',
            row['contact_name'] or '',
            dm_first,  # First Name (for mail merge)
            dm_last,   # Last Name (for mail merge)
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
def serve_root():
    """Serve reports page at root (for Tailscale /reports-page proxy)"""
    return serve_reports_page()

@app.route('/map')
def serve_map():
    """Serve main map HTML at /map"""
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    return send_from_directory(os.path.join(parent_dir, '..', 'comcast'), 'index.html')

# API routes for stripped paths (Tailscale /api proxy strips to root)
@app.route('/reports/stats')
def report_stats_stripped():
    """Get stats (for Tailscale /api proxy stripping)"""
    return report_stats()

@app.route('/reports/contacts')
def report_contacts_stripped():
    """Generate CSV report (for Tailscale /api proxy stripping)"""
    return report_contacts()

@app.route('/di-calculator')
def serve_di_calculator():
    """Serve DI Calculator HTML"""
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comcast DI Calculator</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            font-size: 1.3rem;
            text-align: center;
            margin-bottom: 5px;
            color: #1a1a1a;
        }
        .subtitle {
            text-align: center;
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 20px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .input-group {
            margin-bottom: 18px;
        }
        label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 6px;
            color: #333;
        }
        .hint {
            font-size: 0.75rem;
            color: #888;
            font-weight: normal;
        }
        input[type="number"], select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
        }
        input[type="number"]:focus, select:focus {
            outline: none;
            border-color: #0066cc;
        }
        .result-box {
            background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
            color: white;
            text-align: center;
            padding: 25px;
        }
        .result-label {
            font-size: 0.85rem;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .result-tier {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 10px 0;
        }
        .result-peak {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        .math-steps {
            font-size: 0.8rem;
            color: #555;
            line-height: 1.6;
        }
        .math-steps strong {
            color: #0066cc;
        }
        .validation {
            background: #f0f7ff;
            border-left: 4px solid #0066cc;
        }
        .validation h3 {
            margin-top: 0;
            font-size: 0.9rem;
            color: #0066cc;
        }
        .checklist {
            font-size: 0.8rem;
            color: #555;
        }
        .checklist-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px dashed #ddd;
        }
        .script-box {
            background: #fff8e6;
            border-left: 4px solid #f5a623;
            font-size: 0.8rem;
            color: #664d00;
        }
        .script-box strong {
            color: #333;
        }
        .quick-presets {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 10px;
        }
        .preset-btn {
            padding: 8px 4px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            font-size: 0.75rem;
            cursor: pointer;
            text-align: center;
        }
        .preset-btn:hover {
            border-color: #0066cc;
            background: #f0f7ff;
        }
        .preset-btn strong {
            display: block;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <h1>🎯 Comcast DI Calculator</h1>
    <p class="subtitle">From usage data to recommended tier</p>

    <div class="card">
        <div class="input-group">
            <label>Monthly Usage (GB) <span class="hint">— from Internet diagnostics</span></label>
            <input type="number" id="monthlyGB" value="1300" min="10" max="10000">
        </div>

        <div class="input-group">
            <label>Business Hours/Day <span class="hint">— hours they're actually open</span></label>
            <input type="number" id="hoursPerDay" value="10" min="1" max="24">
        </div>

        <div class="input-group">
            <label>Business Days/Month <span class="hint">— check daily graph, not 30</span></label>
            <input type="number" id="daysPerMonth" value="22" min="1" max="31">
        </div>

        <div class="input-group">
            <label>Peak Multiplier <span class="hint">— 4-5x (when everyone's online)</span></label>
            <select id="peakMultiplier">
                <option value="4">4x (Conservative)</option>
                <option value="5" selected>5x (Standard)</option>
            </select>
        </div>

        <div class="quick-presets">
            <button class="preset-btn" onclick="setPreset(100, 8, 22)"><strong>Light</strong>100GB</button>
            <button class="preset-btn" onclick="setPreset(500, 8, 22)"><strong>Std</strong>500GB</button>
            <button class="preset-btn" onclick="setPreset(1300, 10, 22)"><strong>Cafe</strong>1.3TB</button>
            <button class="preset-btn" onclick="setPreset(2500, 12, 26)"><strong>Heavy</strong>2.5TB</button>
        </div>
    </div>

    <div class="card result-box">
        <div class="result-label">Recommended DI Tier</div>
        <div class="result-tier" id="recommendedTier">100/100 Mbps</div>
        <div class="result-peak">Peak: <span id="peakMbps">67</span> Mbps (rounded up)</div>
    </div>

    <div class="card math-steps">
        <strong>Math Breakdown:</strong><br>
        <span id="monthlyGBDisplay">1,300</span> GB × 1,024 = <strong id="totalMB">1,331,200</strong> MB<br>
        ÷ <span id="daysDisplay">22</span> days = <strong id="mbPerDay">60,509</strong> MB/day<br>
        ÷ <span id="hoursDisplay">10</span> hrs = <strong id="mbPerHour">6,051</strong> MB/hr<br>
        ÷ 3,600 sec = <strong id="mbPerSec">1.68</strong> MB/s<br>
        × 8 = <strong id="avgMbps">13.4</strong> Mbps average<br>
        × <span id="multiplierDisplay">5</span> = <strong id="peakCalc">67.2</strong> Mbps peak
    </div>

    <div class="card validation">
        <h3>✓ Validation Check</h3>
        <p style="font-size:0.8rem;margin-top:0;color:#555;">"Your peak is ~<span id="validationPeak">67</span> Mbps. Let's verify device count:"</p>
        <div class="checklist">
            <div class="checklist-item"><span>Security cameras</span> <span>___ × 2-4 Mbps</span></div>
            <div class="checklist-item"><span>Computers/employees</span> <span>___ × 1-2 Mbps</span></div>
            <div class="checklist-item"><span>Guest WiFi devices</span> <span>___</span></div>
            <div class="checklist-item"><span>Streaming TVs</span> <span>___ × 5-10 Mbps</span></div>
        </div>
        <p style="font-size:0.75rem;margin-bottom:0;color:#888;font-style:italic;">
            If devices don't match → investigate secondary internet or usage patterns
        </p>
    </div>

    <div class="card script-box">
        <strong>💬 Sales Script:</strong><br><br>
        "I use a formula that gives us a good idea — it's not an exact science. We take your data usage, estimate your peak, then compare that to what we observe in your business. This helps us narrow down the right tier for you."
    </div>

    <script>
        function formatNumber(num, decimals = 0) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }

        function getRecommendedTier(peakMbps) {
            if (peakMbps <= 25) return '25/25 Mbps';
            if (peakMbps <= 50) return '50/50 Mbps';
            if (peakMbps <= 100) return '100/100 Mbps';
            if (peakMbps <= 200) return '200/200 Mbps';
            if (peakMbps <= 500) return '500/500 Mbps';
            return '1 Gbps/1 Gbps';
        }

        function calculate() {
            const monthlyGB = parseFloat(document.getElementById('monthlyGB').value) || 0;
            const hoursPerDay = parseFloat(document.getElementById('hoursPerDay').value) || 1;
            const daysPerMonth = parseFloat(document.getElementById('daysPerMonth').value) || 1;
            const peakMultiplier = parseFloat(document.getElementById('peakMultiplier').value) || 5;

            const totalMB = monthlyGB * 1024;
            const mbPerDay = totalMB / daysPerMonth;
            const mbPerHour = mbPerDay / hoursPerDay;
            const mbPerSec = mbPerHour / 3600;
            const avgMbps = mbPerSec * 8;
            const peakMbps = avgMbps * peakMultiplier;

            document.getElementById('monthlyGBDisplay').textContent = formatNumber(monthlyGB, 0);
            document.getElementById('totalMB').textContent = formatNumber(totalMB, 0);
            document.getElementById('daysDisplay').textContent = daysPerMonth;
            document.getElementById('mbPerDay').textContent = formatNumber(mbPerDay, 0);
            document.getElementById('hoursDisplay').textContent = hoursPerDay;
            document.getElementById('mbPerHour').textContent = formatNumber(mbPerHour, 0);
            document.getElementById('mbPerSec').textContent = formatNumber(mbPerSec, 2);
            document.getElementById('avgMbps').textContent = formatNumber(avgMbps, 1);
            document.getElementById('multiplierDisplay').textContent = peakMultiplier;
            document.getElementById('peakCalc').textContent = formatNumber(peakMbps, 1);

            document.getElementById('recommendedTier').textContent = getRecommendedTier(peakMbps);
            document.getElementById('peakMbps').textContent = formatNumber(peakMbps, 0);
            document.getElementById('validationPeak').textContent = formatNumber(peakMbps, 0);
        }

        function setPreset(gb, hours, days) {
            document.getElementById('monthlyGB').value = gb;
            document.getElementById('hoursPerDay').value = hours;
            document.getElementById('daysPerMonth').value = days;
            calculate();
        }

        document.getElementById('monthlyGB').addEventListener('input', calculate);
        document.getElementById('hoursPerDay').addEventListener('input', calculate);
        document.getElementById('daysPerMonth').addEventListener('input', calculate);
        document.getElementById('peakMultiplier').addEventListener('change', calculate);

        calculate();
    </script>
</body>
</html>"""

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8081))
    app.run(host='0.0.0.0', port=port, debug=False)