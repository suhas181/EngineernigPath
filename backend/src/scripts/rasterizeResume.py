import sys
import os
import json
import base64
import subprocess
import tempfile
import fitz  # PyMuPDF

def rasterize_document(input_path):
    temp_dir = None
    target_pdf = input_path

    # Handle DOCX conversion to PDF via LibreOffice headless
    if input_path.lower().endswith('.docx'):
        temp_dir = tempfile.mkdtemp()
        cmd = [
            'libreoffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', temp_dir,
            input_path
        ]
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            base_name = os.path.splitext(os.path.basename(input_path))[0]
            target_pdf = os.path.join(temp_dir, base_name + '.pdf')
        except Exception as e:
            sys.stderr.write(f"Docx conversion error: {str(e)}\n")
            return []

    images_b64 = []
    try:
        doc = fitz.open(target_pdf)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap(dpi=150)
            png_bytes = pix.tobytes("png")
            b64_str = base64.b64encode(png_bytes).decode('utf-8')
            images_b64.append(b64_str)
        doc.close()
    except Exception as e:
        sys.stderr.write(f"PyMuPDF rasterization error: {str(e)}\n")

    return images_b64

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(1)

    file_path = sys.argv[1]
    results = rasterize_document(file_path)
    print(json.dumps(results))
