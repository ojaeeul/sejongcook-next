const fs = require('fs');
const members = JSON.parse(fs.readFileSync('./data/members.json', 'utf8'));
const statuses = new Set(members.map(m => m.status));
console.log("Unique statuses:", Array.from(statuses));
