from document import *
from services import *

import sys

if __name__ == "__main__":
    document_object_path = sys.argv[1]
    field = sys.argv[2]
    json_save_path = sys.argv[3]
    image_save_path = sys.argv[4]
    
    draw_only_selected_field_by_json_object(document_object_path, field, json_save_path, image_save_path)
