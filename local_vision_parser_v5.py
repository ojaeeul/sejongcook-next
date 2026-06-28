import sys
import os
import re
import Cocoa
import Vision
import pandas as pd

def clean_phone_number(p):
    if pd.isna(p): return ""
    return re.sub(r'[^\d]', '', str(p))

def build_phone_dict():
    excel_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/수강생_정밀분석_최종본.xlsx'
    df1 = pd.read_excel(excel_path, sheet_name='시트1')
    df2 = pd.read_excel(excel_path, sheet_name='시트2')
    
    phone_dict = {}
    for df in [df1, df2]:
        for _, row in df.iterrows():
            name = str(row.get('성명', '')).strip()
            if not name or name == 'nan': continue
                
            student_phone = clean_phone_number(row.get('학생연락처', ''))
            parent_phone = clean_phone_number(row.get('부모연락처', ''))
            
            if len(student_phone) >= 8:
                phone_dict[student_phone] = {'name': name, 'relation': ''}
            if len(parent_phone) >= 8:
                phone_dict[parent_phone] = {'name': name, 'relation': '부모'}
    return phone_dict

phone_db = build_phone_dict()

def format_phone(phone_clean):
    if len(phone_clean) >= 9:
        if phone_clean.startswith('02'):
            if len(phone_clean) == 9: return f"{phone_clean[:2]}-{phone_clean[2:5]}-{phone_clean[5:]}"
            else: return f"{phone_clean[:2]}-{phone_clean[2:6]}-{phone_clean[6:]}"
        else:
            if len(phone_clean) == 10: return f"{phone_clean[:3]}-{phone_clean[3:6]}-{phone_clean[6:]}"
            elif len(phone_clean) == 11: return f"{phone_clean[:3]}-{phone_clean[3:7]}-{phone_clean[7:]}"
    return phone_clean

def extract_text_with_boxes(image_path):
    url = Cocoa.NSURL.fileURLWithPath_(image_path)
    handler = Vision.VNImageRequestHandler.alloc().initWithURL_options_(url, None)
    
    request = Vision.VNRecognizeTextRequest.alloc().init()
    request.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate)
    request.setUsesLanguageCorrection_(True)
    request.setRecognitionLanguages_(["ko-KR", "en-US"])
    
    success, error = handler.performRequests_error_([request], None)
    if not success:
        return []
        
    results = request.results()
    items = []
    for observation in results:
        top_candidate = observation.topCandidates_(1).firstObject()
        if top_candidate:
            text = top_candidate.string()
            box = observation.boundingBox()
            items.append({
                "text": text,
                "x": box.origin.x,
                "y": box.origin.y,
                "w": box.size.width,
                "h": box.size.height,
                "used": False
            })
    return items

def process_image(image_path):
    items = extract_text_with_boxes(image_path)
    items.sort(key=lambda item: item['y'], reverse=True)
    
    names = []
    others = []
    
    ignore_pattern = r'(?i)(INDEX|Name|Address|Home|HOm|Fax|Office|HP|Phone|E-mail|Mobile|emal|email|e.mail|e-mal|nom|hane|none)'
    
    for item in items:
        text = item['text'].strip()
        if not text:
            continue
            
        if re.search(ignore_pattern, text):
            continue
            
        if item['x'] < 0.60 and not re.search(r'\d', text):
            names.append(item)
        else:
            others.append(item)
            
    results = []
    
    # 1. Process items that have a name next to them
    for i, name_item in enumerate(names):
        current_name_y = name_item['y']
        next_name_y = names[i+1]['y'] if i + 1 < len(names) else 0.0
        
        upper_bound = current_name_y + 0.035
        lower_bound = next_name_y + 0.035
        if i == len(names) - 1:
            lower_bound = 0.0
            
        assigned_others = []
        for o in others:
            if not o['used'] and lower_bound <= o['y'] <= upper_bound:
                assigned_others.append(o)
                o['used'] = True
                
        assigned_others.sort(key=lambda item: item['y'], reverse=True)
        
        lines = []
        current_line = []
        line_y = None
        
        for o in assigned_others:
            if line_y is None:
                line_y = o['y']
                current_line.append(o)
            else:
                if abs(line_y - o['y']) < 0.015:
                    current_line.append(o)
                    line_y = sum(itm['y'] for itm in current_line) / len(current_line)
                else:
                    lines.append(current_line)
                    current_line = [o]
                    line_y = o['y']
        if current_line:
            lines.append(current_line)
            
        real_name = name_item['text'].strip()
        real_name = re.sub(ignore_pattern, '', real_name)
        real_name = re.sub(r'[^가-힣a-zA-Z]', '', real_name)
        
        if not real_name or re.search(r'^[a-zA-Z]+$', real_name):
            continue
            
        for line in lines:
            line.sort(key=lambda item: item['x'])
            text = " ".join(itm['text'] for itm in line)
            
            text = text.replace('0l0', '010').replace('0lo', '010').replace('olo', '010').replace('OlO', '010').replace('018o', '010').replace('01o', '010')
            text = text.replace('o', '0').replace('O', '0').replace('..', '.')
            
            match = re.search(r'(\d{2,3}[-.\) ]?\s*\d{3,4}[-.\s]*\d{4})(.*)', text)
            
            if match:
                phone_raw = match.group(1)
                relation_raw = match.group(2)
            else:
                digits = re.sub(r'[^\d]', '', text)
                if len(digits) >= 8:
                    phone_raw = text
                    relation_raw = text
                else:
                    continue
                    
            relation = ""
            if re.search(r'[母父모부타489]', relation_raw) or '(' in relation_raw or ')' in relation_raw:
                relation = "부모"
                
            phone_digits = re.sub(r'[^\d]', '', phone_raw)
            phone_formatted = format_phone(phone_digits)
            
            if phone_formatted:
                # Cross-reference Check:
                if phone_digits in phone_db:
                    db_name = phone_db[phone_digits]['name']
                    db_rel = phone_db[phone_digits]['relation']
                    if relation == "": relation = db_rel # use DB relation if OCR missed it
                    # (We could overwrite real_name with db_name here if we want to fix OCR typos)
                    real_name = db_name
                    
                results.append({
                    '이름': real_name,
                    '전화번호': phone_formatted,
                    '관계': relation
                })

    # 2. Process ORPHANED others (numbers that didn't have a name matched)
    orphans = [o for o in others if not o['used']]
    
    # Group orphans by line just like before
    orphans.sort(key=lambda item: item['y'], reverse=True)
    lines = []
    current_line = []
    line_y = None
    
    for o in orphans:
        if line_y is None:
            line_y = o['y']
            current_line.append(o)
        else:
            if abs(line_y - o['y']) < 0.015:
                current_line.append(o)
                line_y = sum(itm['y'] for itm in current_line) / len(current_line)
            else:
                lines.append(current_line)
                current_line = [o]
                line_y = o['y']
    if current_line:
        lines.append(current_line)
        
    for line in lines:
        line.sort(key=lambda item: item['x'])
        text = " ".join(itm['text'] for itm in line)
        
        text = text.replace('0l0', '010').replace('0lo', '010').replace('olo', '010').replace('OlO', '010').replace('018o', '010').replace('01o', '010')
        text = text.replace('o', '0').replace('O', '0').replace('..', '.')
        
        match = re.search(r'(\d{2,3}[-.\) ]?\s*\d{3,4}[-.\s]*\d{4})(.*)', text)
        if match:
            phone_raw = match.group(1)
            relation_raw = match.group(2)
        else:
            digits = re.sub(r'[^\d]', '', text)
            if len(digits) >= 8:
                phone_raw = text
                relation_raw = text
            else:
                continue
                
        relation = ""
        if re.search(r'[母父모부타489]', relation_raw) or '(' in relation_raw or ')' in relation_raw:
            relation = "부모"
            
        phone_digits = re.sub(r'[^\d]', '', phone_raw)
        phone_formatted = format_phone(phone_digits)
        
        if phone_formatted:
            found_name = ""
            if phone_digits in phone_db:
                found_name = phone_db[phone_digits]['name']
                db_rel = phone_db[phone_digits]['relation']
                if relation == "": relation = db_rel
                
            results.append({
                '이름': found_name if found_name else '(이름 확인필요)',
                '전화번호': phone_formatted,
                '관계': relation
            })
            
    return results

def main():
    folder_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /전화번호"
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    files.sort()
    
    all_data = []
    total = len(files)
    print(f"Starting V5 local OCR for {total} files with Database Cross-Reference...")
    
    for idx, f in enumerate(files):
        img_path = os.path.join(folder_path, f)
        print(f"Processing {idx+1}/{total}: {f}")
        try:
            res = process_image(img_path)
            all_data.extend(res)
        except Exception as e:
            print(f"Error on {f}: {e}")
            
    df = pd.DataFrame(all_data)
    
    df = df.drop_duplicates(subset=['이름', '전화번호'], keep='first')
    df = df.sort_values(by=['이름'])
    
    excel_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/수강생_정밀분석_최종본.xlsx'
    
    df_old = pd.read_excel(excel_path, sheet_name=None)
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        for sheet_name, data in df_old.items():
            if sheet_name != '시트3':
                data.to_excel(writer, sheet_name=sheet_name, index=False)
        df.to_excel(writer, sheet_name='시트3', index=False)

    print(f"Complete! Extracted {len(df)} phone records with V5.")

if __name__ == "__main__":
    main()
