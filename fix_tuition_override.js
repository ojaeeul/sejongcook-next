const fs = require('fs');

function fixOverride(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');

    content = content.replace(/courseProgressList\[0\]\.count = currentProgressObj\.count;/g, 
        '// courseProgressList[0].count = currentProgressObj.count; // Removed to preserve displayCount progress logic');

    fs.writeFileSync(path, content, 'utf8');
}

fixOverride('public/sejong/tuition_v3.js');
fixOverride('public/sejong/tuition_v4.js');
console.log('Tuition override fixed');
