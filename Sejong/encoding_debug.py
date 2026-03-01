import os

def hex_dump(filepath, length=1000):
    with open(filepath, 'rb') as f:
        data = f.read(length)
    return data

public_dir = 'public'
# Search for files with "한식" in name
for f in os.listdir(public_dir):
    if '한식' in f and f.endswith('.html'):
        path = os.path.join(public_dir, f)
        print(f"File: {f}")
        data = hex_dump(path)
        # Try to decode with common encodings and print a snippet
        for enc in ['utf-8', 'cp949']:
            try:
                print(f"Decoded ({enc}): {data[:200].decode(enc)}...")
            except:
                print(f"Failed ({enc})")
        break
