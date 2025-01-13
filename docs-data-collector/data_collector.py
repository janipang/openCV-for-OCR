import pytesseract
import cv2
import os
import json
import numpy as np
from PIL import ImageEnhance, ImageFilter, Image

def get_key_value_position(image):
    gap_threshold = 40

    # position format: [ y_start, y_end ]
    position = []
    phrase_pos = []
    flag = False
    current_gap = 0

    # process <width> times
    for y_axis in range(0, image.shape[1]):
        point_found = sum([int(pixels[y_axis]) for pixels in image]) != 0
        if not flag and point_found: # phrase found
            phrase_pos.append(max(y_axis - gap_threshold, 0))
            flag = not flag
        if flag and not point_found:
            if y_axis == image.shape[1] - 1: # last pixel
                phrase_pos.append(y_axis)
                position.append(phrase_pos)
                phrase_pos = []
                current_gap = 0
                flag = not flag
            if current_gap < gap_threshold:
                current_gap += 1
                continue
            else: # end phrase for sure
                phrase_pos.append(y_axis)
                position.append(phrase_pos)
                phrase_pos = []
                current_gap = 0
                flag = not flag
    if len(position) == 0:
        return "No phrase found."
    elif len(position) == 1:
        return position[0]
    else:
        return position[0], (position[1][0], position[-1][1])
    
def read_text_from_image(int_array_2d):
    uint8_array = np.array(int_array_2d).astype(np.uint8)
    custom_oem_psm_config = r'-l tha+end --psm 6'
    p_image = Image.fromarray(uint8_array)
    print("Pillow image created successfully.")
    return pytesseract.image_to_string(p_image, config=custom_oem_psm_config)

def save_data_from_lines(input_dir, output_file):
    # get data
    data = {}
    files_name = os.listdir(input_dir)
    for file_name in files_name:
        img = cv2.imread(f"{input_dir}/{file_name}")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, image = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        key = ""
        value = ""
        position = get_key_value_position(image)
        if len(position) == 2:
            cv2.imwrite("./src/temp/reading/key.png", image[:, position[0][0]:position[0][1]])
            cv2.imwrite("./src/temp/reading/value.png", image[:, position[1][0]:position[1][1]])
            key = read_text_from_image(image[:, position[0][0]:position[0][1]])
            value = read_text_from_image(image[:, position[1][0]:position[1][1]])
            data[key] = value
        elif len(position) == 1:
            value = read_text_from_image(image[position[0][0]:position[0][1]])
            data[key] = data[key] + value
        print(data)

    # write to json
    json_object = json.dumps(data, indent=2)
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=2)


