let currentStoredId = '';
let currentStoredPw = '';

document.addEventListener('DOMContentLoaded', () => {
    loadAdminAccount();
});

async function loadAdminAccount() {
    try {
        const res = await fetch('/api/sejong/settings', { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.adminAccount) {
                currentStoredId = data.adminAccount.id || '';
                currentStoredPw = data.adminAccount.pw || '';
                document.getElementById('currentIdDisplay').textContent = currentStoredId || '없음';
            }
        }
    } catch (e) {
        console.error("Failed to load admin account from API, falling back to localStorage:", e);
        
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('adminAccount');
            if (stored) {
                const parsed = JSON.parse(stored);
                currentStoredId = parsed.id || '';
                currentStoredPw = parsed.pw || '';
                document.getElementById('currentIdDisplay').textContent = currentStoredId || '없음';
            }
        } catch(e2) {}
    }
}

async function saveAdminAccount() {
    const newId = document.getElementById('adminId').value.trim();
    const newPw = document.getElementById('adminPw').value.trim();
    
    const id = newId || currentStoredId;
    const pw = newPw || currentStoredPw;
    
    if (!id || !pw) {
        alert("저장할 계정 정보가 유효하지 않습니다.");
        return;
    }
    
    // Save to localStorage as a fallback/quick access
    try {
        localStorage.setItem('adminAccount', JSON.stringify({ id, pw }));
    } catch(e) {}
    
    try {
        const res = await fetch('/api/sejong/settings', { cache: 'no-store' });
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

function togglePasswordVisibility() {
    const pwInput = document.getElementById('adminPw');
    const checkbox = document.getElementById('showPwCheckbox');
    if (checkbox.checked) {
        pwInput.type = 'text';
    } else {
        pwInput.type = 'password';
    }
}
