import sys
import os
import re
import Cocoa
import Vision
import pandas as pd

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
                "h": box.size.height
            })
    return items

def process_image(image_path):
    items = extract_text_with_boxes(image_path)
    # Sort by Y descending (top to bottom)
    items.sort(key=lambda item: item['y'], reverse=True)
    
    names = []
    others = []
    
    for item in items:
        text = item['text']
        if 'INDEX' in text or 'Name' in text or 'Address' in text or 'HOm' in text or 'Home' in text or 'Fax' in text or 'Office' in text:
            continue
            
        # x < 0.6 is roughly the name column
        if item['x'] < 0.60 and not re.search(r'\d', text):
            names.append(item)
        else:
            others.append(item)
            
    results = []
    
    for i, name_item in enumerate(names):
        current_name_y = name_item['y']
        next_name_y = names[i+1]['y'] if i + 1 < len(names) else 0.0
        
        # Phone numbers for this name are between current_name_y + 0.035 and next_name_y + 0.035
        upper_bound = current_name_y + 0.035
        lower_bound = next_name_y + 0.035
        if i == len(names) - 1:
            lower_bound = 0.0
            
        assigned_others = [o for o in others if lower_bound <= o['y'] <= upper_bound]
        
        # Group assigned_others into lines
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
                    line_y = sum(i['y'] for i in current_line) / len(current_line)
                else:
                    lines.append(current_line)
                    current_line = [o]
                    line_y = o['y']
        if current_line:
            lines.append(current_line)
            
        real_name = name_item['text'].strip().replace('.', '').replace(' ', '')
        
        person_results = []
        
        for line in lines:
            line.sort(key=lambda item: item['x'])
            text = " ".join(i['text'] for i in line)
            
            # Common OCR fixes
            text = text.replace('0l0', '010').replace('0lo', '010').replace('olo', '010').replace('OlO', '010').replace('018o', '010').replace('01o', '010')
            text = text.replace('o', '0').replace('O', '0')
            text = text.replace('..', '.')
            
            # Extract phone numbers
            phones = re.findall(r'(\d{2,3}[-.\) ]?\s*\d{3,4}[-.\s]*\d{4}(?:\s*\(.*?\))?)', text)
            
            if not phones and re.search(r'\d', text):
                phones = [text.strip()]
                
            for p_idx, phone in enumerate(phones):
                phone_clean = phone.strip()
                relation = ""
                
                # Check for relations in parentheses
                if re.search(r'\(.*?\)', phone_clean):
                    relation = "부모"
                    phone_clean = re.sub(r'\(.*?\)', '', phone_clean).strip()
                elif '모' in phone_clean or '부' in phone_clean or '타' in phone_clean:
                    relation = "부모"
                    phone_clean = re.sub(r'[모부타]', '', phone_clean).strip()
                    
                person_results.append({
                    '이름': real_name if (len(person_results) == 0 and p_idx == 0) else '',
                    '전화번호': phone_clean,
                    '관계': relation
                })
                
        if not person_results:
             person_results.append({
                '이름': real_name,
                '전화번호': '',
                '관계': ''
            })
            
        results.extend(person_results)
            
    return results

def main():
    folder_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /전화번호"
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    files.sort()
    
    all_data = []
    total = len(files)
    print(f"Starting V2 local OCR for {total} files using macOS Vision...")
    
    for idx, f in enumerate(files):
        img_path = os.path.join(folder_path, f)
        print(f"Processing {idx+1}/{total}: {f}")
        try:
            res = process_image(img_path)
            all_data.extend(res)
        except Exception as e:
            print(f"Error on {f}: {e}")
            
    df = pd.DataFrame(all_data)
    
    excel_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/수강생_정밀분석_최종본.xlsx'
    
    df_old = pd.read_excel(excel_path, sheet_name=None)
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        for sheet_name, data in df_old.items():
            if sheet_name != '시트3':
                data.to_excel(writer, sheet_name=sheet_name, index=False)
        df.to_excel(writer, sheet_name='시트3', index=False)

    print(f"Complete! Extracted {len(all_data)} phone records with V2.")

if __name__ == "__main__":
    main()
