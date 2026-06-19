const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js';
let content = fs.readFileSync(file, 'utf8');

const currentInfoHtml = `        const infoHtml = \`
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                \${photoPreview}
                <div style="flex: 1; width: 100%;">
                    <div style="font-weight:700; font-size:1.1rem; color:#0f172a; margin-bottom:4px;">
                        \${m.name} <span style="font-size:0.85rem; color:#64748b; font-weight:400;">(\${m.phone || '번호없음'})</span>
                    </div>
                    <div style="font-size:0.9rem; color:#2563eb; margin-bottom:4px; cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:4px; padding:4px 8px; background:#eff6ff; border-radius:6px; border:1px solid #bfdbfe;" onclick="const el = document.getElementById('courses-\${m.id}'); if(el.style.display==='none'){el.style.display='flex';}else{el.style.display='none';}">
                        <span class="material-icons" style="font-size:16px;">expand_more</span> \${m.course || '과목 없음'}
                    </div>
                    <div style="font-weight:700; font-size: 0.8rem; \${hasFace ? 'color:#059669;' : 'color:#94a3b8;'} margin-top:4px;">
                        \${hasFace ? '<span class="material-icons" style="vertical-align:middle; font-size:14px;">check_circle</span> 등록 완료' : '<span class="material-icons" style="vertical-align:middle; font-size:14px;">cancel</span> 사진 미등록'}
                    </div>
                    <div id="courses-\${m.id}" style="display:none; width:100%;">
                        \${courseRowsHtml}
                    </div>
                </div>
            </div>
        \`;`;

const originalInfoHtml = `        const infoHtml = \`
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                \${photoPreview}
                <div style="flex: 1; width: 100%;">
                    <div style="font-weight:700; font-size:1.1rem; color:#0f172a; margin-bottom:4px;">
                        \${m.name} <span style="font-size:0.85rem; color:#64748b; font-weight:400;">(\${m.phone || '번호없음'})</span>
                    </div>
                    <div style="font-size:0.8rem; color:#475569; margin-bottom:4px;">\${m.course || '과목 없음'}</div>
                    <div style="font-weight:700; font-size: 0.8rem; \${hasFace ? 'color:#059669;' : 'color:#94a3b8;'}">
                        \${hasFace ? '<span class="material-icons" style="vertical-align:middle; font-size:14px;">check_circle</span> 등록 완료' : '<span class="material-icons" style="vertical-align:middle; font-size:14px;">cancel</span> 사진 미등록'}
                    </div>
                    \${courseRowsHtml}
                </div>
            </div>
        \`;`;

content = content.replace(currentInfoHtml, originalInfoHtml);
fs.writeFileSync(file, content, 'utf8');
console.log('Reverted infoHtml!');
