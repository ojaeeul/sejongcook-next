const fs = require('fs');

function updateFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');

    // Replace getCycle in shared_calc.js
    content = content.replace(/if \(vRaw < 170\) return 0;\s*return Math\.floor\(\(vRaw - 170\) \/ 170\) \+ 1;/g, 
        'if (vRaw < 170) return 0;\n                return Math.floor((vRaw - 170) / 160) + 1;');
    content = content.replace(/if \(vRaw < 90\) return 0;\s*return Math\.floor\(\(vRaw - 90\) \/ 90\) \+ 1;/g, 
        'if (vRaw < 90) return 0;\n                return Math.floor((vRaw - 90) / 80) + 1;');

    // Replace getCycle in sms_v3.js
    content = content.replace(/if \(vRaw < 170\) return 0;\s*return Math\.floor\(\(vRaw - 170\) \/ 170\) \+ 1;/g, 
        'if (vRaw < 170) return 0;\n                    return Math.floor((vRaw - 170) / 160) + 1;');
    content = content.replace(/if \(vRaw < 90\) return 0;\s*return Math\.floor\(\(vRaw - 90\) \/ 90\) \+ 1;/g, 
        'if (vRaw < 90) return 0;\n                    return Math.floor((vRaw - 90) / 80) + 1;');

    fs.writeFileSync(path, content, 'utf8');
}

updateFile('public/sejong/shared_calc.js');
updateFile('public/sejong/sms_v3.js');
console.log('Cycles updated');
