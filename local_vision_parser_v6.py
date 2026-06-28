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
    
    names = []
    others = []
    
    ignore_pattern = r'(?i)(INDEX|Name|Address|Home|HOm|Fax|Office|HP|Phone|E-mail|Mobile|emal|email|결제금액|결재금액|경영식)'
    
    for item in items:
        text = item['text'].strip()
        if not text or re.search(ignore_pattern, text):
            continue
            
        if item['x'] < 0.60 and not re.search(r'\d', text):
            # Clean name right away
            clean_name = re.sub(ignore_pattern, '', text)
            clean_name = re.sub(r'[^가-힣a-zA-Z]', '', clean_name)
            if clean_name and not re.search(r'^[a-zA-Z]+$', clean_name):
                item['clean_name'] = clean_name
                names.append(item)
        else:
            others.append(item)
            
    # Group others into lines
    others.sort(key=lambda item: item['y'], reverse=True)
    phone_lines = []
    current_line = []
    line_y = None
    
    for o in others:
        if line_y is None:
            line_y = o['y']
            current_line.append(o)
        else:
            if abs(line_y - o['y']) < 0.015:
                current_line.append(o)
                line_y = sum(itm['y'] for itm in current_line) / len(current_line)
            else:
                phone_lines.append({'y': line_y, 'items': current_line})
                current_line = [o]
                line_y = o['y']
    if current_line:
        phone_lines.append({'y': line_y, 'items': current_line})
        
    results = []
    
    for pline in phone_lines:
        line_items = pline['items']
        line_items.sort(key=lambda item: item['x'])
        text = " ".join(itm['text'] for itm in line_items)
        
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
        
        if not phone_formatted:
            continue
            
        # Find closest name above this line
        closest_name = None
        min_dy = 999.0
        
        for name_item in names:
            dy = name_item['y'] - pline['y']
            # Name must be above or slightly below (-0.015), and not too far above (0.08)
            if -0.015 <= dy <= 0.08:
                if dy < min_dy:
                    min_dy = dy
                    closest_name = name_item['clean_name']
                    
        # Check database cross-reference
        if phone_digits in phone_db:
            closest_name = phone_db[phone_digits]['name']
            if relation == "": relation = phone_db[phone_digits]['relation']
            
        if closest_name:
            results.append({
                '이름': closest_name,
                '전화번호': phone_formatted,
                '관계': relation
            })
        else:
            # Orphaned and not in DB - Ignore as per rule "delete invalid/extra"
            pass
            
    return results

def main():
    folder_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 정밀분석/sejk 4/수강생 /전화번호"
    # fix path
    folder_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /전화번호"
    
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    files.sort()
    
    all_data = []
    total = len(files)
    print(f"Starting V6 local OCR for {total} files...")
    
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
        # Drop identical duplicates
        df = df.drop_duplicates(subset=['이름', '전화번호'], keep='first')
        
        # Enforce max 3 numbers per person (delete excess)
        df = df.groupby('이름').head(3).reset_index(drop=True)
        
        # Sort by Name
        df = df.sort_values(by=['이름'])
        
        # Blank out duplicate names on consecutive rows for the layout user wants
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

    print(f"Complete! Extracted {len(df)} phone records with V6.")

if __name__ == "__main__":
    main()
