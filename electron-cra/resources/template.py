from document import *
from services import *

import sys

if __name__ == "__main__":
    template_file_path = sys.argv[1]
    output_dir = sys.argv[2]
    object_store_path = sys.argv[3]
    
    process_file_as_sample(template_file_path, output_dir, object_store_path)
