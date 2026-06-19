const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const cookingFiles = [basePath + 'practical_exam.html', basePath + 'practical_exam_skill.html'];
const bakingFiles = [basePath + 'exam.html', basePath + 'exam_skill.html'];

const cookingOptions = `
    <option value="ALL">전체보기</option>
    <option value="한식기능사">한식기능사</option>
    <option value="양식기능사">양식기능사</option>
    <option value="일식기능사">일식기능사</option>
    <option value="중식기능사">중식기능사</option>
    <option value="복어기능사">복어기능사</option>
    <option value="산업기사">산업기사</option>
    <option value="기능장">기능장</option>
    <option value="기타">기타</option>
`;

const bakingOptions = `
    <option value="ALL">전체보기</option>
    <option value="제과기능사">제과기능사</option>
    <option value="제빵기능사">제빵기능사</option>
    <option value="제과제빵기능사">제과제빵기능사</option>
    <option value="산업기사">산업기사</option>
    <option value="기능장">기능장</option>
    <option value="기타">기타</option>
`;

function replaceOptions(files, newOptions) {
    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        // We match <select id="courseFilter" ...> ... </select>
        // Use a regex to match the inner HTML of the select tag
        const regex = /(<select id="courseFilter"[^>]*>)([\s\S]*?)(<\/select>)/;
        content = content.replace(regex, `$1${newOptions}$3`);
        fs.writeFileSync(filePath, content, 'utf8');
    });
}

replaceOptions(cookingFiles, cookingOptions);
replaceOptions(bakingFiles, bakingOptions);

console.log('Dropdowns updated successfully.');
