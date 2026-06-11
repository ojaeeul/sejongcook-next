const fs = require('fs');
fetch('http://localhost:3000/api/sejong/settings').then(r=>r.json()).then(data => {
    let settings = data;
    let target = Array.isArray(settings) ? (settings[0] || {}) : settings;
    
    // Force inject cycleRules
    target.cycleRules = {
        default: 9,
        custom: [
            { keyword: "제과제빵", cycle: 17 }
        ]
    };
    
    if (Array.isArray(settings) && settings.length === 0) {
        settings.push(target);
    }
    
    return fetch('http://localhost:3000/api/sejong/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    });
}).then(r => r.json()).then(console.log).catch(console.error);
