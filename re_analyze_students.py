import pandas as pd
import re
import objc
from Foundation import NSURL
from Quartz.PDFKit import PDFDocument
from Vision import VNImageRequestHandler, VNRecognizeTextRequest

def extract_name_from_pdf(pdf_path, page_num):
    url = NSURL.fileURLWithPath_(pdf_path)
    pdf = PDFDocument.alloc().initWithURL_(url)
    if not pdf:
        return None
    if page_num >= pdf.pageCount():
        return None
    page = pdf.pageAtIndex_(page_num)
    
    rect = page.boundsForBox_(0)
    rect.size.width *= 2
    rect.size.height *= 2
    image = page.thumbnailOfSize_forBox_(rect.size, 0)
    cg_image = image.CGImageForProposedRect_context_hints_(None, None, None)[0]
    
    handler = VNImageRequestHandler.alloc().initWithCGImage_options_(cg_image, None)
    texts = []
    def completion_handler(request, error):
        if not error:
            for observation in request.results():
                texts.append(observation.topCandidates_(1)[0].string())
                
    request = VNRecognizeTextRequest.alloc().initWithCompletionHandler_(completion_handler)
    request.setRecognitionLanguages_(["ko-KR", "en-US"])
    request.setUsesLanguageCorrection_(True)
    handler.performRequests_error_([request], None)
    
    for i, t in enumerate(texts):
        # Look for "성 명" or "성명"
        clean_t = t.replace(" ", "")
        if "성명" in clean_t:
            # Usually the name is on the next line
            if i + 1 < len(texts):
                name_line = texts[i+1].strip()
                # Clean up if it contains other stuff
                name_line = name_line.split(' ')[0]
                return name_line
            
    # Fallback if not found next line, just try to find a 3-character korean word
    return None

def is_target_date(date_str):
    date_str = str(date_str).replace(" ", "")
    m_2025 = re.search(r'2025년(\d+)월', date_str)
    if m_2025:
        month = int(m_2025.group(1))
        if 6 <= month <= 12:
            return True
    m_2026 = re.search(r'2026년(\d+)월', date_str)
    if m_2026:
        month = int(m_2026.group(1))
        if 1 <= month <= 7:
            return True
    return False

def get_actual_filepath(filename_col):
    base_dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/'
    m = re.search(r'^(.*?)\s*\(Page\s*(\d+)\)$', str(filename_col))
    if m:
        base = m.group(1).strip()
        page = int(m.group(2)) - 1 # 0-indexed
        return base_dir + base, page
    else:
        # KakaoTalk etc
        return base_dir + str(filename_col).strip(), 0

file_path = '수강생_정밀분석_최종본.xlsx'
df_dict = pd.read_excel(file_path, sheet_name=None)
updated_count = 0

for sheet_name in ['시트1', '시트2']:
    if sheet_name not in df_dict: continue
    df = df_dict[sheet_name]
    for idx, row in df.iterrows():
        if is_target_date(row['수강시작일']):
            pdf_path, page_num = get_actual_filepath(row['파일명'])
            if pdf_path.endswith('.pdf'):
                new_name = extract_name_from_pdf(pdf_path, page_num)
                if new_name:
                    print(f"[{sheet_name}] Updating {row['성명']} -> {new_name} for {row['파일명']}")
                    df.at[idx, '성명'] = new_name
                    updated_count += 1
            else:
                # Handle JPEG if needed? 
                pass

if updated_count > 0:
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        for sheet_name, df in df_dict.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    print(f"Update complete! {updated_count} rows updated.")
else:
    print("No rows updated.")
