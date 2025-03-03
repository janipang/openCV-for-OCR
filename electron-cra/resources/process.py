from document import *
from bounding_box import *
from services import *

output_dir = "./src/data"
output_file_name = "user_output_file_name"
selected_field = [1,2,4]

process_file(selected_field, input_dir = "./src/raw-file", output_dir = f"{output_dir}/{output_file_name}.xlsx")
