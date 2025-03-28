import os
import shutil
import json
from PIL import Image, ImageDraw, ImageFont
from db.session import SessionLocal
from db.models import Laptop

TEMPLATE_DIR = "static/laptop_images/templates"
OUTPUT_DIR = "static/laptop_images"

db = SessionLocal()

try:
    FONT = ImageFont.truetype("arial.ttf", 128) 
except:
    FONT = ImageFont.load_default()

def write_id_on_image(src_path, dest_path, laptop_id):
    with Image.open(src_path) as img:
        draw = ImageDraw.Draw(img)
        text = f"ID: {laptop_id}"
        draw.text((10, 10), text, font=FONT, fill="black", stroke_fill='white', stroke_width=10)
        img.save(dest_path)

def process_laptops():
    laptops = db.query(Laptop).all()

    for laptop in laptops:
        image_urls = []
        for i in range(1, 4):  
            template_name = f"laptop{i}.jpg"
            src = os.path.join(TEMPLATE_DIR, template_name)
            new_name = f"{laptop.id}_img{i}.jpg"
            dest = os.path.join(OUTPUT_DIR, new_name)

            write_id_on_image(src, dest, laptop.id)
            image_urls.append(f"/static/laptop_images/{new_name}")


        laptop.product_image_mini = json.dumps(image_urls)
        print(f"Updated Laptop ID {laptop.id} with images: {image_urls}")

    db.commit()
    print("All laptops updated!")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    process_laptops()