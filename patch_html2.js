const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.html';
let content = fs.readFileSync(file, 'utf8');

const targetHtml = `            <div style="display:flex; gap:10px; margin-bottom: 20px;">
                <div class="search-box" style="flex:1; margin-bottom:0;">
                    <i class="material-icons">search</i>
                    <input type="text" id="searchInput" oninput="filterList()" placeholder="이름 또는 전화번호 뒷자리로 검색하세요...">
                </div>
                <select id="courseFilter" onchange="filterList()" style="padding: 15px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 1.1rem; background: #f8fafc; outline: none; min-width: 150px; color: #0f172a; cursor: pointer;">
                    <option value="ALL">전체보기 (과정 선택)</option>
                </select>
            </div>`;

const newHtml = `            <div style="display:flex; gap:10px; margin-bottom: 20px; width: 100%;">
                <div class="search-box" style="flex: 2; width: 70%; margin-bottom: 0;">
                    <i class="material-icons">search</i>
                    <input type="text" id="searchInput" oninput="filterList()" placeholder="이름 또는 전화번호 뒷자리로 검색하세요..." style="width: 100%; box-sizing: border-box;">
                </div>
                <select id="courseFilter" onchange="filterList()" style="flex: 1; width: 30%; padding: 15px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 1.1rem; background: #f8fafc; outline: none; color: #0f172a; cursor: pointer; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                    <option value="ALL">전체보기 (과정 선택)</option>
                </select>
            </div>`;

content = content.replace(targetHtml, newHtml);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched HTML layout!');
