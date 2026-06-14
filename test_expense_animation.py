import re

with open("Sejong/SejongAttendance/public/expense.html", "r", encoding="utf-8") as f:
    html = f.read()

# Check if pagination buttons exist
if "pagination-controls" not in html:
    print("No pagination controls found in expense.html")
    
