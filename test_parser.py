import re

items = [
    {'y': 0.543, 'x': 0.687, 'text': '4374 5352'},
    {'y': 0.540, 'x': 0.657, 'text': '0l0'},
    {'y': 0.520, 'x': 0.707, 'text': '4616 2481'},
    {'y': 0.517, 'x': 0.655, 'text': '010'},
    {'y': 0.761, 'x': 0.642, 'text': '010. 7243. 6763'},
    {'y': 0.739, 'x': 0.644, 'text': '010. 3343. 806(4)'}
]

# Sort by Y descending
items.sort(key=lambda item: item['y'], reverse=True)

lines = []
current_line = []
current_y = None

for item in items:
    if current_y is None:
        current_y = item['y']
        current_line.append(item)
    else:
        if abs(current_y - item['y']) < 0.015:
            current_line.append(item)
            # update current_y to average
            current_y = sum(i['y'] for i in current_line) / len(current_line)
        else:
            lines.append(current_line)
            current_line = [item]
            current_y = item['y']
if current_line:
    lines.append(current_line)

for line in lines:
    line.sort(key=lambda item: item['x'])
    text = " ".join(i['text'] for i in line)
    
    # Fix common OCR mistakes for numbers
    text = text.replace('0l0', '010').replace('0lo', '010').replace('O', '0').replace('o', '0')
    
    print(text)
