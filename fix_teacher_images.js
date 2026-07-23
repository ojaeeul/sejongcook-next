const fs = require('fs');
const path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const boxOpen = '<div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 5px; color: #333; font-size: 0.9em; text-align: left; box-sizing: border-box; width: 100%;">';
const boxClose = '</div>';
const defaultMissing = `${boxOpen}[자료 및 그림이 생략된 문제입니다. 정답을 참고해주세요.]${boxClose}`;

let fixCount = 0;

for (const key of Object.keys(data)) {
  for (let i = 0; i < data[key].length; i++) {
    const qObj = data[key][i];
    if (qObj.q.includes('<그림>') && !qObj.q.includes('<div') && !qObj.q.includes('<img')) {
      
      let replacement = defaultMissing;
      
      if (qObj.q.includes('다음 식단 작성의 순서를 바르게 나열한 것은?')) {
        replacement = `${boxOpen}[보기] a.영양기준량의 산출, b.식품섭취량의 산출, c.3식의 배분, d.식품구성, e.식단작성${boxClose}`;
      } else if (qObj.q.includes('식당의 면적을 구하면?')) {
        replacement = `${boxOpen}[조건] 1인당 소요 면적: 1.0㎡, 주방 등 제외${boxClose}`;
      } else if (qObj.q.includes('작업의 흐름이 순서대로연결된 것은?')) {
        replacement = `${boxOpen}[보기] ㄱ.준비대 ㄴ.개수대 ㄷ.배선대 ㄹ.가열대 ㅁ.냉장고${boxClose}`;
      } else if (qObj.q.includes('다음 원가요소에 따라 산출한 총원가로 옳은 것은?')) {
        replacement = `${boxOpen}직접재료비: 250,000원<br>직접노무비: 140,000원<br>직접경비: 40,000원<br>제조간접비: 120,000원<br>판매관리비: 60,000원${boxClose}`;
      }
      
      // Replace <그림> and any spaces before it
      qObj.q = qObj.q.replace(/\s*<그림>/, ' ' + replacement);
      fixCount++;
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Fixed ' + fixCount + ' <그림> placeholders.');
