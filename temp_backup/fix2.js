const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components}/**/*.{js,jsx,ts,tsx}');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace the ternary operator for fetch URLs
    content = content.replace(
        /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"]\/api\.php\?board=([\w-]+)['"]\s*:\s*['"]\/data\/[\w_]+\.json['"]/g,
        "'/api/admin/data/$1'"
    );
    
    // Replace the ternary operator for fetch URLs with fallback to /api/...
    content = content.replace(
        /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*['"]\/api\.php\?board=([\w-]+)['"]\s*:\s*['"]\/api\/[\w-]+\/data\/[\w-]+(?:\?t='\s*\+\s*Date\.now\(\))?['"]/g,
        "'/api/admin/data/$1'"
    );

    // Replace the ternary operator for fetch URLs with variables
    content = content.replace(
        /isProd\s*\?\s*['"]\/api\.php\?board=([\w-]+)['"]\s*:\s*['"].*?['"]/g,
        "'/api/admin/data/$1'"
    );

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});
