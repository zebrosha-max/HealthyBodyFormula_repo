import os
from PIL import Image

# Путь к картинкам
source_dir = "Recipes/images"
target_size = (800, 800)

def optimize_images():
    if not os.path.exists(source_dir):
        print(f"Directory {source_dir} not found.")
        return

    files = [f for f in os.listdir(source_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    for filename in files:
        filepath = os.path.join(source_dir, filename)
        try:
            with Image.open(filepath) as img:
                # Конвертируем в RGB если нужно (для PNG с прозрачностью или JPEG)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Ресайз с сохранением пропорций (thumbnail) или crop
                # В данном случае нам нужен "Cover", но для простоты сделаем resize to fill
                # Сначала ресайзим так, чтобы меньшая сторона стала 800
                ratio = max(target_size[0] / img.size[0], target_size[1] / img.size[1])
                new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
                
                # Если картинка меньше целевого размера, не трогаем, иначе уменьшаем
                if ratio < 1:
                    img = img.resize(new_size, Image.Resampling.LANCZOS)
                
                # Перезаписываем как JPG для легкости (или оставляем PNG если критично, но лучше JPG для фото)
                # Сохраним как тот же файл
                img.save(filepath, quality=85, optimize=True)
                print(f"Optimized: {filename} -> {img.size}")
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    optimize_images()
