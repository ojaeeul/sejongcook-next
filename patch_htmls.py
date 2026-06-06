import os

html_files = ["public/sejong/sms.html", "public/sejong/tuition.html", "public/sejong/attendance_daily.html"]

for filepath in html_files:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Insert shared_calc.js before the main JS file
        main_js = filepath.split('/')[-1].replace(".html", ".js")
        if main_js == "sms.js": main_js = "sms_v3.js"
        if main_js == "tuition.js": main_js = "tuition_v3.js"

        if '<script src="shared_calc.js' not in content:
            content = content.replace(f'<script src="{main_js}', f'<script src="shared_calc.js?v=' + str(__import__('time').time()) + '"></script>\n    <script src="{main_js}')
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Patched {filepath}")
        else:
            print(f"Already patched {filepath}")
