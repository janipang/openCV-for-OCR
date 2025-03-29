from document import *
from services import *

import sys

# I CHANGE THIS : add this file
if __name__ == "__main__":
    plain_png_path = sys.argv[1]
    field = sys.argv[2]
    json_save_path = sys.argv[3]
    image_save_path = sys.argv[4]
    
    draw_only_selected_field(plain_png_path, field, json_save_path, image_save_path)
