
file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.js'

try:
    with open(file_path, 'rb') as f:
        content = f.read()
        
    search_term = "양식_2021".encode('utf-8')
    if search_term in content:
        print("Found UTF-8 '양식_2021'")
    else:
        print("Not found UTF-8 '양식_2021'")
        
    search_term_cp949 = "양식_2021".encode('cp949')
    if search_term_cp949 in content:
        print("Found CP949 '양식_2021'")
    else:
        print("Not found CP949 '양식_2021'")
        
except Exception as e:
    print(f"Error: {e}")
