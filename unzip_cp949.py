import os
import zipfile

DIRS_TO_SEARCH = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/시험지"
]

def extract_all():
    for d in DIRS_TO_SEARCH:
        if not os.path.exists(d): continue
        for root, _, files in os.walk(d):
            for f in files:
                if f.lower().endswith('.zip'):
                    zip_path = os.path.join(root, f)
                    extract_dir = zip_path + "_extracted"
                    print(f"Extracting: {zip_path}")
                    os.makedirs(extract_dir, exist_ok=True)
                    try:
                        with zipfile.ZipFile(zip_path, 'r') as zf:
                            for zip_info in zf.infolist():
                                # Try CP949 first, then fallback to utf-8
                                try:
                                    decoded_name = zip_info.filename.encode('cp437').decode('cp949')
                                except:
                                    try:
                                        decoded_name = zip_info.filename.encode('cp437').decode('utf-8')
                                    except:
                                        decoded_name = zip_info.filename
                                
                                zip_info.filename = decoded_name
                                zf.extract(zip_info, extract_dir)
                    except Exception as e:
                        print(f"Error extracting {zip_path}: {e}")

if __name__ == "__main__":
    extract_all()
