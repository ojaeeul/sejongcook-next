const https = require('https');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const apiKey = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',')[0].trim() : process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("No API key"); process.exit(1); }
https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(JSON.parse(body).models.map(m => m.name)));
});
