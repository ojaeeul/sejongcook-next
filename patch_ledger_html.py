with open("public/sejong/ledger.html", "r", encoding="utf-8") as f:
    content = f.read()

if '<script src="shared_calc.js' not in content:
    content = content.replace('<script src="ledger.js', '<script src="shared_calc.js?v=' + str(__import__('time').time()) + '"></script>\n    <script src="ledger.js')
    with open("public/sejong/ledger.html", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched ledger.html")
else:
    print("Already patched")
