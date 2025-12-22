import os
from PIL import Image

# Конфигурация
source_dir = "Recipes/images"
target_max_side = 800
quality = 85

def needs_optimization(img, filename):
    """
    Проверяет, соответствует ли изображение стандартам проекта.
    """
    # 1. Проверка формата (должен быть JPEG)
    if not filename.lower().endswith(('.jpg', '.jpeg')):
        return True
    
    # 2. Проверка цветовой модели (должна быть RGB)
    if img.mode != "RGB":
        return True
    
    # 3. Проверка размеров (стороны не должны быть больше целевого максимума)
    width, height = img.size
    if width > target_max_side or height > target_max_side:
        return True
        
    return False

def optimize_images():
    if not os.path.exists(source_dir):
        print(f"Directory {source_dir} not found.")
        return

    files = [f for f in os.listdir(source_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    optimized_count = 0
    skipped_count = 0
    
    for filename in files:
        filepath = os.path.join(source_dir, filename)
        try:
            with Image.open(filepath) as img:
                if not needs_optimization(img, filename):
                    print(f"Skipped (already optimal): {filename}")
                    skipped_count += 1
                    continue
                
                # Если дошли сюда, значит оптимизация нужна
                print(f"Optimizing: {filename}...")
                
                # Конвертация в RGB
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Расчет новых размеров (сохраняем пропорции, ограничиваем длинную сторону)
                width, height = img.size
                if width > height:
                    if width > target_max_side:
                        new_width = target_max_side
                        new_height = int(height * (target_max_side / width))
                        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                else:
                    if height > target_max_side:
                        new_height = target_max_side
                        new_width = int(width * (target_max_side / height))
                        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Определяем путь сохранения (всегда .jpg)
                base_name = os.path.splitext(filename)[0]
                new_filepath = os.path.join(source_dir, f"{base_name}.jpg")
                
                # Сохраняем
                img.save(new_filepath, "JPEG", quality=quality, optimize=True)
                
                # Если исходный файл был не .jpg, удаляем старый (если имена разные)
                if filepath != new_filepath:
                    os.remove(filepath)
                    print(f"Converted and replaced: {filename} -> {base_name}.jpg")
                
                optimized_count += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print(f"\nDone! Optimized: {optimized_count}, Skipped: {skipped_count}")

if __name__ == "__main__":
    optimize_images()