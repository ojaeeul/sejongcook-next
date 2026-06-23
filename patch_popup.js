const fs = require('fs');

async function run() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/popups');
        if (!res.ok) throw new Error("Failed to fetch popups");
        const popups = await res.json();
        console.log(JSON.stringify(popups, null, 2));
    } catch(e) {
        console.error(e);
    }
}
run();
