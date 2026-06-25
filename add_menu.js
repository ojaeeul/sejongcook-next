const fs = require('fs');
const path = require('path');

const dir = './Sejong/SejongAttendance/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    
    // Check if it already exists
    if (content.includes('href="ai_analyzer.html"')) {
        return;
    }
    
    // Insert under Mobile App download
    const anchor = '<a href="app.html" id="navMobileApp" class="nav-item" target="_blank" style="color: #4ade80; font-weight: bold; background: rgba(74, 222, 128, 0.1);">📱 모바일 앱 다운로드</a>';
    const newMenu = '\n                <a href="ai_analyzer.html" id="navAiAnalyzer" class="nav-item" style="color: #3b82f6; font-weight: bold; background: rgba(59, 130, 246, 0.1);">🤖 AI 원서/전화번호 자동분석</a>';
    
    content = content.replace(anchor, anchor + newMenu);
    
    // If some files don't have mobile app, insert under nav-category 수강 관리
    if (!content.includes(anchor) || !content.includes(newMenu)) {
       const category = '<div class="nav-sub-menu show">';
       content = content.replace(category, category + newMenu);
    }
    
    fs.writeFileSync(p, content, 'utf8');
});
console.log('Added AI Menu to all HTML files!');
