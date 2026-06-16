from PIL import Image
import glob
import os

files = glob.glob('/Users/ojaeeul/.gemini/antigravity-ide/brain/ff5ad7ee-cf33-41f8-babb-f90a722ff773/*_new_*.png')
out_dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/images/'

for i, f in enumerate(files):
    img = Image.open(f).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    
    if "f1_new" in f:
        name = "f1.png"
    elif "m1_new" in f:
        name = "m1.png"
    elif "m2_new" in f:
        name = "m2.png"
    else:
        continue
    
    img.save(os.path.join(out_dir, name), "PNG")
    print(f"Saved new {name}")
