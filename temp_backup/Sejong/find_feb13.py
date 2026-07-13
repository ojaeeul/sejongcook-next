import os, datetime

search_dir = r"C:\Users\세종요리\Desktop\sejk 4"
with open("feb13_files.txt", "w", encoding="utf-8") as out:
    for root, dirs, files in os.walk(search_dir):
        if 'node_modules' in root or '.git' in root or '.next' in root:
            continue
        for f in files:
            if f in ['index.html', 'script.js', 'style.css', 'ledger.html', 'sheet.html']:
                path = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(path)
                    dt = datetime.datetime.fromtimestamp(mtime)
                    if dt.month >= 2 and dt.day >= 1:
                        out.write(f"{dt.strftime('%Y-%m-%d %H:%M:%S')} | {path}\n")
                except Exception:
                    pass
