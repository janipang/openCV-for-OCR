import fitz
import os
import cv2
import numpy as np
import pandas as pd
import shutil

def scan_files(folder_path):
    return os.listdir(folder_path)

def get_filename_only(filename):
  return filename.split("_")[0]

def scanAll(input_folder = 'INV_Dataset', output_folder='INV_img'):
  filename = os.listdir(input_folder)
  for i, f in enumerate(filename):
    pdf_to_png(os.path.join(input_folder, f), f"INV_{i}", output_folder)

def pdf_to_png(pdf_path, output_filename, output_dir='./INV_img'):
    doc = fitz.open(pdf_path)
    for page_number in range(len(doc)):
        page = doc.load_page(page_number)
        pix = page.get_pixmap(dpi=300)
        if not os.path.exists(output_dir):
            os.mkdir(output_dir)
        output_path = os.path.join(output_dir, output_filename + f'_{page_number}.png')
        pix.save(output_path)

def extract_dynamic_table(image_path, start_y=1010):

    # Image Preprocessing (Convert to B&W and Invert the color)
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # Use Kernel to Detect Horizontal Lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (100, 1))
    horizontal_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel)

    # Find Edge of Horizontal Lines
    contours, _ = cv2.findContours(horizontal_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Check for the first Horizontal Line and Last Horizontal line to get the position of the Table
    first_line_y = None
    last_line_y = None
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1])
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 100:  # Prevent misclassify character as Horizontal Lines
            if y > start_y and first_line_y is None:
                first_line_y = y  # First Horizontal Line after start_y
            last_line_y = y  # Last Horizontal Line

    # No Lines Found
    if first_line_y is None or last_line_y is None:
        raise ValueError("No valid horizontal lines found to determine table boundaries.")

    print(first_line_y, last_line_y) ## DEBUG
    main_box = img[first_line_y:last_line_y, :]

    return main_box

def extract_text_lines_by_spacing(table_region, orig_filename="output", output_dir="extracted_lines"):
    # Image Preprocessing (Convert to B&W and Invert the color)
    gray = cv2.cvtColor(table_region, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # Get Width of Full table
    table_width = binary.shape[1]

    row_sums = np.sum(binary, axis=1) // 255  # Get number of white pixel in current y
    threshold = 24
    print(threshold, row_sums[200]) ## DEBUG
    df = pd.DataFrame(row_sums, columns=['Column1'])
    print(df.describe()) ## DEBUG
    print(table_width) ## DEBUG

    lines = []
    last_y = -1
    min_spacing = 24  # Minimum gap
    flag = False

    unique_values, counts = np.unique(row_sums, return_counts=True)

    # Combine unique values and counts into tuples and sort in descending order by count
    sorted_counts = sorted(zip(unique_values, counts), key=lambda x: x[0], reverse=True)

    # Display the results
    print("Value | Count")
    for value, count in sorted_counts:
        print(f"{value:5} | {count:5}")

    hrow = np.array(row_sums).reshape(-1, 1)

    histogram_line = np.hstack([hrow] * 4)

    result = np.concatenate([binary, histogram_line], axis=1)

    pairs = []
    for y, row_sum in enumerate(row_sums):
        if not flag and row_sum > threshold:
            # Detect Start of the text
            if len(lines) >= 1 and y < lines[-1][1] + 10:
                continue
            pairs.append(y)
            flag = not flag
        if flag and row_sum <= threshold:
            # Detech End of the text
            pairs.append(y)
            lines.append(pairs)
            pairs = []
            flag = not flag

    # for y in lines:
    #     cv2.line(binary, (0, y), (binary.shape[1], y), (255, 0, 0), 2)

    os.makedirs(output_dir, exist_ok=True)

    line_num = 0
    margin = 10
    for i in range(len(lines)):
        start_y, end_y = lines[i][0], lines[i][1]
        if end_y - start_y < 10 :
            continue
        start_y = max(0, start_y - margin)
        end_y = min(end_y + margin, table_region.shape[0])  # Add margin to the bottom
        if start_y >= end_y:  # Skip invalid or empty rows
            print(f"Skipping invalid row: start_y={start_y}, end_y={end_y}")
            continue
        cv2.line(binary, (0, start_y), (binary.shape[1], start_y), (255, 0, 0), 2)
        cv2.line(binary, (0, end_y), (binary.shape[1], end_y), (255, 0, 0), 2)
        line_img = table_region[start_y:end_y, :]  # Crop the line
        line_num += 1
        output_path = os.path.join(output_dir, f"{orig_filename}_line_{line_num}.png")
        cv2.imwrite(output_path, line_img)
        print(f"Saved line {line_num}: {output_path}")
    # cv2.imshow("binary", binary)
    print(f"Extracted {line_num} lines from the table.")
    return line_num

