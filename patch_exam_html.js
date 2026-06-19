const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.html';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<button class="mp-btn" style="width: auto; height: auto; padding: 0 10px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-radius: 6px;" onclick="toggleViewAllPages()" id="viewAllPagesBtn">페이지 전체보기</button>`;

const newStr = `<select id="courseFilter" onchange="filterListByCourse()" class="mp-btn" style="width: auto; height: auto; padding: 5px 10px; font-size: 0.8rem; font-weight: 600; white-space: nowrap; color: #1e293b; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; outline: none;">
    <option value="ALL">전체보기</option>
</select>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content, 'utf8');
console.log('Patched exam.html');
