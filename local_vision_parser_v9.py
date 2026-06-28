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
    if not success: return []
        
    results = request.results()
    items = []
    for observation in results:
        top_candidate = observation.topCandidates_(1).firstObject()
        if top_candidate:
            box = observation.boundingBox()
            items.append({
                "text": top_candidate.string(),
                "x": box.origin.x,
                "y": box.origin.y,
                "w": box.size.width,
                "h": box.size.height
            })
    return items

def process_image(image_path):
    items = extract_text_with_boxes(image_path)
    items.sort(key=lambda item: item['y'], reverse=True)
    
    ignore_pattern = r'(?i)(INDEX|Name|Address|Home|HOm|Fax|Office|HP|Phone|E-mail|Mobile|emal|email|결제금액|결재금액|경영식|도구비|수강료)'
    
    valid_items = []
    for item in items:
        text = item['text'].strip()
        if not text or re.search(ignore_pattern, text):
            continue
        valid_items.append(item)
        
    lines = []
    current_line = []
    line_y = None
    
    for item in valid_items:
        if line_y is None:
            line_y = item['y']
            current_line.append(item)
        else:
            if abs(line_y - item['y']) < 0.015:
                current_line.append(item)
                line_y = sum(itm['y'] for itm in current_line) / len(current_line)
            else:
                lines.append({'y': line_y, 'items': current_line})
                current_line = [item]
                line_y = item['y']
    if current_line:
        lines.append({'y': line_y, 'items': current_line})
        
    results = []
    blocks = []
    current_block = None
    
    for line in lines:
        line['items'].sort(key=lambda itm: itm['x'])
        
        name_text = ""
        phone_texts = []
        
        for itm in line['items']:
            text = itm['text']
            if itm['x'] < 0.55 and not re.search(r'\d', text):
                name_text += " " + text
            else:
                phone_texts.append(text)
                
        name_text = name_text.strip()
        name_clean = re.sub(r'[^가-힣a-zA-Z]', '', name_text)
        
        if name_clean and not re.search(r'^[a-zA-Z]+$', name_clean):
            current_block = {
                'name': name_clean,
                'name_y': line['y'],
                'phones': []
            }
            blocks.append(current_block)
            
        phone_str = " ".join(phone_texts)
        if not phone_str.strip():
            continue
            
        phone_str = phone_str.replace('0l0', '010').replace('0lo', '010').replace('olo', '010').replace('OlO', '010').replace('018o', '010').replace('01o', '010')
        phone_str = phone_str.replace('o', '0').replace('O', '0').replace('..', '.')
        
        match = re.search(r'(\d{2,3}[-.\) ]?\s*\d{3,4}[-.\s]*\d{4})(.*)', phone_str)
        if match:
            phone_raw = match.group(1)
            relation_raw = match.group(2)
        else:
            digits = re.sub(r'[^\d]', '', phone_str)
            if len(digits) >= 8:
                phone_raw = phone_str
                relation_raw = phone_str
            else:
                continue
                
        relation = ""
        if re.search(r'[母父모부타489]', relation_raw) or '(' in relation_raw or ')' in relation_raw:
            relation = "부모"
            
        phone_digits = re.sub(r'[^\d]', '', phone_raw)
        phone_formatted = format_phone(phone_digits)
        
        if phone_formatted:
            # Check DB
            db_name = None
            db_rel = None
            if phone_digits in phone_db:
                db_name = phone_db[phone_digits]['name']
                db_rel = phone_db[phone_digits]['relation']
                
            if current_block and abs(current_block['name_y'] - line['y']) < 0.08:
                if len(current_block['phones']) < 3:
                    if db_name:
                        current_block['name'] = db_name # Overwrite OCR garbage with pure DB name
                    if db_rel and not relation:
                        relation = db_rel
                    
                    current_block['phones'].append({
                        'number': phone_formatted,
                        'relation': relation
                    })
            else:
                # Orphaned number! But if we have it in DB, we can STILL rescue it.
                if db_name:
                    blocks.append({
                        'name': db_name,
                        'name_y': line['y'],
                        'phones': [{
                            'number': phone_formatted,
                            'relation': relation if relation else db_rel
                        }]
                    })

    for block in blocks:
        # Drop garbage OCR names that are too long if they didn't get resolved by DB
        if len(block['name']) > 15:
            continue 
        for phone in block['phones']:
            results.append({
                '이름': block['name'],
                '전화번호': phone['number'],
                '관계': phone['relation']
            })
            
    return results

def main():
    folder_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /전화번호"
    
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    files.sort()
    
    all_data = []
    total = len(files)
    print(f"Starting V9 local OCR (DB CROSS-REF + MAX-3 RULES) for {total} files...")
    
    for idx, f in enumerate(files):
        img_path = os.path.join(folder_path, f)
        print(f"Processing {idx+1}/{total}: {f}")
        try:
            res = process_image(img_path)
            all_data.extend(res)
        except Exception as e:
            pass
            
    df = pd.DataFrame(all_data)
    
    if len(df) > 0:
        df = df.drop_duplicates(subset=['이름', '전화번호'], keep='first')
        
        # Additional global check to ensure no more than 3 per name (handles orphans merging with blocks)
        df = df.groupby('이름').head(3).reset_index(drop=True)
        
        df = df.sort_values(by=['이름'])
        df['이름'] = df['이름'].mask(df['이름'] == df['이름'].shift())
        df['이름'] = df['이름'].fillna('')
    
    excel_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/수강생_정밀분석_최종본.xlsx'
    
    df_old = pd.read_excel(excel_path, sheet_name=None)
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        for sheet_name, data in df_old.items():
            if sheet_name != '시트3':
                data.to_excel(writer, sheet_name=sheet_name, index=False)
        if len(df) > 0:
            df.to_excel(writer, sheet_name='시트3', index=False)
        else:
            pd.DataFrame(columns=['이름', '전화번호', '관계']).to_excel(writer, sheet_name='시트3', index=False)

    print(f"Complete! Extracted {len(df)} phone records with V9.")

if __name__ == "__main__":
    main()
