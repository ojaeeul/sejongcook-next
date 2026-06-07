import os
import glob

api_routes = glob.glob("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/app/api/sejong/**/route.ts", recursive=True)

for route in api_routes:
    with open(route, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "export const dynamic = 'force-dynamic';" not in content:
        content = "export const dynamic = 'force-dynamic';\n" + content
        with open(route, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed caching in {route}")
    else:
        print(f"Already fixed in {route}")
