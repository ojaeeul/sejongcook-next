
import json
import os

file_path = 'public/data/honor_data.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated = False
    for item in data:
        if 'hit' not in item:
            item['hit'] = 0
            updated = True
        elif item['hit'] is None:
             item['hit'] = 0
             updated = True
        
        # Ensure stars is a number
        if 'stars' in item:
            try:
                item['stars'] = int(item['stars'])
            except:
                item['stars'] = 5
        
        # Ensure textScale is a number
        if 'textScale' in item:
            try:
                item['textScale'] = float(item['textScale'])
            except:
                item['textScale'] = 1.0

    if updated:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print("Successfully updated honor_data.json with missing fields.")
    else:
        print("No updates needed for honor_data.json.")

except Exception as e:
    print(f"Error updating file: {e}")
