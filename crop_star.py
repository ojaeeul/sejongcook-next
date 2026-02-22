from PIL import Image
import os

input_path = "/Users/ojaeeul/.gemini/antigravity/brain/23032fb7-347c-4179-8a67-15c7f7feb461/uploaded_media_1769975320172.png"
output_path = "public/img/premium_gold_star.png"

try:
    img = Image.open(input_path)
    width, height = img.size
    
    # Calculate crop box for the center star
    # Assuming the center star is roughly in the middle 1/3 of the image
    # and roughly square.
    
    # Let's verify image size first to be safe, but we'll try a generous center crop
    # The image has 3 stars, so the center one is likely in the middle 33-40% of width
    
    # Center X
    center_x = width / 2
    center_y = height / 2
    
    # Crop size - let's guess based on aspect ratio. 
    # If it's a wide image (3 stars side by side), height is likely the constraining factor for the star size.
    # Let's crop a square based on height, maybe 90% of height?
    crop_size = height * 0.95
    
    left = center_x - (crop_size / 2)
    top = center_y - (crop_size / 2)
    right = center_x + (crop_size / 2)
    bottom = center_y + (crop_size / 2)
    
    # Adding a small vertical offset if needed? Use reference image shows stars are aligned.
    # We will just center crop.
    
    img_cropped = img.crop((left, top, right, bottom))
    
    # Ensure public/img exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    img_cropped.save(output_path)
    print(f"Successfully cropped star to {output_path}")

except Exception as e:
    print(f"Error processing image: {e}")
