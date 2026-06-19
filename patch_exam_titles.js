const fs = require('fs');

const examHtmlPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.html';
const practicalHtmlPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/practical_exam.html';

// 1. Update exam.html -> 제과제빵시험
let examContent = fs.readFileSync(examHtmlPath, 'utf8');
examContent = examContent.replace(/<title>세종요리제과학원 - 필기시험 관리<\/title>/g, '<title>세종요리제과학원 - 제과제빵시험 관리</title>');
examContent = examContent.replace(/<h1 class="page-title-text" style="margin: 0;">필기시험<\/h1>/g, '<h1 class="page-title-text" style="margin: 0;">제과제빵시험</h1>');
examContent = examContent.replace(/<h1 class="page-title-text">필기시험<\/h1>/g, '<h1 class="page-title-text">제과제빵시험</h1>');
// Update sidebar links in exam.html
examContent = examContent.replace(/>필기시험<\/a>/g, '>제과제빵시험</a>');
examContent = examContent.replace(/>실기시험<\/a>/g, '>조리시험</a>');
fs.writeFileSync(examHtmlPath, examContent, 'utf8');

// 2. Update practical_exam.html -> 조리시험
let practicalContent = fs.readFileSync(practicalHtmlPath, 'utf8');
practicalContent = practicalContent.replace(/<title>세종요리제과학원 - 실기시험 관리<\/title>/g, '<title>세종요리제과학원 - 조리시험 관리</title>');
practicalContent = practicalContent.replace(/<h1 class="page-title-text" style="margin: 0;">실기시험<\/h1>/g, '<h1 class="page-title-text" style="margin: 0;">조리시험</h1>');
practicalContent = practicalContent.replace(/<h1 class="page-title-text">실기시험<\/h1>/g, '<h1 class="page-title-text">조리시험</h1>');
// Update sidebar links in practical_exam.html
practicalContent = practicalContent.replace(/>필기시험<\/a>/g, '>제과제빵시험</a>');
practicalContent = practicalContent.replace(/>실기시험<\/a>/g, '>조리시험</a>');
fs.writeFileSync(practicalHtmlPath, practicalContent, 'utf8');

console.log('Patched titles successfully!');
