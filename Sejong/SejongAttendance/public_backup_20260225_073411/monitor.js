const API_BASE = '/api';
let currentInput = "";
const inputDisplay = document.getElementById('inputDisplay');
const statusMsg = document.getElementById('statusMsg');

function addNum(num) {
    if (currentInput.length < 4) {
        currentInput += num;
        updateDisplay();
    }
}

function clearNum() {
    currentInput = "";
    updateDisplay();
    statusMsg.textContent = "";
}

function updateDisplay() {
    // Show masked input or just numbers? Usually just numbers for 4-digit code.
    inputDisplay.textContent = currentInput;
}

async function submitAttendance() {
    if (currentInput.length !== 4) {
        showStatus("4자리 번호를 입력해주세요.", "red");
        return;
    }

    // 1. Find Member by phone (last 4 digits)
    try {
        const res = await fetch(`${API_BASE}/members`);
        const members = await res.json();

        // Assuming phone format is 010-XXXX-YYYY or just string. We look for endsWith.
        const member = members.find(m => m.phone && m.phone.endsWith(currentInput));

        if (!member) {
            showStatus("등록되지 않은 번호입니다.", "red");
            setTimeout(clearNum, 1000);
            return;
        }

        // 2. Submit Attendance
        const today = new Date().toISOString().split('T')[0];
        const postRes = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: member.id,
                date: today,
                status: 'present'
            })
        });

        if (postRes.ok) {
            showStatus(`반갑습니다, ${member.name}님! 출석되었습니다.`, "green");
            // Also suggest course specific msg based on member.course?
            setTimeout(clearNum, 2000);
        } else {
            showStatus("오류가 발생했습니다.", "red");
        }

    } catch (e) {
        console.error(e);
        showStatus("서버 연결 실패", "red");
    }
}

function showStatus(msg, color) {
    statusMsg.textContent = msg;
    statusMsg.style.color = color === "red" ? "#F44336" : "#4CAF50";
}
