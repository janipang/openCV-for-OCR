from document import *
from services import *

import sys

# I CHANGE THIS : add this file
if __name__ == "__main__":
    template_file_path = sys.argv[1]
    # I CHANGE THIS
    field = json.loads(sys.argv[2])
    json_save_path = sys.argv[3]
    image_save_dir = sys.argv[4]
    bounded_dir = sys.argv[5]
    
    draw_only_selected_field(template_file_path, field, json_save_path, image_save_dir, bounded_dir)
