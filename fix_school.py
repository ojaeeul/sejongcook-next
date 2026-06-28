import pandas as pd
import re
from datetime import datetime

# Load the original successful CSV
df = pd.read_csv('수강생_정밀분석.csv')

def fix_school(row):
    school = str(row['학교']).strip()
    if pd.isna(row['학교']) or school == 'nan':
        school = ''
        
    dob = str(row['생년월일']).strip()
    
    # Extract birth year
    match = re.search(r'(\d{4})년', dob)
    if match:
        year = int(match.group(1))
        age = 2026 - year
        
        # If age is 20 or older, they are adults. 
        # The AI hallucinated "풍무중학교 3학년" for many adults.
        # So if they are an adult and the school says "풍무중학교 3학년" or "풍무고등학교 3학년", we change it to '일반'.
        # Actually, for adults, if they wrote a school, it might be a university. But the AI just hallucinated middle schools.
        if age >= 19:
            if '중학교' in school or '초등학교' in school or '고등학교' in school:
                return '일반'
            if school == '':
                return '일반'
                
        # If age is less than 19 (e.g. 15), and the AI says "풍무중학교 3학년", it might be correct.
        # But if the school is empty, we leave it empty.
    
    # If there's no birth year, just keep as is, but clean up hallucinated "풍무중학교 3학년" if the person is obviously an adult.
    if school == '풍무중학교 3학년' and match is None:
        # If no DOB, we can't be sure, but we'll leave it as is, or maybe they are a student.
        pass
        
    return school

df['학교'] = df.apply(fix_school, axis=1)

# Split into Sheet 1 and Sheet 2 based on filenames
# CCF_000007.pdf and CCF_000008.pdf -> Sheet 1
# pc.add.sub0103.pdf -> Sheet 2

df_sheet1 = df[df['파일명'].str.contains('CCF_00000|KakaoTalk', na=False)]
df_sheet2 = df[df['파일명'].str.contains('pc.add.sub0103', na=False)]
df_other = df[~df['파일명'].str.contains('CCF_00000|KakaoTalk|pc.add.sub0103', na=False)]

writer = pd.ExcelWriter('수강생_정밀분석_최종본.xlsx', engine='xlsxwriter')

df_sheet1.to_excel(writer, sheet_name='시트1', index=False)
df_sheet2.to_excel(writer, sheet_name='시트2', index=False)

if not df_other.empty:
    df_other.to_excel(writer, sheet_name='기타', index=False)

writer.close()

print("Excel file created: 수강생_정밀분석_최종본.xlsx")
