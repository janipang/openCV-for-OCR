import os
import fitz
import cv2

HEADER_POSITION = ((1548, 222), (2400, 1052))
LEFT_SIDE = ((1548, 222), (1856, 1052))
RIGHT_SIDE = ((1884, 222), (2400, 1052))
TEXT_COLOR_FADE_OFFSET =  120
DOT_PER_LINE_OFFSET = 3
LINE_HEIGHT_OFFSET = 10

def resize_image(image, scale=0.5):
    h, w = image.shape[:2]
    new_width = int(w * scale)
    new_height = int(h * scale)
    sized_image = cv2.resize(image, (new_width, new_height))
    return sized_image
  
def isAllZero(dot_data):
  for dot in dot_data:
    if dot > DOT_PER_LINE_OFFSET:
      return False
  return True
  
def lastNisZero(dot_data, n = LINE_HEIGHT_OFFSET):
  return isAllZero(dot_data[-n:])

def save_line_image(image, y_start, y_stop, line_number):
  cv2.imwrite(f"./src/temp/header-lines/line-{line_number + 1}.png", image[y_start: y_stop + 1])
  
def main():
    image = cv2.imread("./src/raw-file-png/INV202411080001_1-1.png")
    ((x_start, y_start), (x_end, y_end)) = HEADER_POSITION
    header_image = image[y_start:y_end, x_start:x_end]
    cv2.imwrite("./src/temp/header/INV202411080001_header.png", header_image)
    
    # variables
    line_start = 0
    line_stop = 0
    dot_data = []
    
    line_finished = False
    lines_saved = 0
    
    # process pixel row by row (up to down)
    for line_num in range(len(header_image)):
      line = header_image[line_num]
      dot = 0
      
      for pixel_num in range(len(line)):
        pixel = line[pixel_num]
        if sum(pixel.astype(int))/3 <= 0 + TEXT_COLOR_FADE_OFFSET:
          dot += 1
          
      line_stop += 1
      dot_data.append(dot)
      if dot < DOT_PER_LINE_OFFSET and isAllZero(dot_data) and (line_stop - line_start) + 1 > LINE_HEIGHT_OFFSET: # line empty and stack full of empty lines
        line_start += 1
        dot_data.pop(0)
      if not isAllZero(dot_data) and lastNisZero(dot_data):
        line_finished = True
      
      if line_finished:
        save_line_image(header_image, line_start, line_stop, lines_saved)
        lines_saved += 1
        line_start = line_stop
        dot_data = []
        line_finished = False
      
      # print(dot, end=" ")


if __name__ == "__main__":
    main()
