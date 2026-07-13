import glob

js_files = glob.glob('public/*.js')
for f in js_files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        new_content = content.replace('/api/sejong', '/api')
        
        if content != new_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Patched {f}")
    except Exception as e:
        print(f"Failed to process {f}: {e}")
