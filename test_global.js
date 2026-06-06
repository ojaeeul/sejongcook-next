const fs = require('fs');

const code = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf-8');
const snippet = code.substring(code.indexOf('let globalLastRecordDateForSim = null;'), code.indexOf('if (isMarker || isRegular || isExtension) {') + 200);

console.log(snippet);
