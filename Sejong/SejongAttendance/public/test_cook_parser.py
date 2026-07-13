import os
import re
import json
import unicodedata
from bs4 import BeautifulSoup
import subprocess
import shutil

HWP5HTML_BIN = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/hwp_env/bin/hwp5html"
BASE_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
DB_JSON_PATH = os.path.join(BASE_DIR, "questions_data.json")

def normalize_title(text):
    text = unicodedata.normalize("NFC", text)
    # Extract exam name: "2013년 4회 한식조리기능사 기출문제" -> "2013_한식_4"
    # Actually, the files are named like hcook_130414.hwp or 중식-필기A유형 전산.hwp
    # It's better to just use the filename without extension as the title!
    return text.replace(" ", "").replace(".hwp", "")

def parse_exam(file_path):
    f_nfc = unicodedata.normalize('NFC', os.path.basename(file_path))
    html_dir = f"/tmp/cooking_html_{f_nfc.replace(' ', '_')}"
    shutil.rmtree(html_dir, ignore_errors=True)
    
    try:
        subprocess.run([HWP5HTML_BIN, "--output", html_dir, file_path], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception as e:
        print(f"Failed to hwp5html {f_nfc}: {e}")
        return None
    
    index_path = os.path.join(html_dir, "index.xhtml")
    if not os.path.exists(index_path):
        return None
        
    with open(index_path, "r", encoding="utf-8") as html_f:
        soup = BeautifulSoup(html_f, "html.parser")
    
    answers_dict = {}
    
    # Extract and decompose answer tables first
    for el in soup.find_all('table'):
        rows = el.find_all('tr')
        if rows:
            first_row_cells = [c.get_text(strip=True) for c in rows[0].find_all(['td', 'th'])]
            if '1' in first_row_cells and '10' in first_row_cells:
                # This is an answer table
                for i in range(0, len(rows)-1, 2):
                    q_cells = [c.get_text(strip=True) for c in rows[i].find_all(['td', 'th'])]
                    a_cells = [c.get_text(strip=True) for c in rows[i+1].find_all(['td', 'th'])]
                    for q, a in zip(q_cells, a_cells):
                        if q.isdigit():
                            answers_dict[int(q)] = a
                # Decompose to prevent its p-tags from being processed
                el.decompose()

    # If answers were not found in a table, we check for a standalone answer file?
    # No, we will just parse it and hopefully we have answers_dict
    
    # We will gather text blocks from the REMAINING soup
    text_blocks = []
    # Avoid nested extraction by only getting top-level p and table?
    # No, find_all doesn't guarantee non-nesting, but we can just decompose table as we process it if we want to extract it as a block.
    # But wait, tables might contain p tags, and we'd extract both the table and its p tags if we aren't careful.
    
    # A safe way is to iterate over children of body or similar?
    # Or just find all tables, replace them with a special marker, then find all p tags?
    
    # Let's just find tables, extract text, and decompose.
    tables = soup.find_all('table')
    for tbl in tables:
        tbl_text = tbl.get_text(separator="\n", strip=True)
        # Create a new element to hold the table text so we can preserve order?
        # Actually, replacing it with a div or something is better to preserve order.
        new_tag = soup.new_tag("div")
        new_tag.string = f"\n<표>\n{tbl_text}\n</표>\n"
        tbl.replace_with(new_tag)
        
    # Now all tables are replaced with divs. We can just extract text from the body.
    body = soup.find('body')
    if body:
        combined_text = body.get_text(separator="\n", strip=True)
    else:
        combined_text = soup.get_text(separator="\n", strip=True)

    q_pattern = re.compile(r'\n(\d{1,2})\.\s*(.*?)(?=\n\d{1,2}\.\s*|\Z)', re.DOTALL)
    matches = q_pattern.findall("\n" + combined_text.strip())
    
    ans_map = {'가': 1, '나': 2, '다': 3, '라': 4, '1': 1, '2': 2, '3': 3, '4': 4, '①': 1, '②': 2, '③': 3, '④': 4}
    
    results = []
    for num_str, block in matches:
        q_num = int(num_str)
        
        o1_match = re.search(r'(?:①|가\.)\s*(.*?)\s*(?:②|나\.)', block, re.DOTALL)
        o2_match = re.search(r'(?:②|나\.)\s*(.*?)\s*(?:③|다\.)', block, re.DOTALL)
        o3_match = re.search(r'(?:③|다\.)\s*(.*?)\s*(?:④|라\.)', block, re.DOTALL)
        o4_match = re.search(r'(?:④|라\.)\s*(.*)', block, re.DOTALL)
        
        if o1_match and o2_match and o3_match and o4_match:
            o1 = o1_match.group(1).strip()
            o2 = o2_match.group(1).strip()
            o3 = o3_match.group(1).strip()
            o4 = o4_match.group(1).strip()
            
            # Remove any trailing junk like "정답" or "[오답" from o4
            if "정답" in o4: o4 = o4.split("정답")[0].strip()
            if "[오답" in o4: o4 = o4.split("[오답")[0].strip()
            
            q_text = block[:o1_match.start()].strip()
            
            ans_raw = answers_dict.get(q_num, "")
            ans = ans_map.get(ans_raw, 0)
            if "모두답" in ans_raw or ans_raw == "모두답":
                ans = 1
                
            results.append({
                "q_num": q_num,
                "q": q_text,
                "o": [o1, o2, o3, o4],
                "a": ans
            })
        else:
            print(f"Failed to extract options for Q{q_num} in {f_nfc}")
            
    return results

def main():
    with open(DB_JSON_PATH, "r", encoding="utf-8") as f:
        q_data = json.load(f)
        
    target_dirs = [
        "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제",
        "/Users/ojaeeul/Downloads/시험/기출문제"
    ]
    
    total_parsed = 0
    for target_dir in target_dirs:
        if not os.path.exists(target_dir):
            continue
            
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                f_nfc = unicodedata.normalize("NFC", file)
                if f_nfc.endswith(".hwp") and not f_nfc.startswith("~$"):
                    file_path = os.path.join(root, file)
                    
                    exam_key = "오재을_" + f_nfc.replace(".hwp", "")
                    
                    print(f"Parsing {f_nfc}...")
                    results = parse_exam(file_path)
                    
                    if results and len(results) >= 40:
                        # Success
                        q_data[exam_key] = results
                        total_parsed += 1
                        print(f"  -> Parsed {len(results)} questions successfully.")
                    else:
                        print(f"  -> Skipping {f_nfc} due to low parsing rate or not an exam.")
                        
    # Update DB
    with open(DB_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(q_data, f, ensure_ascii=False, indent=2)
        
    print(f"Finished parsing. Updated {total_parsed} exams in database.")

if __name__ == "__main__":
    main()
