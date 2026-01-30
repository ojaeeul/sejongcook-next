const fs = require('fs');
const path = require('path');

// Config
const legacyBase = '/Users/ojaeeul/Downloads/세종요리제과학원/구버전/무제 폴더/sejongcook_호스팅';
const outputDir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejongcook_1/sejongcook-next/data';

// Helper to clean extracted text
function clean(str) {
    if (!str) return '';
    return str.trim();
}

// 1. Q&A (sub0602)
function migrateQnA() {
    console.log("Migrating Q&A...");
    const listFile = path.join(legacyBase, 'bbs/sub0602.html');
    const outputFile = path.join(outputDir, 'qna_data.json');

    if (!fs.existsSync(listFile)) { console.log("Skipping QnA (Main file not found)"); return; }

    // We will parse the LIST file first. 
    // And if there are Detail files (bbs_shop/read...sub0602), we would fetch them.
    // For now, let's look for the detail files pattern or just list items if it's simple.
    // Assuming structure similar to sub0601 list.

    const html = fs.readFileSync(listFile, 'utf8');
    const items = [];

    // Regex for list items - adapting from sub0601 logic
    // Pattern: <div class="td col_no">...</div>...idx=([0-9]+)...<span>(Title)</span>...col_name">(Name)</div>...col_date">(Date)</div>
    const regex = /<div class="td col_no">([0-9]+)<\/div>[\s\S]*?idx=([0-9]+)\.htm"[\s\S]*?<span>(.*?)<\/span>[\s\S]*?col_name">([\s\S]*?)<\/div>[\s\S]*?col_date">(.*?)<\/div>[\s\S]*?col_hit"><span class="txt">.*?:<\/span>(.*?)<\/div>/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
        items.push({
            id: match[2].trim(),
            title: match[3].trim(),
            author: match[4].trim(),
            date: match[5].trim(),
            hit: match[6].trim(),
            content: "내용 없음 (Migration: Detail content extraction pending if needed)" // Placeholder unless we do full deep scan again
        });
    }

    // Try to find detail content similar to notice migration
    // We need to look in bbs_shop for read...sub0602...
    const shopDir = path.join(legacyBase, 'bbs_shop');
    const files = fs.readdirSync(shopDir);

    items.forEach(item => {
        const detailFile = files.find(f => f.includes(`idx=${item.id}`) && f.includes('board_code=sub0602') && f.startsWith('read'));
        if (detailFile) {
            const detailHtml = fs.readFileSync(path.join(shopDir, detailFile), 'utf8');
            const contentStart = '<div id="conbody" class="conbody">';
            const contentEnd = '<!-- // contents body -->';
            let content = detailHtml.split(contentStart)[1]?.split(contentEnd)[0];
            if (content) {
                // Fix relative images
                content = content.replace(/\.\.\/img_up/g, '/img_up');
                if (content.endsWith('</div>')) content = content.substring(0, content.lastIndexOf('</div>'));
                item.content = content.trim();
            }
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(items, null, 4));
    console.log(`Saved ${items.length} Q&A items.`);
}

// 2. Related Sites (sub0603) - Likely a static page content, not a board
function migrateSites() {
    console.log("Migrating Sites...");
    const file = path.join(legacyBase, 'page/sub0603.html');
    const outputFile = path.join(outputDir, 'sites_data.json');

    if (!fs.existsSync(file)) return;

    const html = fs.readFileSync(file, 'utf8');

    // This is likely a static page content div
    // Look for <div class="sub_con_body"> or similar container
    // Or just manually extract the links if it's a list.
    // Let's dump the "content" part for a Single Page view.

    // Trying to find main content block
    // Often in 'layout_...' or 'body content'
    // Let's assume user wants the HTML content to put in a 'Post' object for BoardView or just raw HTML.

    // Actually, sub0603 is "Related Sites". If it's a list of links table, let's extract that.
    // Simple approach: Extract the main container and save as a single "post" for now?
    // Or if it IS a board (unlikely for "page/sub0603"), treat as board. `page` dir implies static.

    // Let's extract the main content area.
    // content search: <!-- ---------------   layout in : body content : ... -->
    const contentMarker = '<!-- ---------------   layout in : body content';
    const split = html.split(contentMarker);
    if (split.length > 1) {
        let content = split[1];
        // naive truncation until footer or similar
        const endMarker = '<!-- ---------------    실선'; // Common footer start
        content = content.split(endMarker)[0];

        content = content.replace(/\.\.\/img_up/g, '/img_up');

        const data = [{
            id: "1",
            title: "관련사이트",
            author: "관리자",
            date: "2024-01-01",
            hit: "0",
            content: content.trim()
        }];

        fs.writeFileSync(outputFile, JSON.stringify(data, null, 4));
        console.log("Saved Sites page content.");
    }
}

// 3. Hall of Fame (sub0604) - Board
function migrateHonor() {
    console.log("Migrating Honor...");
    const listFile = path.join(legacyBase, 'bbs/sub0604.html');
    const outputFile = path.join(outputDir, 'honor_data.json');
    if (!fs.existsSync(listFile)) return;

    const html = fs.readFileSync(listFile, 'utf8');
    const items = [];

    // Regex same as others? Or gallery style?
    // Gallery usually has different markup.
    // Searching for <div class="txt_subject"> or similar if gallery.
    // If standard list:
    const regex = /<div class="td col_no">([0-9]+)<\/div>[\s\S]*?idx=([0-9]+)\.htm"[\s\S]*?<span>(.*?)<\/span>[\s\S]*?col_name">([\s\S]*?)<\/div>[\s\S]*?col_date">(.*?)<\/div>/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
        items.push({
            id: match[2].trim(),
            title: match[3].trim(),
            author: match[4].trim(),
            date: match[5].trim(),
            hit: "0", // optional fetch
            content: ""
        });
    }

    // Detail extraction
    const shopDir = path.join(legacyBase, 'bbs_shop');
    if (fs.existsSync(shopDir)) {
        const files = fs.readdirSync(shopDir);
        items.forEach(item => {
            const detailFile = files.find(f => f.includes(`idx=${item.id}`) && f.includes('board_code=sub0604'));
            if (detailFile) {
                const detailHtml = fs.readFileSync(path.join(shopDir, detailFile), 'utf8');
                const start = '<div id="conbody" class="conbody">';
                const end = '<!-- // contents body -->';
                let content = detailHtml.split(start)[1]?.split(end)[0];
                if (content) {
                    content = content.replace(/\.\.\/img_up/g, '/img_up');
                    if (content.endsWith('</div>')) content = content.substring(0, content.lastIndexOf('</div>'));
                    item.content = content.trim();
                }
            }
        });
    }

    fs.writeFileSync(outputFile, JSON.stringify(items, null, 4));
    console.log(`Saved ${items.length} Honor items.`);
}

migrateQnA();
migrateSites();
migrateHonor();
