import pypdfium2 as pdfium
import os

pdf_path = r'C:\Users\aliay\Downloads\نسخة قالب تقرير ملف العقار.pdf'
out_dir = r'C:\Users\aliay\Downloads\pdf_preview'
os.makedirs(out_dir, exist_ok=True)

pdf = pdfium.PdfDocument(pdf_path)
for i in range(len(pdf)):
    bitmap = pdf[i].render(scale=2.5)
    img = bitmap.to_pil()
    img.save(os.path.join(out_dir, f'page_{i+1}.png'))
    print(f'Saved page {i+1}: {img.size}')

print(f'Done: {len(pdf)} pages')
