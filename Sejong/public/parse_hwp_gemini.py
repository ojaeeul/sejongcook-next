import olefile
import zlib
import sys
import json
import os
import requests

ENV_PATH = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/.env.local"
def load_api_keys():
    if not os.path.exists(ENV_PATH): return []
    with open(ENV_PATH, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEYS="):
                return line.strip().split("=")[1].split(",")
    return []

API_KEYS = load_api_keys()

def get_hwp_text(filename):
    f = olefile.OleFileIO(filename)
    dirs = f.listdir()
    bodytext_streams = [d for d in dirs if d[0] == 'BodyText']
    if not bodytext_streams:
        return ""
        
    text = ""
    for stream_path in bodytext_streams:
        stream = f.openstream(stream_path)
        data = stream.read()
        try:
            decompressed = zlib.decompress(data, -15)
        except zlib.error:
            decompressed = data
        text += decompressed.decode('utf-16le', errors='ignore')
    return text

def parse_with_gemini(text):
    prompt = """
다음은 HWP 파일에서 강제로 추출된 객관식 시험지(문항, 보기, 정답) 텍스트입니다. 중간에 이상한 특수문자나 쓰레기값이 많습니다.
문서 전체를 읽고, 모든 객관식 문제를 누락 없이 배열로 추출하세요.
정답을 찾을 수 없는 경우 무조건 1로 설정하세요.

반드시 문제(q), 보기 4개 배열(o), 정답(a - 1,2,3,4 등의 숫자) 형태로 반환해야 합니다.
"""
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "q": {"type": "STRING", "description": "문제 지문 내용"},
                "o": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "1,2,3,4번 보기 리스트. 정확히 4개여야 함."},
                "a": {"type": "INTEGER", "description": "정답 번호 (1, 2, 3, 4)"}
            },
            "required": ["q", "o", "a"]
        }
    }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEYS[0]}"
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{"parts": [{"text": prompt + "\n\n" + text[:80000]}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return json.loads(response.json()["candidates"][0]["content"]["parts"][0]["text"])
    else:
        print(response.text)
        return []

if __name__ == "__main__":
    raw = get_hwp_text(sys.argv[1])
    res = parse_with_gemini(raw)
    print(f"Extracted {len(res)} questions!")
    print(json.dumps(res[:2], ensure_ascii=False, indent=2))
