import os
import fitz
import cv2
from lib import scan_files, convert_file_to_image, check_document_type_by_name

HEADER_POSITION = ((1548, 222), (2400, 1052))
LEFT_SIDE = ((1548, 222), (1856, 1052))
RIGHT_SIDE = ((1884, 222), (2400, 1052))
TEXT_COLOR_FADE_OFFSET =  120
DOT_PER_LINE_OFFSET = 3
LINE_HEIGHT_OFFSET = 10


def get_filename_only(filename):
  return filename.split("_")[0]

def isAllZero(dot_data):
  for dot in dot_data:
    if dot > DOT_PER_LINE_OFFSET:
      return False
  return True
  
def lastNisZero(dot_data, n = LINE_HEIGHT_OFFSET):
  return isAllZero(dot_data[-n:])

def save_line_image(image, y_start, y_stop, line_number, filename, target_dir ="./src/temp/header-lines/inv"):
  os.makedirs(os.path.join(target_dir, filename), exist_ok=True)
  cv2.imwrite(os.path.join(f"{target_dir}/{filename}/line-{line_number + 1}.png"), image[y_start: y_stop + 1])
  
def get_header_image(image):
  ((x_start, y_start), (x_end, y_end)) = HEADER_POSITION
  return image[y_start:y_end, x_start:x_end]
  
def split_line(header_image, filename):
    # variables
    line_start = 0
    line_stop = 0
    dot_data = []
    
    line_finished = False
    lines_saved = 0
    
    # process line up to down
    for line_num in range(len(header_image)):
      line = header_image[line_num]
      dot = 0
      # process pixel left to reight
      for pixel_num in range(len(line)):
        pixel = line[pixel_num]
        
        # count dots up when pixel color is black
        if sum(pixel.astype(int))/3 <= 0 + TEXT_COLOR_FADE_OFFSET:
          dot += 1
          
      line_stop += 1
      dot_data.append(dot)
      
      # if no dot appears move pointer down
      if dot < DOT_PER_LINE_OFFSET and isAllZero(dot_data) and (line_stop - line_start) + 1 > LINE_HEIGHT_OFFSET: # line empty and stack full of empty lines
        line_start += 1
        dot_data.pop(0)
        
      # if reach the bottom of text
      if not isAllZero(dot_data) and lastNisZero(dot_data):
        line_finished = True
      
      # save picture when the line passed
      if line_finished:
        save_line_image(header_image, line_start, line_stop, lines_saved, filename)
        lines_saved += 1
        line_start = line_stop
        dot_data = []
        line_finished = False

def main():
  
  # convert all files to image
    files_name = scan_files("./src/raw-file")
    for file_name in files_name:
        document_type = check_document_type_by_name(file_name)
        convert_file_to_image(file_name, "./src/raw-file", document_type)

    # snippet header field from all image files
    files_name = scan_files("./src/temp/raw-file-png/inv")
    for file_name in files_name:
      # process on first page only
      if int(file_name.split("_")[1].split("-")[0]) == 1:
        image = cv2.imread(f"./src/temp/raw-file-png/inv/{file_name}")
        header_image = get_header_image(image)
        cv2.imwrite(f"./src/temp/header/{get_filename_only(file_name)}_header.png", header_image)
        split_line(header_image, get_filename_only(file_name))
      
if __name__ == "__main__":
    main()
