const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');
const seoKeywords = ' 김포요리학원 세종요리제과기술학원 김포제과제빵학원 김포제빵학원 김포제과학원 취미요리 풍무동요리학원 사우동요리학원 운양동요리학원 구래동요리학원 고촌요리학원 김포요리 쿠킹클래스 원데이클래스 브런치 케익수업 가정요리';

async function updateAltTags() {
    try {
        const files = fs.readdirSync(dataDir);
        let updatedCount = 0;

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(dataDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                try {
                    const data = JSON.parse(content);
                    let changed = false;

                    const processItem = (item) => {
                        if (item && typeof item.content === 'string') {
                            // Find alt tags and append keywords if not already there
                            const newContent = item.content.replace(/alt="([^"]*)"/g, (match, p1) => {
                                if (!p1.includes('김포요리학원')) {
                                    return `alt="${p1}${seoKeywords}"`;
                                }
                                return match;
                            });
                            
                            if (newContent !== item.content) {
                                item.content = newContent;
                                changed = true;
                            }
                        }
                    };

                    if (Array.isArray(data)) {
                        data.forEach(processItem);
                    } else if (data && typeof data === 'object') {
                        processItem(data);
                    }

                    if (changed) {
                        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
                        console.log(`Updated images in ${file}`);
                        updatedCount++;
                    }
                } catch (e) {
                    // Ignore non-json or malformed files
                }
            }
        }
        console.log(`Done. Updated ${updatedCount} files.`);
    } catch (err) {
        console.error(err);
    }
}

updateAltTags();
