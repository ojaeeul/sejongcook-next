document.addEventListener('DOMContentLoaded', () => {
    loadAdminAccount();
});

async function loadAdminAccount() {
    try {
        const res = await fetch('/api/sejong/settings');
        if (res.ok) {
            const data = await res.json();
            if (data.adminAccount) {
                document.getElementById('adminId').value = data.adminAccount.id || '';
                document.getElementById('adminPw').value = data.adminAccount.pw || '';
            }
        }
    } catch (e) {
        console.error("Failed to load admin account from API, falling back to localStorage:", e);
        
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('adminAccount');
            if (stored) {
                const parsed = JSON.parse(stored);
                document.getElementById('adminId').value = parsed.id || '';
                document.getElementById('adminPw').value = parsed.pw || '';
            }
        } catch(e2) {}
    }
}

async function saveAdminAccount() {
    const id = document.getElementById('adminId').value.trim();
    const pw = document.getElementById('adminPw').value.trim();
    
    if (!id || !pw) {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }
    
    // Save to localStorage as a fallback/quick access
    try {
        localStorage.setItem('adminAccount', JSON.stringify({ id, pw }));
    } catch(e) {}
    
    try {
        const res = await fetch('/api/sejong/settings');
        let currentSettings = {};
        if (res.ok) {
            currentSettings = await res.json();
        }
        
        currentSettings.adminAccount = { id, pw };
        
        const saveRes = await fetch('/api/sejong/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentSettings)
        });
        
        if (saveRes.ok) {
            alert("아이디와 비밀번호가 성공적으로 변경되었습니다.");
        } else {
            throw new Error("Save failed");
        }
    } catch (e) {
        console.error("Failed to save to API:", e);
        alert("로컬 저장소에는 저장되었으나, 서버 동기화에 실패했습니다.");
    }
}
