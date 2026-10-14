import os
import zipfile
import shutil

DIST_DIR = 'dist'
ZIP_NAME = 'zachai-dist.zip'
PUBLIC_ZIP = os.path.join('public', ZIP_NAME)
ARTIFACT_DIR = '.aistudio/artifacts/brain/693bab81-2b55-469c-813c-5ff2623e0683'

print("[build-zip] Compactando pasta dist para Cloudflare Pages...")

if not os.path.isdir(DIST_DIR):
    raise SystemExit(f"Erro: diretório '{DIST_DIR}' não encontrado. Execute 'npm run build' primeiro.")

# Create the zip with files at root level of the archive
with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(DIST_DIR):
        for f in files:
            if f.endswith('.zip'):
                continue
            file_path = os.path.join(root, f)
            arcname = os.path.relpath(file_path, DIST_DIR)
            zipf.write(file_path, arcname)

# Ensure copy in public/ so it can be served/downloaded via browser
os.makedirs('public', exist_ok=True)
shutil.copy(ZIP_NAME, PUBLIC_ZIP)

# Also copy into artifacts directory
if os.path.isdir('.aistudio'):
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    shutil.copy(ZIP_NAME, os.path.join(ARTIFACT_DIR, ZIP_NAME))

print(f"[build-zip] Sucesso! Arquivo '{ZIP_NAME}' criado com tamanho: {os.path.getsize(ZIP_NAME)} bytes.")
with zipfile.ZipFile(ZIP_NAME, 'r') as z:
    for item in z.infolist():
        print(f"  -> {item.filename} ({item.file_size} B)")
