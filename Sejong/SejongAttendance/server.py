import http.server
import socketserver
import json
import os
import re
from urllib.parse import urlparse, parse_qs

PORT = 8000
DIRECTORY = "."
DATA_DIR = os.path.join(DIRECTORY, 'data')

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # API Routes
        if parsed.path == '/api/members':
            self.handle_get_members()
            return
        elif parsed.path == '/api/attendance':
            self.handle_get_attendance()
            return
        elif parsed.path == '/api/holidays':
            self.handle_get_holidays()
            return
        elif parsed.path == '/api/payments':
            self.handle_get_payments()
            return
            
        # Serve static files from 'public' directory by default if not API
        if self.path == '/' or self.path == '/index.html':
            self.path = '/public/index.html'
        elif not self.path.startswith('/api') and not self.path.startswith('/data'):
            if os.path.exists(os.path.join(DIRECTORY, 'public', self.path.lstrip('/'))):
                self.path = '/public' + self.path

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/members':
            self.handle_save_member()
            return
        if path == '/api/attendance':
            self.handle_save_attendance()
            return
        if path == '/api/attendance/batch':
            self.handle_batch_attendance()
            return
            return
        if path == '/api/payments':
            self.handle_save_payment()
            return
        if path == '/api/holidays':
            self.handle_save_holiday()
            return
            
        self.send_error(404, "API Endpoint not found")

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/api/members':
            self.handle_delete_member()
            return
            
        self.send_error(404, "API Endpoint not found")

    def handle_delete_member(self):
        try:
            # Try to get ID from query
            qs = parse_qs(urlparse(self.path).query)
            member_id = qs.get('id', [None])[0]
            
            # If not in query, try body? (Uncommon for DELETE but possible)
            if not member_id:
                body = self.get_body()
                if body and body != "{}":
                    data = json.loads(body)
                    member_id = data.get('id')

            if not member_id:
                self.send_error(400, "Missing member ID")
                return

            members = self._read_json('members.json')
            initial_len = len(members)
            members = [m for m in members if str(m.get('id')) != str(member_id)]
            
            if len(members) < initial_len:
                self._write_json('members.json', members)
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def get_body(self):
        try:
            content_length = int(self.headers['Content-Length'])
            return self.rfile.read(content_length).decode('utf-8')
        except:
            return "{}"

    # -------------------------------------------------------------------------
    # Helper Methods
    # -------------------------------------------------------------------------

    def _read_json(self, filename):
        try:
            path = os.path.join(DATA_DIR, filename)
            if not os.path.exists(path):
                return []
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []

    def _write_json(self, filename, data):
        path = os.path.join(DATA_DIR, filename)
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # -------------------------------------------------------------------------
    # Handlers
    # -------------------------------------------------------------------------

    def handle_get_members(self):
        members = self._read_json('members.json')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(members).encode('utf-8'))

    def handle_save_member(self):
        try:
            body = self.get_body()
            data = json.loads(body)
            
            if 'id' not in data:
                import time
                data['id'] = str(int(time.time() * 1000))
                
            if 'registeredDate' not in data:
                 from datetime import date
                 data['registeredDate'] = str(date.today())

            members = self._read_json('members.json')
            
            existing_index = next((index for (index, d) in enumerate(members) if d["id"] == data["id"]), None)
            if existing_index is not None:
                members[existing_index] = data
            else:
                members.append(data)
            
            self._write_json('members.json', members)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'data': data}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def handle_get_attendance(self):
        qs = parse_qs(urlparse(self.path).query)
        target_date = qs.get('date', [None])[0]
        logs = self._read_json('attendance.json')
        if target_date:
            logs = [log for log in logs if log['date'] == target_date]
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(logs).encode('utf-8'))

    def handle_save_attendance(self):
        try:
            body = self.get_body()
            data = json.loads(body) # { memberId, date, status }
            
            logs = self._read_json('attendance.json')
            
            # Remove existing logic for same member/date
            # Simple approach: filter out old, append new
            # Optimization: check if exists
            
            existing_idx = -1
            for i, log in enumerate(logs):
                if log['memberId'] == data['memberId'] and log['date'] == data['date']:
                    existing_idx = i
                    break
            
            if existing_idx != -1:
                # Update or delete?
                if data['status'] == 'unchecked':
                    logs.pop(existing_idx)
                else:
                    logs[existing_idx]['status'] = data['status']
            else:
                if data['status'] != 'unchecked':
                    logs.append(data)
                
            self._write_json('attendance.json', logs)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def handle_batch_attendance(self):
        try:
            body = self.get_body()
            data = json.loads(body) # { memberId, dates: [], status }
            
            logs = self._read_json('attendance.json')
            memberId = data['memberId']
            status = data['status']
            dates = data['dates']

            # Update loop
            for d in dates:
                 # Find existing
                 existing_idx = -1
                 for i, log in enumerate(logs):
                     if log['memberId'] == memberId and log['date'] == d:
                         existing_idx = i
                         break
                 
                 if existing_idx != -1:
                     if status == 'unchecked':
                         logs.pop(existing_idx)
                         # Note: popping changes indices, but since we break inner loop and strict match by value, usually ok?
                         # Wait, if we pop, we must restart search or be careful? 
                         # Actually safest is to re-read or list comp.
                         # But for perf, let's just update in place or mark for deletion?
                         # Simple Python approach:
                         pass 
                     else:
                         logs[existing_idx]['status'] = status
                 else:
                     if status != 'unchecked':
                         logs.append({'memberId': memberId, 'date': d, 'status': status})
            
            # Clean up unchecked if needed (simple robust way: rebuild list)
            if status == 'unchecked':
                 # If we just popped inside loop, indexing might break.
                 # Better: filter at start?
                 # Re-implementation for robustness:
                 logs = [l for l in logs if not (l['memberId'] == memberId and l['date'] in dates)]
            
            self._write_json('attendance.json', logs)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))

        except Exception as e:
            self.send_error(500, str(e))



    def handle_get_payments(self):
        payments = self._read_json('payments.json')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payments).encode('utf-8'))

    def handle_save_payment(self):
        try:
            body = self.get_body()
            data = json.loads(body) # { memberId, year, month, status, amount, ... }
            payments = self._read_json('payments.json')
            
            # Find existing payment record for this member + year + month
            existing_idx = -1
            if 'memberId' in data and 'year' in data and 'month' in data:
                for i, p in enumerate(payments):
                    if (p.get('memberId') == data['memberId'] and 
                        str(p.get('year')) == str(data['year']) and 
                        str(p.get('month')) == str(data['month'])):
                        existing_idx = i
                        break
            
            if existing_idx != -1:
                # Update existing
                payments[existing_idx].update(data)
            else:
                # Add new
                payments.append(data)

            self._write_json('payments.json', payments)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    def handle_get_holidays(self):
        holidays = self._read_json('holidays.json')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(holidays).encode('utf-8'))

    def handle_save_holiday(self):
        try:
            body = self.get_body()
            # body: { date: "YYYY-MM-DD", isHoliday: true/false }
            data = json.loads(body)
            holidays = self._read_json('holidays.json')
            
            # Remove existing entry for that date if any
            holidays = [h for h in holidays if h['date'] != data['date']]
            
            if data['isHoliday']:
                holidays.append(data)
                
            self._write_json('holidays.json', holidays)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

print(f"Attendance Server running at http://localhost:{PORT}/")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
