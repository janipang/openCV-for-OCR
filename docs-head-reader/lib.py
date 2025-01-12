import os
import fitz
import cv2

from app import TEXT_COLOR_FADE_OFFSET, DOT_PER_LINE_OFFSET, LINE_HEIGHT_OFFSET, INV_HEADER_POSITION, CA_HEADER_POSITION

def scan_files(folder_path):
    return os.listdir(folder_path)

def check_document_type_by_name(file_name):
    if file_name.startswith("INV"):
        return "inv"
    elif file_name.startswith("CA"):
        return "ca"
    else:
        return "unk"

def convert_file_to_image(
    file_name,
    src_directory,
    document_type,
    extension="png",
):
    """
    output file name format INVYYYYMMDDXXXX_1-n ; n = number of pages
    """
    file = fitz.open(src_directory + "/" + file_name)
    if len(file) == 0:
        print("can't read file data")
    else:
        number_of_pages = len(file)
        for page_number in range(number_of_pages):
            target_file_name = f"{file_name.split('.')[0]}_{page_number+1}-{number_of_pages}.{extension}"
            page = file.load_page(page_number)
            pixmap = page.get_pixmap(dpi=300)
            pixmap.save(f"./src/temp/{document_type}/raw-file-png/{target_file_name}")
        file.close()


def get_filename_only(filename):
  return filename.split("_")[0]

def isAllZero(dot_data):
  for dot in dot_data:
    if dot > DOT_PER_LINE_OFFSET:
      return False
  return True
  
def lastNisZero(dot_data, n = LINE_HEIGHT_OFFSET):
  return isAllZero(dot_data[-n:])

def save_line_image(image, y_start, y_stop, line_number, filename, document_type):
  target_dir = f"./src/temp/{document_type}/lines/{filename}/header"
  os.makedirs(target_dir, exist_ok=True)
  cv2.imwrite(os.path.join(f"{target_dir}/line-{line_number + 1}.png"), image[y_start: y_stop + 1])
  
def get_header_image(image, mode):
  match mode:
    case "inv":
      ((x_start, y_start), (x_end, y_end)) = INV_HEADER_POSITION
    case "ca":
      ((x_start, y_start), (x_end, y_end)) = CA_HEADER_POSITION
  return image[y_start:y_end, x_start:x_end]
  
def split_line(header_image, filename, document_type):
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
        save_line_image(header_image, line_start, line_stop, lines_saved, filename, document_type)
        lines_saved += 1
        line_start = line_stop
        dot_data = []
        line_finished = False
