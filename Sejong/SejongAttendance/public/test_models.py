import requests, json
from batch_parse_exams import API_KEYS
key = API_KEYS[0]
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
resp = requests.get(url)
print(json.dumps([m['name'] for m in resp.json().get('models', [])], indent=2))
