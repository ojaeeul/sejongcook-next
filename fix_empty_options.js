const fs = require('fs');
const path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let count = 0;

for (const key of Object.keys(data)) {
  if (key.includes('주관식') || key.includes('오재을_')) continue;
  
  for (let i = 0; i < data[key].length; i++) {
    const qObj = data[key][i];
    
    if (qObj.q.includes('폐기율이 20%인 식품의 출고계수는 얼마인가?')) {
       // Fix the options array
       qObj.o = ["0.8", "1.0", "1.25", "1.5"];
       qObj.a = 3; // 1.25
       count++;
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ' + count + ' questions with empty string options.');
