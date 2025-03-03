from document import *
from bounding_box import *
from services import *

import sys
import json

if __name__ == "__main__":
    input_dir = sys.argv[1]
    output_dir = sys.argv[2]
    output_file_name = sys.argv[3]
    selected_field = json.loads(sys.argv[4])

    process_file(selected_field, input_dir, f"{output_dir}/{output_file_name}.xlsx")