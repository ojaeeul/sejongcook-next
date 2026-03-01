import urllib.request

# This is a green sprout/side dish image from Unsplash
url = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1280"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        with open("public/sukju_display.jpg", "wb") as out_file:
            out_file.write(response.read())
    print("Download successful")
except Exception as e:
    print(f"Failed to download image: {e}")
