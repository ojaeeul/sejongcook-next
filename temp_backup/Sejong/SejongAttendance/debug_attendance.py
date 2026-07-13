
import json
import os

data_dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/data'

def load_json(filename):
    with open(os.path.join(data_dir, filename), 'r', encoding='utf-8') as f:
        return json.load(f)

members = load_json('members.json')
attendance = load_json('attendance.json')

for m in members:
    mid = m['id']
    name = m['name']
    
    # Simple simulation of Feb 2026 stats
    reg_date = m.get('registeredDate', '2025-01-01')
    try:
        ry, rm, rd = map(int, reg_date.split('-'))
    except:
        ry, rm, rd = 2025, 1, 1
    
    carry = 0
    year, month = ry, rm
    while year < 2026 or (year == 2026 and month <= 2):
        month_key = f"{year}-{month:02d}"
        m_logs = [l for l in attendance if l['memberId'] == mid and l.get('date', '').startswith(month_key)]
        
        attendances = 0
        for l in m_logs:
            status = l.get('status', '')
            if status in ['present', 'absent', '10', '12', '2', '5', '7', '3', '9']:
                attendances += 1
            elif status in ['[', ']']:
                attendances += 1
            elif status == 'extension':
                # Jan count for 1769750865408 included extension?
                # Let's check sheet.html logic for extensions
                # 2106: const isExtension = l.status === 'extension' || ...
                # 2121: if (l.status === 'present' || isNumericPresent || isAbsent) rawPresent += attendanceIncrement;
                # Wait! Extensions are NOT included in rawPresent for carryover!
                pass
        
        total = carry + attendances
        vRaw = round(total * 10)
        
        m_J = 0
        m_P = 0
        if vRaw <= 80:
            m_J = 0
            m_P = vRaw / 10
        else:
            m_J = 8
            pRaw = vRaw - 80
            m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10
            
        if year == 2026 and month == 2:
            if m_J == 8 or m_P == 8:
                print(f"User: {name}, Month: {month_key}, Carry: {carry}, Attendances: {attendances}, J: {m_J}, P: {m_P}")
            
        carry = total
        month += 1
        if month > 12:
            month = 1
            year += 1
