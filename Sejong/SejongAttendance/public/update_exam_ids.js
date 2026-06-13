const fs = require('fs');

const examDataPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_data.json';
const membersDataPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/test_members.json';

const exams = JSON.parse(fs.readFileSync(examDataPath, 'utf8'));
const members = JSON.parse(fs.readFileSync(membersDataPath, 'utf8'));

function getHangulInitial(char) {
    if (!char || !char.match(/[가-힣]/)) return char ? char.toLowerCase() : '';
    const code = char.charCodeAt(0) - 44032;
    const choIdx = Math.floor(code / 588);
    const jungIdx = Math.floor((code - (choIdx * 588)) / 28);
    const choMap = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
    const jungMap = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
    let initial = choMap[choIdx];
    if (initial === "") initial = jungMap[jungIdx].charAt(0);
    return initial;
}

function generateId(name, resident_num) {
    if (!name) return "";
    let initials = "";
    const limit = Math.min(3, name.length);
    for(let i=0; i<limit; i++) initials += getHangulInitial(name.charAt(i));
    let res = "";
    if (resident_num) res = resident_num.split('-')[0].substring(0, 6);
    return initials + res;
}

let updated = false;

exams.forEach(exam => {
    if (exam.name && (!exam.genId || !exam.genPw)) {
        const member = members.find(m => m.name === exam.name);
        if (member) {
            const genId = generateId(member.name, member.resident_num);
            exam.genId = genId;
            exam.genPw = genId ? genId + '@' : '';
            updated = true;
        } else {
            const genId = generateId(exam.name, '');
            exam.genId = genId;
            exam.genPw = genId ? genId + '@' : '';
            updated = true;
        }
    }
});

if (updated) {
    fs.writeFileSync(examDataPath, JSON.stringify(exams, null, 2));
    console.log("Updated exam_data.json successfully.");
} else {
    console.log("No updates needed.");
}
