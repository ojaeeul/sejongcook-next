const fs = require('fs');
const members = JSON.parse(fs.readFileSync('./data/members.json', 'utf8'));
const completed = members.filter(m => ['delete', 'trash', 'hold', 'completed'].includes(m.status));
console.log(`Found ${completed.length} completed/trash/delete members`);
if (completed.length > 0) {
    console.log("Sample:", completed[0].name, completed[0].status);
}
