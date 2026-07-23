require('dotenv').config({ path: '.env.local' });
const { generateQnaResponse } = require('./.next/server/app/api/admin/data/qna/route.js'); // Cannot easily import TS
