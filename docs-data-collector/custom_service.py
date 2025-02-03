import cv2
import os

def exist_imwrite(filename, img, params=...):
  os.makedirs(os.path.dirname(filename), exist_ok=True)
  cv2.imwrite(filename, img, params)
