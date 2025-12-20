import fitz  # PyMuPDF
import os

CERT_DIR = r"D:\GpT_docs\HealthyBodyFormula\HBF_web\Certificates"

# Настройки поворота для конкретных файлов (из старого HTML)
# 270 градусов = -90 градусов (против часовой)
ROTATION_OVERRIDES = {
    "diploma_netology.pdf": 270,
    "imaton.pdf": 270,
    "ano_dpo_nadpo.pdf": 270,
    "inpo_sve_iin.pdf": 0
}

def optimize_certificates():
    print(f"🚀 Начинаем обработку в: {CERT_DIR}")
    
    files = [f for f in os.listdir(CERT_DIR) if f.lower().endswith('.pdf')]
    
    if not files:
        print("PDF файлы не найдены.")
        return

    # Сначала удалим старые _optimized файлы, чтобы не мусорить
    for f in os.listdir(CERT_DIR):
        if "_optimized" in f:
            os.remove(os.path.join(CERT_DIR, f))

    generated_map = {} # Словарь: имя_пдф -> список_картинок

    for filename in files:
        pdf_path = os.path.join(CERT_DIR, filename)
        images_created = []
        
        try:
            doc = fitz.open(pdf_path)
            base_name = os.path.splitext(filename)[0]
            
            # Определяем, нужен ли принудительный поворот
            manual_rotation = ROTATION_OVERRIDES.get(filename, 0)
            
            print(f"\n📄 Обработка: {filename} ({doc.page_count} стр.)")

            for i, page in enumerate(doc):
                # 1. Основное изображение (Высокое качество)
                # Устанавливаем поворот
                page.set_rotation(manual_rotation)
                
                # Zoom = 2 (высокое качество для Retina)
                mat = fitz.Matrix(2, 2)
                pix = page.get_pixmap(matrix=mat)
                
                # Формируем имя: name_optimized_0.jpg, name_optimized_1.jpg
                img_name = f"{base_name}_optimized_{i}.jpg"
                img_path = os.path.join(CERT_DIR, img_name)
                
                pix.save(img_path, output="jpg", jpg_quality=85)
                images_created.append(f"Certificates/{img_name}")
                print(f"   Saved Page {i+1}: {img_name}")

                # 2. Превью (Только для первой страницы)
                if i == 0:
                    preview_name = f"{base_name}_preview.jpg"
                    preview_path = os.path.join(CERT_DIR, preview_name)
                    
                    # Zoom = 0.3 (маленькая картинка для превью)
                    mat_preview = fitz.Matrix(0.3, 0.3)
                    pix_preview = page.get_pixmap(matrix=mat_preview)
                    
                    pix_preview.save(preview_path, output="jpg", jpg_quality=80)
                    print(f"   Updated Preview: {preview_name}")

            doc.close()
            generated_map[filename] = images_created
            
        except Exception as e:
            print(f"❌ Ошибка с {filename}: {e}")

    return generated_map

if __name__ == "__main__":
    optimize_certificates()
