import os
import fitz
import cv2

HEADER_POSITION = ((1548, 222), (2400, 1052))

def resize_image(image, scale=0.5):
    h, w = image.shape[:2]
    new_width = int(w * scale)
    new_height = int(h * scale)
    sized_image = cv2.resize(image, (new_width, new_height))
    return sized_image


def main():
  image = cv2.imread("./src/raw-file-png/INV202411080001_1-1.png")
  ((x_start, y_start),(x_end, y_end)) = HEADER_POSITION
  header_image = image[y_start: y_end, x_start: x_end]
  cv2.imwrite("./src/temp/header/INV202411080001_header.png", header_image)


if __name__ == "__main__":
    main()