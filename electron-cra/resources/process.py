from document import *
from bounding_box import *
from services import *

import sys
import json

if __name__ == "__main__":
    input_dir = sys.argv[1]
    output_dir = sys.argv[2]
    output_file_name = sys.argv[3]
    # I CHANGE THIS : the 4th n 5th params
    json_field_file_path = sys.argv[4]
    read_table = sys.argv[5]

    # I CHANGE THIS : last params
    process_file(json_field_file_path, input_dir, f"{output_dir}/{output_file_name}.xlsx", read_table = True)
