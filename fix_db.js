const fs = require('fs');
const file = '/tmp/expense.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const emptyLeft = `
<div class="entry-line">
    <div class="date-col" contenteditable="true" spellcheck="false"></div>
    <div class="desc-col" contenteditable="true" spellcheck="false"></div>
    <div class="amount-col" contenteditable="true" spellcheck="false"></div>
    <div class="method-col" contenteditable="true" spellcheck="false"></div>
</div>
<div class="entry-line">
    <div class="date-col" contenteditable="true" spellcheck="false"></div>
    <div class="desc-col" contenteditable="true" spellcheck="false"></div>
    <div class="amount-col" contenteditable="true" spellcheck="false"></div>
    <div class="method-col" contenteditable="true" spellcheck="false"></div>
</div>
`;

const emptyCook = emptyLeft;

const emptyBake = `
<div class="entry-line">
    <div class="desc-col" contenteditable="true" spellcheck="false"></div>
    <div class="amount-col" contenteditable="true" spellcheck="false"></div>
    <div class="method-col" contenteditable="true" spellcheck="false"></div>
</div>
<div class="entry-line">
    <div class="desc-col" contenteditable="true" spellcheck="false"></div>
    <div class="amount-col" contenteditable="true" spellcheck="false"></div>
    <div class="method-col" contenteditable="true" spellcheck="false"></div>
</div>
`;

if (data.leftHTML) data.leftHTML = emptyLeft + data.leftHTML;
if (data.cookingHTML) data.cookingHTML = emptyCook + data.cookingHTML;
if (data.bakingHTML) data.bakingHTML = emptyBake + data.bakingHTML;

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Database updated.');
