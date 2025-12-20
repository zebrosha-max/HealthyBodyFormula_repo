import fitz  # PyMuPDF
import os

CERT_DIR = r"D:\GpT_docs\HealthyBodyFormula\HBF_web\Certificates"

# Настройки:
# page.set_rotation(90) поворачивает ПО ЧАСОВОЙ стрелке.
# Если документ в PDF лежит "на левом боку" (заголовком влево), нужно повернуть на 90.
# Если "на правом боку" (заголовком вправо) — на -90 (270).
ROTATION_OVERRIDES = {
    "diploma_netology.pdf": 270,  # -90
    "imaton.pdf": 270,
    "ano_dpo_nadpo.pdf": 270,
    "inpo_sve_iin.pdf": 0
}

def optimize_certificates():
    print(f"🚀 Исправленная конвертация (Метод set_rotation) в: {CERT_DIR}")
    
    files = [f for f in os.listdir(CERT_DIR) if f.lower().endswith('.pdf')]
    
    for filename in files:
        pdf_path = os.path.join(CERT_DIR, filename)
        
        try:
            doc = fitz.open(pdf_path)
            base_name = os.path.splitext(filename)[0]
            rotation_angle = ROTATION_OVERRIDES.get(filename, 0)
            
            print(f"\n📄 {filename} | Поворот: {rotation_angle}")

            for i, page in enumerate(doc):
                # 1. Сначала жестко задаем поворот страницы
                # Это заставляет PyMuPDF пересчитать page.rect
                page.set_rotation(rotation_angle)
                
                # 2. Теперь просто рендерим с зумом (без вращения в матрице)
                mat = fitz.Matrix(2.0, 2.0)
                
                # get_pixmap автоматически возьмет новый page.rect
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                img_name = f"{base_name}_optimized_{i}.jpg"
                img_path = os.path.join(CERT_DIR, img_name)
                
                pix.save(img_path, output="jpg", jpg_quality=90)
                print(f"   ✅ Стр {i+1}: {pix.width}x{pix.height}")

                # Превью (первая страница)
                if i == 0:
                    preview_name = f"{base_name}_preview.jpg"
                    preview_path = os.path.join(CERT_DIR, preview_name)
                    
                    mat_preview = fitz.Matrix(0.4, 0.4)
                    pix_preview = page.get_pixmap(matrix=mat_preview, alpha=False)
                    
                    pix_preview.save(preview_path, output="jpg", jpg_quality=85)
                    print(f"   🖼️ Превью обновлено")

            doc.close()
            
        except Exception as e:
            print(f"❌ Ошибка с {filename}: {e}")

if __name__ == "__main__":
    optimize_certificates()
