const fs = require('fs');

const examHtmlPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.html';
const practicalHtmlPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/practical_exam.html';

function updateButtons(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "조리" with "필기", change icon to "edit"
    content = content.replace(
        /<span class="material-icons" style="font-size: 1.1rem;">restaurant<\/span>\s*조리/g,
        '<span class="material-icons" style="font-size: 1.1rem;">edit</span> 필기'
    );
    
    // Replace "제과제빵" with "실기", change icon to "pan_tool" or "handyman" or keep it something else.
    // Let's use "cookie" or "pan_tool" or "restaurant" ? 
    // "실기" = practical. Maybe "restaurant_menu" or "pan_tool". Let's use "pan_tool".
    content = content.replace(
        /<span class="material-icons" style="font-size: 1.1rem;">bakery_dining<\/span>\s*제과제빵/g,
        '<span class="material-icons" style="font-size: 1.1rem;">restaurant</span> 실기'
    );

    fs.writeFileSync(filePath, content, 'utf8');
}

updateButtons(examHtmlPath);
updateButtons(practicalHtmlPath);

console.log('Updated buttons to 필기/실기 successfully!');
