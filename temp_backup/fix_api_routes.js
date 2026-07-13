const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.includes('.git') && !dirPath.includes('.next') && !dirPath.includes('node_modules')) {
          walkDir(dirPath, callback);
      }
    } else {
        if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            callback(path.join(dir, f));
        }
    }
  });
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace: const url = process.env.NODE_ENV === 'production' ? '/api.php?board=qna' : '/data/qna_data.json';
    // With: const url = '/api/admin/data/qna';
    content = content.replace(
        /process\.env\.NODE_ENV\s*===\s*'production'\s*\?\s*['"]\/api\.php\?board=([^'"]+)['"]\s*:\s*['"][^'"]+['"]/g,
        "'/api/admin/data/$1'"
    );

    content = content.replace(
        /process\.env\.NODE_ENV\s*===\s*"production"\s*\?\s*['"]\/api\.php\?board=([^'"]+)['"]\s*:\s*['"][^'"]+['"]/g,
        "'/api/admin/data/$1'"
    );

    // Template literals: `/api.php?board=qna&id=${id}` : `/api/admin/data/qna?id=${id}`
    // Replace with the second part.
    content = content.replace(
        /process\.env\.NODE_ENV\s*===\s*'production'\s*\?\s*`\/api\.php\?board=[^&]+&id=\$\{id\}`\s*:\s*(`\/api\/admin\/data\/[^?]+\?id=\$\{id\}`)/g,
        "$1"
    );

    // Handle isProd variables used in endpoints:
    // const endpoint = isProd ? '/api.php?board=qna' : '/api/admin/data/qna';
    // const qnaUrl = isProd ? '/api.php?board=qna' : '/data/qna_data.json';
    content = content.replace(
        /isProd\s*\?\s*['"]\/api\.php\?board=([^'"]+)['"]\s*:\s*['"][^'"]+['"]/g,
        "'/api/admin/data/$1'"
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}

walkDir('./app', fixFile);
walkDir('./components', fixFile);

