const http = require('http');

http.get('http://localhost:8000/api/members', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const members = JSON.parse(data);
        const trash = members.filter(m => m.status === 'trash' || m.status === 'completed');
        console.log(`Trash/Completed members: ${trash.length}`);
    });
});
