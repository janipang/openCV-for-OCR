from document import *
from services import *

import sys

# I CHANGE THIS : add this file
if __name__ == "__main__":
    print("template_file_path:", sys.argv[1])
    print("field-raw:", sys.argv[2])
    print("json_save_path:", sys.argv[3])
    print("image_save_path:", sys.argv[4])
    print("bounded_file_path:", sys.argv[5])
    
    
    template_file_path = sys.argv[1]
    field = json.loads(sys.argv[2])
    json_save_path = sys.argv[3]
    image_save_path = sys.argv[4]
    bounded_file_path = sys.argv[5]
    draw_only_selected_field(template_file_path, field, json_save_path, image_save_path, bounded_file_path)
