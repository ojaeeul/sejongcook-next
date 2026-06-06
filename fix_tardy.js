const fs = require('fs');

const filesToPatch = [
    'public/sejong/sheet.html',
    'public/sejong/ledger.js',
    'public/sejong/tuition_v3.js',
    'Sejong/public/sheet.html',
    'Sejong/public/ledger.js',
    'Sejong/public/tuition_v3.js'
];

filesToPatch.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix r.status
    content = content.replace(/const isTardy = r\.status === 'tardy' \|\| strStatus\.includes\('지각'\) \|\| strStatus\.includes\('△'\);/g, 
                              "const isTardy = r.status === 'tardy' || r.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');");
                              
    // Fix l.status
    content = content.replace(/const isTardy = l\.status === 'tardy' \|\| strStatus\.includes\('지각'\) \|\| strStatus\.includes\('△'\);/g, 
                              "const isTardy = l.status === 'tardy' || l.status === 'late' || strStatus.includes('지각') || strStatus.includes('△');");
                              
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed isTardy in " + file);
});
