import re
import os

filepath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add todayAttendance variable
if 'let todayAttendance = [];' not in content:
    content = content.replace('let adminMembers = [];', 'let adminMembers = [];\nlet todayAttendance = [];')

# 2. Update fetchMembers
fetch_replacement = """async function fetchMembers() {
    const listEl = document.getElementById('memberList');
    listEl.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">데이터를 불러오는 중입니다...</div>';
    
    try {
        const res = await fetch(getFetchUrl('members'));
        const rawMembers = await res.json();
        adminMembers = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        
        const attRes = await fetch(getFetchUrl('attendance'));
        const rawAtt = await attRes.json();
        
        // Use local timezone date (KST)
        const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
        todayAttendance = Array.isArray(rawAtt) ? rawAtt.filter(a => a.date === today && a.status !== 'unchecked') : [];
        
        renderList();
    } catch(e) {
        listEl.innerHTML = '<div style="color:red; text-align:center; padding:40px;">데이터 로딩에 실패했습니다. 관리자에게 문의하세요.</div>';
    }
}"""

content = re.sub(r'async function fetchMembers\(\) \{.*?(?=function renderList)', fetch_replacement + '\n\n', content, flags=re.DOTALL)


# 3. Update renderList
renderListPattern = re.compile(r'(const item = document.createElement\(\'div\'\);\s+item.className = \'member-item\';\s+)(const photoPreview = .*?)(const infoHtml = `.*?</div>\s+</div>\s+`;)(.*?)(const actionHtml = .*?</div>\s+`;)', re.DOTALL)

def renderListReplacer(match):
    m1 = match.group(1)
    m2 = match.group(2)
    m3 = match.group(3)
    m4 = match.group(4)
    m5 = match.group(5)
    
    if 'const isAttended' not in m1:
        addition = """
        const isAttended = todayAttendance.some(a => String(a.memberId) === String(m.id));
        const attBadge = isAttended 
            ? `<div style="margin-top:5px;"><span style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-size: 0.85rem; font-weight: bold;"><span class="material-icons" style="font-size:14px;">login</span> 로그인 (출석완료)</span></div>`
            : `<div style="margin-top:5px;"><span style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-size: 0.85rem; font-weight: bold;"><span class="material-icons" style="font-size:14px;">logout</span> 로그아웃 (출석 전)</span></div>`;
        
        const forceActionBtn = isAttended
            ? `<button class="btn" style="background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;" onclick="forceLogout('${m.id}', '${m.course}')"><span class="material-icons" style="font-size:18px;">logout</span> 강제 로그아웃</button>`
            : `<button class="btn" style="background:#f0fdf4; color:#16a34a; border:1px solid #86efac;" onclick="forceLogin('${m.id}', '${m.course}')"><span class="material-icons" style="font-size:18px;">login</span> 강제 로그인</button>`;
        """
        
        # Inject attBadge into infoHtml
        m3_new = m3.replace('</div>\n                </div>\n            </div>', '</div>\n                    ${attBadge}\n                </div>\n            </div>')
        
        # Inject forceActionBtn into actionHtml
        m5_new = m5.replace('</div>\n        `;', '\n                ${forceActionBtn}\n            </div>\n        `;')
        
        return m1 + addition + m2 + m3_new + m4 + m5_new
    return match.group(0)

content = renderListPattern.sub(renderListReplacer, content)


# 4. Add forceLogin and forceLogout functions
if 'window.forceLogin' not in content:
    force_funcs = """

window.forceLogin = async function(memberId, course) {
    if (!confirm('해당 학생을 오늘 날짜로 강제 출석(로그인) 처리하시겠습니까?')) return;
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    try {
        const res = await fetch(getFetchUrl('attendance', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, date: today, status: 'present', course: course || 'ALL' })
        });
        if (res.ok) {
            localStorage.removeItem('sejong_attendance_sync');
            fetchMembers();
        }
    } catch (e) {
        alert('처리 중 오류가 발생했습니다.');
    }
};

window.forceLogout = async function(memberId, course) {
    if (!confirm('해당 학생의 오늘 출석 기록을 강제로 삭제(로그아웃) 하시겠습니까?')) return;
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    try {
        const res = await fetch(getFetchUrl('attendance/batch', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, dates: [today], status: 'unchecked', course: 'ALL' })
        });
        if (res.ok) {
            localStorage.removeItem('sejong_attendance_sync');
            fetchMembers();
        }
    } catch (e) {
        alert('처리 중 오류가 발생했습니다.');
    }
};
"""
    content += force_funcs

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("kiosk_admin.js updated successfully.")
