from document import *

template_file_path = './src/raw-file/INV202411010001.pdf'

d = Document(template_file_path)
d.process_as_sample(output_dir="./src/template/bounded")
