def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Make alignAllDates accept isAuto
    old_align = """window.alignAllDates = function() {
    if (!confirm("양쪽 페이지의 모든 내역을 날짜순으로 자동 정렬하고, 같은 날짜끼리 줄을 맞추시겠습니까?")) return;"""
    
    new_align = """window.alignAllDates = function(isAuto = false) {
    if (!isAuto && !confirm("양쪽 페이지의 모든 내역을 날짜순으로 자동 정렬하고, 같은 날짜끼리 줄을 맞추시겠습니까?")) return;"""
    
    js = js.replace(old_align, new_align)

    # Call alignAllDates(true) after processNewPayments finishes if changes were made
    old_proc_end = """        if (hasChanges) {
            hideDuplicateDates();
            saveNotebookData();
        }"""
    
    new_proc_end = """        if (hasChanges) {
            if (window.alignAllDates) {
                window.alignAllDates(true);
            } else {
                hideDuplicateDates();
                saveNotebookData();
            }
        }"""
        
    js = js.replace(old_proc_end, new_proc_end)

    # Call alignAllDates(true) after loadNotebookData finishes
    old_load_end = """        if (data && data.expenseYear) {
            const yearElem = document.getElementById('expense-year');
            if (yearElem) yearElem.textContent = data.expenseYear;
        } else {
            const yearElem = document.getElementById('expense-year');
            if (yearElem && !yearElem.textContent) yearElem.textContent = new Date().getFullYear();
        }
    } catch (e) {
        console.error('Failed to load notebook data:', e);
    }
}"""
    
    new_load_end = """        if (data && data.expenseYear) {
            const yearElem = document.getElementById('expense-year');
            if (yearElem) yearElem.textContent = data.expenseYear;
        } else {
            const yearElem = document.getElementById('expense-year');
            if (yearElem && !yearElem.textContent) yearElem.textContent = new Date().getFullYear();
        }
        
        // Auto-align on load
        if (window.alignAllDates) window.alignAllDates(true);
        
    } catch (e) {
        console.error('Failed to load notebook data:', e);
    }
}"""
    
    js = js.replace(old_load_end, new_load_end)

    # Check alert inside alignAllDates
    old_alert = """    setTimeout(() => alert("날짜별 정렬 및 줄 맞춤이 완료되었습니다!"), 100);
};"""
    
    new_alert = """    if (!isAuto) {
        setTimeout(() => alert("날짜별 정렬 및 줄 맞춤이 완료되었습니다!"), 100);
    }
};"""

    js = js.replace(old_alert, new_alert)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/expense_logic.js')
print("Auto-align logic added.")
