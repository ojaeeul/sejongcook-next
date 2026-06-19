const fs = require('fs');
const path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';

let logicContent = fs.readFileSync(path + 'expense_logic.js', 'utf8');

if (!logicContent.includes("expenseChannel.onmessage")) {
    const listener = `
// Listen for updates from other tabs
expenseChannel.onmessage = async (event) => {
    if (event.data.action === 'updated' && event.data.source !== 'expense_logic_self') {
        // Only reload if we are not the ones who just saved it
        // Actually, broadcast channel doesn't send to the sender tab, so we are safe!
        await loadNotebookData();
    }
};
`;
    logicContent += listener;
    fs.writeFileSync(path + 'expense_logic.js', logicContent, 'utf8');
    console.log("Updated expense_logic.js with listener");
}

