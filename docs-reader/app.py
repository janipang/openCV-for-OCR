import os
import cv2
import fitz
from header_scanner import *
from table_scanner import *

SUPPORTED_DOCUMENT_TYPE = ["inv", "ca"]

# def main2():
  # # scan  all pdf files to png
#   scanAll(input_folder="./src/raw-file/inv", output_folder="./src/temp/inv-png")

  # extract table from all png files
#   inv_files = scan_files("./src/temp/inv-png")
#   for file_name in inv_files:
#     table_img = extract_dynamic_table(f"./src/temp/inv-png/{file_name}", 1010)
#     cv2.imwrite(f"./src/temp/main-box/{file_name}", table_img)

  # extract line from all png tables
#   table_files = scan_files("./src/temp/main-box")
#   for file_name in table_files:
#     table_img = cv2.imread(f"./src/temp/main-box/{file_name}")
#     num_lines = extract_text_lines_by_spacing(table_img, 'main_box', output_dir=f"./src/temp/extracted_lines/{file_name.split('.')[0]}")


def main():
  
  # convert all files to image
    files_name = scan_files("./src/raw-file")
    for file_name in files_name:
        document_type = check_document_type_by_name(file_name)
        convert_file_to_image(file_name, "./src/raw-file", document_type)

    for document_type in SUPPORTED_DOCUMENT_TYPE:
      # snippet header field from all image files
      files_name = scan_files(f"./src/temp/{document_type}/raw-file-png")

      for file_name in files_name:
        """
        file_name: INVYYYYMMDDXXXX_1-n.png
        """
        # get header lines from first page only
        if int(file_name.split("_")[1].split("-")[0]) == 1:
          image = cv2.imread(f"./src/temp/{document_type}/raw-file-png/{file_name}")
          header_image = get_header_image(image, mode=document_type)
          cv2.imwrite(f"./src/temp/{document_type}/header/{get_filename_only(file_name)}_header.png", header_image)
          split_line(header_image, get_filename_only(file_name), document_type)

        # extract table from all png files
        table_img = extract_dynamic_table(f"./src/temp/{document_type}/raw-file-png/{file_name}", 1010)
        cv2.imwrite(f"./src/temp/{document_type}/table/{file_name}", table_img)
        extract_text_lines_by_spacing(table_img, file_name.split('.'[0]), output_dir=f"./src/temp/{document_type}/lines/{get_filename_only(file_name)}/table/{file_name.split('_')[1].split('-')[0]}")

if __name__ == "__main__":
    main()