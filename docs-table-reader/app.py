import os
import cv2
from lib import *

def main():
  # # scan  all pdf files to png
  scanAll(input_folder="./src/raw-file/inv", output_folder="./src/temp/inv-png")

  # extract table from all png files
  inv_files = scan_files("./src/temp/inv-png")
  for file_name in inv_files:
    table_img = extract_dynamic_table(f"./src/temp/inv-png/{file_name}", 1010)
    cv2.imwrite(f"./src/temp/main-box/{file_name}", table_img)

  # extract line from all png tables
  table_files = scan_files("./src/temp/main-box")
  for file_name in table_files:
    table_img = cv2.imread(f"./src/temp/main-box/{file_name}")
    num_lines = extract_text_lines_by_spacing(table_img, 'main_box', output_dir=f"./src/temp/extracted_lines/{file_name.split('.')[0]}")


if __name__ == "__main__":
    main()