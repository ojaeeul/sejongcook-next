const fs = require('fs');

async function run() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/popups');
        if (!res.ok) throw new Error("Failed to fetch popups");
        const popups = await res.json();
        
        let found = false;
        for (let p of popups) {
            if (p.id === 5) {
                if (p.content && p.content.scheduleC) {
                    p.content.scheduleC.period = "제과기능사 / 제빵기능사 실기 품목";
                    p.content.scheduleC.time = "매주 2가지씩 집중 실습<br><span style=\"font-size:15px;color:#6b7280;display:inline-block;margin-top:2px;\">(10주과정)</span>";
                    found = true;
                }
            }
        }
        
        if (!found) {
            console.log("Popup ID 5 not found or has no scheduleC. Aborting.");
            return;
        }

        const postRes = await fetch('http://localhost:3000/api/admin/popups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(popups)
        });
        
        if (!postRes.ok) {
            console.error("Failed to update popups", await postRes.text());
        } else {
            console.log("Successfully updated popups in Supabase!");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
