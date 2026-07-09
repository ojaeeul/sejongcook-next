import json

with open("questions_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

js_content = """function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

window.EXAM_DATA_DB = """
js_content += json.dumps(data, ensure_ascii=False, indent=2)
js_content += ";\n"

with open("questions_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("questions_data.js updated!")
