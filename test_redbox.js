const fs = require('fs');

const membersData = JSON.parse(fs.readFileSync('public/sejong/data/members.json', 'utf8'));
const syncData = JSON.parse(fs.readFileSync('.gemini/antigravity-ide/brain/926cbd20-c7c9-4870-98fb-b5ab54430cb9/scratch/syncData.json', 'utf8')); 
// wait I don't have syncData in node!
