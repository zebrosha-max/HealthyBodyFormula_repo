import os
from PIL import Image

SOURCE_DIR = "Recipes/images"
TARGET_SIZE = (800, 800)
QUALITY = 85

def optimize():
    print(f"Scanning {SOURCE_DIR}...")
    
    # Map old specific names to IDs for the first 4 recipes (legacy support)
    legacy_map = {
        "ovsyanoblin.png": 1,
        "kinoa_shrimp_bowl.png": 2,
        "brokkoli_muffin.png": 3,
        "chia_dessert.png": 4
    }

    files = os.listdir(SOURCE_DIR)
    
    for filename in files:
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            filepath = os.path.join(SOURCE_DIR, filename)
            
            # Determine Recipe ID
            recipe_id = None
            
            # Case 1: idX.png/jpg
            if filename.lower().startswith("id"):
                try:
                    # Extract number part "id5.png" -> "5"
                    name_part = os.path.splitext(filename)[0] # "id5"
                    recipe_id = int(name_part.replace("id", ""))
                except ValueError:
                    pass
            
            # Case 2: Legacy names
            elif filename in legacy_map:
                recipe_id = legacy_map[filename]
            
            if recipe_id:
                try:
                    with Image.open(filepath) as img:
                        # Convert to RGB (remove alpha channel if PNG)
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGB")
                        
                        # Resize maintaining aspect ratio (cover) or just resize? 
                        # User asked for resizing. We'll use thumbnail to fit in box or resize.
                        # Since we want square-ish for thumbnails but maybe wide for header?
                        # Let's stick to max width/height 1000px to be safe for both.
                        img.thumbnail((1000, 1000))
                        
                        new_filename = f"recipe_{recipe_id}.jpg"
                        new_filepath = os.path.join(SOURCE_DIR, new_filename)
                        
                        img.save(new_filepath, "JPEG", quality=QUALITY)
                        print(f"Optimized: {filename} -> {new_filename}")
                        
                        # Remove original if it's different name
                        if filename != new_filename:
                            os.remove(filepath)
                            print(f"Removed source: {filename}")
                            
                except Exception as e:
                    print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    optimize()