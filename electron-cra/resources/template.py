from document import *
from services import *

import sys

if __name__ == "__main__":
    template_file_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    # template_file_path = 'C:/Users/pangj/AppData/Local/Temp/invoice-data-gathering-app/src/template/plain/INV202411010002.pdf'
    # output_dir = 'C:/Users/pangj/AppData/Local/Temp/invoice-data-gathering-app/src/template/bounded'
    
    process_file_as_sample(template_file_path, output_dir)
