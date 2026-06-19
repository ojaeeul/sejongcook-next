const fs = require('fs');
const path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';

// 1. Update expense_logic.js to broadcast changes
let logicContent = fs.readFileSync(path + 'expense_logic.js', 'utf8');

if (!logicContent.includes("new BroadcastChannel('expense_sync')")) {
    const channelDecl = `\nconst expenseChannel = new BroadcastChannel('expense_sync');\n`;
    logicContent = channelDecl + logicContent;
    
    // Replace saveNotebookData to broadcast
    logicContent = logicContent.replace(
        /console\.log\("Notebook auto-saved"\);/g,
        'console.log("Notebook auto-saved");\n        expenseChannel.postMessage({ action: "updated" });'
    );
    
    fs.writeFileSync(path + 'expense_logic.js', logicContent, 'utf8');
    console.log("Updated expense_logic.js");
}

// 2. Update expense_stats.js to listen to broadcasts
let statsContent = fs.readFileSync(path + 'expense_stats.js', 'utf8');

if (!statsContent.includes("new BroadcastChannel('expense_sync')")) {
    const listener = `
// Real-time synchronization across tabs
const expenseChannel = new BroadcastChannel('expense_sync');
expenseChannel.onmessage = (event) => {
    if (event.data.action === 'updated') {
        loadExpenseData();
    }
};
`;
    statsContent += listener;
    fs.writeFileSync(path + 'expense_stats.js', statsContent, 'utf8');
    console.log("Updated expense_stats.js");
}
