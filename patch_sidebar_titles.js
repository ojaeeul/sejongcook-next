const fs = require('fs');
const path = require('path');

const dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Update exam.html link text
        if (content.includes('href="exam.html" id="navExam" class="nav-item">필기시험</a>')) {
            content = content.replace(/href="exam.html" id="navExam" class="nav-item">필기시험<\/a>/g, 'href="exam.html" id="navExam" class="nav-item">제과제빵시험</a>');
            modified = true;
        } else if (content.includes('>필기시험</a>')) { // fallback
            content = content.replace(/>필기시험<\/a>/g, '>제과제빵시험</a>');
            modified = true;
        }

        // Update practical_exam.html link text
        if (content.includes('href="practical_exam.html" id="navPracticalExam" class="nav-item">실기시험</a>')) {
            content = content.replace(/href="practical_exam.html" id="navPracticalExam" class="nav-item">실기시험<\/a>/g, 'href="practical_exam.html" id="navPracticalExam" class="nav-item">조리시험</a>');
            modified = true;
        } else if (content.includes('>실기시험</a>')) { // fallback
            content = content.replace(/>실기시험<\/a>/g, '>조리시험</a>');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
