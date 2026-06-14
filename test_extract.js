const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `
<div id="cooking">
    <div class="entry-line"><div class="date-col">6/14(일)</div><div class="desc-col">정태일</div></div>
    <div class="entry-line"><div class="date-col"></div><div class="desc-col">전태일</div></div>
    <div class="entry-line"><div class="date-col"></div><div class="desc-col"></div></div>
    <div class="entry-line"><div class="date-col"></div><div class="desc-col"></div></div>
</div>
<div id="baking">
    <div class="entry-line"><div class="desc-col"></div></div>
    <div class="entry-line"><div class="desc-col"></div></div>
    <div class="entry-line"><div class="desc-col"></div></div>
    <div class="entry-line"><div class="desc-col"></div></div>
</div>
`;

const dom = new JSDOM(html);
const document = dom.window.document;

const cookingContainer = document.getElementById('cooking');
const bakingContainer = document.getElementById('baking');

const extractItems = (container, isBaking = false, cookItemsForDate = null) => {
    if (!container) return [];
    const items = [];
    let lastDate = '';
    
    Array.from(container.children).forEach((line, index) => {
        let dateStr = '';
        if (isBaking && cookItemsForDate && cookItemsForDate[index]) {
            dateStr = cookItemsForDate[index].date;
        } else {
            const dateCol = line.querySelector('.date-col');
            dateStr = dateCol ? dateCol.textContent.trim() : '';
        }
        
        const descCol = line.querySelector('.desc-col');
        const desc = descCol ? descCol.textContent.trim() : '';
        
        if (dateStr) lastDate = dateStr;
        
        if (desc || dateStr) {
            items.push({ date: lastDate, desc });
        }
    });
    return items;
};

const cookItemsAllRaw = [];
let cookLastDateRaw = '';
Array.from(cookingContainer.children).forEach(line => {
    const dCol = line.querySelector('.date-col');
    const ds = dCol ? dCol.textContent.trim() : '';
    if (ds) cookLastDateRaw = ds;
    cookItemsAllRaw.push({ date: cookLastDateRaw });
});

const cookItems = extractItems(cookingContainer);
const bakeItems = extractItems(bakingContainer, true, cookItemsAllRaw);

console.log("Cook Items:", cookItems);
console.log("Bake Items:", bakeItems);
