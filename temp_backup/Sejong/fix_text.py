import glob

files = glob.glob('public/*.html')
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        new_content = content.replace('숙주나물 홍보', '학원 홍보')
        if content != new_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
    except Exception as e:
        print(f"Failed to process {f}: {e}")
