const fs = require('fs');
const code = fs.readFileSync('./public/sejong/tuition_v4.js', 'utf8');
const match = code.match(/const GLOBAL_DATA_ADJUSTMENTS = (\{[\s\S]*?\});/);
if (match) console.log(match[1]);
