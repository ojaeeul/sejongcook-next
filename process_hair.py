from PIL import Image
import glob
import os

files = glob.glob('/Users/ojaeeul/.gemini/antigravity-ide/brain/ff5ad7ee-cf33-41f8-babb-f90a722ff773/*_hair_*.png')
out_dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/images/'

for i, f in enumerate(files):
    img = Image.open(f).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        # white threshold
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    
    # Save as m1.png, m2.png, f1.png based on filename
    name = "f" if "woman" in f else "m"
    idx = "1" if "1_" in f else "2"
    
    img.save(os.path.join(out_dir, f"{name}{idx}.png"), "PNG")
    print(f"Saved {name}{idx}.png")
