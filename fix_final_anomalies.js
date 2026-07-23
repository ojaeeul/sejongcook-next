const fs = require('fs');
const path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const boxOpen = '<div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 5px; color: #333; font-size: 0.9em; text-align: left; box-sizing: border-box; width: 100%;">';
const boxClose = '</div>';

let count = 0;

for (const key of Object.keys(data)) {
  for (let i = 0; i < data[key].length; i++) {
    const qObj = data[key][i];
    
    if (qObj.q.includes('파이를 구운 후 다음과 같은 결함이 나타났을 때') && qObj.q.includes('<표>')) {
      qObj.q = qObj.q.replace(/\s*<표>/, ` ${boxOpen}[결함: 바닥 껍질이 젖어 있다]${boxClose}`);
      count++;
    }
    
    if (qObj.q.includes('다음의 조건에서 물온도를 계산하면?') && qObj.q.includes('<표>')) {
      qObj.q = qObj.q.replace(/\s*<표>/, ` ${boxOpen}희망 반죽 온도: 27℃<br>실내 온도: 26℃<br>밀가루 온도: 26℃<br>마찰계수: 26${boxClose}`);
      count++;
    }
    
    if (qObj.q.includes('냉동반죽의 제조공정에 관한 설명중 옳은 것은?') && qObj.o && qObj.o.length === 3) {
      qObj.o = [
        "혼합 후 반죽의 발효시간은 1시간30분이 표준발효시간이다.",
        "반죽 혼합 후 반죽 온도는 18~24℃가 되도록 한다.",
        "반죽을 -40℃까지 급속냉동시키면 이스트의 냉동에 대한 장해가 크다.",
        "해동은 고온다습한 곳에서 급속하게 진행시킨다."
      ];
      qObj.a = 2; // 2nd option is correct
      count++;
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ' + count + ' final anomalies.');
