# docs-head-reader
  ## package installation
```bash
pip install opencv-python pymupdf
```
  ## run programs
``` bash 
cd docs-head-reader
```
``` bash 
cd python app.py
```
  ## outcomes
- feed input pdf files in src/raw-file folder
- run program
- output saved at src/temp/{document_type}/lines
  
# docs-data-collector
  ## package installation
  ** please install tesseract-ocr on your pc first **
```bash
pip install opencv-python pymupdf pandas pytesseract pillow
```
  ## run programs
``` bash 
cd docs-data-collector
```
``` bash 
cd python app.py
```
  ## outcomes
- feed input pdf files in src/raw-file folder
- run program
- output saved at src/data
  
# electron-cra
  ## install dependencies
``` bash
cd electron-cra
npm install
cd app
npm install
```
  ## build react app
```bash
npm run build
```
  ## run electron app
``` bash 
cd ..
npm run dev
```
