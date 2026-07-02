import pandas as pd
import re

file_path = '수강생_정밀분석_최종본.xlsx'

# Read all sheets
df_dict = pd.read_excel(file_path, sheet_name=None)

def get_sort_keys(filename):
    filename = str(filename)
    # Define base order based on user's prompt
    base_order = {
        'CCF_000007.pdf': 1,
        'CCF_000008.pdf': 2,
        'pc.add.sub0103.pdf': 3,
        'KakaoTalk_Photo_2026-06-25-08-50-33.jpeg': 4
    }
    
    # Extract base filename and page number
    match = re.search(r'^(.*?)\s*\(Page\s*(\d+)\)$', filename)
    if match:
        base = match.group(1).strip()
        page = int(match.group(2))
    else:
        base = filename.strip()
        page = 0
        
    order = base_order.get(base, 99)
    return (order, base, page)

# Sort Sheet1 and Sheet2
for sheet_name in ['시트1', '시트2']:
    if sheet_name in df_dict:
        df = df_dict[sheet_name]
        # Create a temporary column for sorting
        df['_sort_key'] = df['파일명'].apply(get_sort_keys)
        df = df.sort_values(by='_sort_key')
        df = df.drop(columns=['_sort_key'])
        # Reset index
        df = df.reset_index(drop=True)
        df_dict[sheet_name] = df

# Write back to Excel
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for sheet_name, df in df_dict.items():
        df.to_excel(writer, sheet_name=sheet_name, index=False)

print("Sorting completed.")
