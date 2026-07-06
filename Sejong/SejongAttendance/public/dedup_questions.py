import json

def normalize_text(text):
    if not text: return ""
    return text.replace(" ", "").replace("\n", "").strip()

with open('questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cooking_prefixes = ('한식', '양식', '일식', '중식', '복어')
baking_prefixes = ('제과', '제빵')

cooking_keys = [k for k in data.keys() if k.startswith(cooking_prefixes)]
baking_keys = [k for k in data.keys() if k.startswith(baking_prefixes)]

def deduplicate(keys, category_name):
    seen = set()
    total_before = 0
    total_after = 0
    removed = 0
    
    for k in keys:
        original_list = data[k]
        total_before += len(original_list)
        new_list = []
        for q_obj in original_list:
            q_text = q_obj.get('q', '')
            norm_q = normalize_text(q_text)
            if not norm_q:
                new_list.append(q_obj)
                continue
                
            if norm_q not in seen:
                seen.add(norm_q)
                new_list.append(q_obj)
            else:
                removed += 1
        data[k] = new_list
        total_after += len(new_list)
        
    print(f"[{category_name}] Before: {total_before}, After: {total_after}, Removed: {removed}")

deduplicate(cooking_keys, "조리과정")
deduplicate(baking_keys, "제과제빵")

with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved to questions_data.json")
