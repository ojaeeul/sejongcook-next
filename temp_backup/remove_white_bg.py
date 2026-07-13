from PIL import Image
import numpy as np

input_path = "public/img/premium_gold_star.png"
output_path = "public/img/premium_gold_star.png"

try:
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # Define white threshold (e.g., pixels brighter than 230 in all channels)
    # Adjust this if the white is not pure white or has compression artifacts
    r, g, b, a = data.T
    white_areas = (r > 200) & (g > 200) & (b > 200)

    # Set alpha to 0 for white areas
    data[..., 3][white_areas.T] = 0

    # Create new image
    new_img = Image.fromarray(data)
    new_img.save(output_path)
    print(f"Successfully removed white background from {output_path}")

except Exception as e:
    print(f"Error processing image: {e}")
