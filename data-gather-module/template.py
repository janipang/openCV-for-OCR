from document import *
from services import *

template_file_path = './src/raw-file/INV202411010002.pdf'

d = Document(template_file_path)
d.process_as_sample(output_dir="./src/template/bounded")
process_file_as_sample(template_file_path, output_dir="./src/template/bounded")
