import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

if "const originalEnsureMinimumLines" not in js:
    missing_js = """
// Override ensureMinimumLines to also update pagination
if (typeof originalEnsureMinimumLines === 'undefined') {
    const originalEnsureMinimumLines = ensureMinimumLines;
    window.ensureMinimumLines = function() {
        originalEnsureMinimumLines();
        if (typeof updateExpensePagination === 'function') {
            updateExpensePagination();
        }
    };
}
"""
    with open("Sejong/SejongAttendance/public/expense_logic.js", "a", encoding="utf-8") as f:
        f.write(missing_js)
    print("ensureMinimumLines override appended.")
else:
    print("already overridden.")
