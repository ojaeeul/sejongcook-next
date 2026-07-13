import os

target = '(일반적 냉장)'
public_dir = 'public'

for filename in os.listdir(public_dir):
    if filename.endswith('.html') and not filename.startswith('._'):
        # Check all possible variations of the string
        filepath = os.path.join(public_dir, filename)
        try:
            with open(filepath, 'rb') as f:
                data = f.read()
            
            # Search for the bytes of the strings in different encodings
            found = False
            for enc in ['utf-8', 'cp949', 'euc-kr']:
                bs = target.encode(enc)
                if bs in data:
                    print(f"Found target in {filename} using {enc} encoding!")
                    new_data = data.replace(bs, b'')
                    with open(filepath, 'wb') as f:
                        f.write(new_data)
                    found = True
                    break
        except:
            pass
print("Byte-level direct cleanup finished.")
