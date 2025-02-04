import cv2
import os

def exist_imwrite(filename, img):
  os.makedirs(os.path.dirname(filename), exist_ok=True)
  cv2.imwrite(filename, img)

def exist_save_pixmap(pixmap, dst_path):
  dst_dir = os.path.dirname(dst_path)
  os.makedirs(dst_dir, exist_ok=True)
  pixmap.save(dst_path)