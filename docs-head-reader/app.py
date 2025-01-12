import os
import fitz
import cv2
from lib import *

SUPPORTED_DOCUMENT_TYPE = ["inv", "ca"]
TEXT_COLOR_FADE_OFFSET =  120
DOT_PER_LINE_OFFSET = 3
LINE_HEIGHT_OFFSET = 10

INV_HEADER_POSITION = ((1548, 222), (2400, 1052))
# INV_LEFT_SIDE = ((1548, 222), (1856, 1052))
# INV_RIGHT_SIDE = ((1884, 222), (2400, 1052))

CA_HEADER_POSITION = ((1340, 353), (2380, 748)) 
# CA_LEFT_SIDE = ((1791, 353), (1856, 748)) fake
# CA_RIGHT_SIDE = ((1884, 353), (2300, 748)) fake

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
        # process on first page only
        if int(file_name.split("_")[1].split("-")[0]) == 1:
          image = cv2.imread(f"./src/temp/{document_type}/raw-file-png/{file_name}")
          header_image = get_header_image(image, mode=document_type)
          cv2.imwrite(f"./src/temp/{document_type}/header/{get_filename_only(file_name)}_header.png", header_image)
          split_line(header_image, get_filename_only(file_name), document_type)
      
if __name__ == "__main__":
    main()
