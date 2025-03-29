import cv2
import fitz
from bounding_box import *
import numpy as np
import pandas as pd
from pythainlp import correct

class Document:
    def __init__(self, pdf_path) -> None:
        # STATIC VALUE
        self.TABLE_H_LINE_MIN = 100
        self.COLOR_WHEEL = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]

        # EXTRACTED VALUE
        self.pdf_path = pdf_path
        self.element = {}
        self.element["Selectable_Field"] = []
        self.raw_table = []
        self.doc = fitz.open(pdf_path)
        self.pages = []
        self.table_with_key = []
        self.table_with_key_c = []
        self.line_with_num = []
        self.line_with_num_c = []
        self.partitioned_val_line = []
        self.partitioned_val_line_c = []
        self.summary_line = []
        self.col_sep_word = []
        self.table_start = None
        print("Start")
        self.__pdf_to_png()
        print("Convert to PNG Finished")
        self.__find_tables()
        print("Detected All Table")
        self.__extract_line()
        print("Extract All Line Completed")
        self.__partition_columns_from_line()
        print("Partition By Column Completed")
        self.__extract_header()
        print("Extract Header Completed")
        self.merge_by_active_columns()
        print("Merge Bounding Box by Active Column")
        self.__pair_header()
        print("Paired Header")
        # print(self.element["Header_Data"])

    def __pdf_to_png(self):
        for page_number in range(len(self.doc)):
            page = self.doc.load_page(page_number)
            pix = page.get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
            self.pages.append(img)

    def __apply_otsu(self, img):
        image = img.copy()
        grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, otsud = cv2.threshold(grey, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
        return otsud

    def __find_tables(self):
        page = 1
        self.element["Tables"] = []
        self.element["Main_Box"] = []
        for p in self.pages:
            display_img = p.copy()
            img = self.__apply_otsu(p)

            h_kernal = cv2.getStructuringElement(cv2.MORPH_RECT, (500, 1))
            h_lines = cv2.morphologyEx(img, cv2.MORPH_OPEN, h_kernal)

            contours, _ = cv2.findContours(h_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            first_line_y = None
            last_line_y = None
            left, right = float("inf"), float("-inf")
            contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[1])
            line = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                if w > self.TABLE_H_LINE_MIN:  # Prevent misclassify character as Horizontal Lines
                    if self.table_start == None:
                        self.table_start = y
                    left, right = min(x, left), max(x + w, right)
                    rect = cv2.rectangle(display_img, (x, y), (x + w, y + h), (0, 255, 0), 2) # For Debug
                    line.append(y)
                    if first_line_y is None:
                        first_line_y = y  # First Horizontal Line after start_y
                    last_line_y = y  # Last Horizontal Line

            # cv2.imshow(display_img)

            # No Lines Found
            if first_line_y is None or last_line_y is None:
                break

            tmp = None
            box_boundary = []
            for y in line:
                if not tmp:
                    tmp = y
                    continue
                box_boundary.append((tmp, y))
                tmp = y
            # for start,end in box_boundary:
            #     rect = cv2.rectangle(display_img, (x + 5, start + 5), (x + w - 5, end - 5), (0, 255, 0), 1) # For Debug

            main_box = BoundingBox(p, (left, first_line_y, right - left, last_line_y - first_line_y), "Main Box")


            self.element["Main_Box"].append(main_box)

            # main_box.show_image()
            if len(box_boundary) == 1:
                i, j = box_boundary[0]
                k = main_box.add_child((0, i - first_line_y, right - left, j - i), box_type="TLB_SUMMARY")
                self.element["Tables"].append(k)

            if len(box_boundary) > 1:
                i, j = box_boundary[0]
                k = main_box.add_child((0, i - first_line_y, right - left, j - i), box_type="TLB_HEADER")
                self.element["Tables"].append(k)
                i, j = box_boundary[1]
                k = main_box.add_child((0, i - first_line_y, right - left, j - i), box_type="TLB_VALUE")
                self.element["Tables"].append(k)
            if len(box_boundary) == 3:
                i, j = box_boundary[2]
                k = main_box.add_child((0, i - first_line_y, right - left, j - i), box_type="TLB_SUMMARY")
                self.element["Tables"].append(k)
            page += 1

            # main_box.show_image_highlight()

    def __extract_header(self):
        p = self.pages[0]
        h = p.copy()
        header = h[0:self.table_start, :]
        reader = easyocr.Reader(['th', 'en'])
        text_data = reader.readtext(header, detail=1, paragraph=True, decoder="wordbeamsearch", x_ths=0.8)     #in order ([box-coords], text, confidence)

        logo_treshold = 380 # TODO
        middle_line = 1500 #TODO
        left_side = []
        right_side = []

        for bbox, text in text_data:
            top_left, _, bottom_right, _ = bbox
            tl = [int(x) for x in top_left]
            br = [int(x) for x in bottom_right]
            tlx, tly = tl
            brx, bry = br
            self.element["Header"] = []

            if tlx < middle_line:
                if bry < logo_treshold:
                    continue
                k = BoundingBox(p, [tl, br], box_type="HEADER_COLUMN")
                left_side.append(k)
                self.element["Header"].append(k)
            else:
                k = BoundingBox(p, [tl, br], box_type="HEADER_COLUMN")
                right_side.append(k)
                self.element["Header"].append(k)

        # print()
        # print(left_side)
        # print(right_side)
        # print()

        # Cast indices to integers before slicing
        left = BoundingBox.merge_bounding_boxes(*left_side, box_type="LEFT_COL")
        right = BoundingBox.merge_bounding_boxes(*right_side, box_type="RIGHT_COL")
        self.element["Header_Column"] = []
        self.element["Header_Column"].extend([left, right])

        # for i in self.element["Header_Column"]:
        #     i.show_image()

    def __extract_line(self):
        cur_line = [0, 0]
        cur_val = 1
        self.element["Value_Table"] = []
        self.element["Summary_Table"] = []
        for idx, table in enumerate(self.element["Tables"]):
            if table.box_type == "TLB_SUMMARY":
                target = self.element["Summary_Table"]
                save_name = f"SUMMARY_"
                line_tracker = 0
            elif table.box_type == "TLB_VALUE":
                target = self.element["Value_Table"]
                save_name = f"PAGE_"
                line_tracker = 1
            else:
                continue
                # is a column header
            display_img = table.image()
            t = table.image(otsu=True)
            table_width = t.shape[1]

            row_sums = np.sum(t, axis=1) // 255  # Get number of white pixel in current y
            dark_pixel_threshold = 24
            # print(dark_pixel_threshold, row_sums[200]) ## DEBUG
            df = pd.DataFrame(row_sums, columns=['Column1'])
            # print(df.describe()) ## DEBUG
            # print(table_width) ## DEBUG

            lines = []
            last_y = -1
            line_gap_threshold = 5  # Minimum gap between lines
            min_spacing = 24  # Minimum gap
            flag = False

            # unique_values, counts = np.unique(row_sums, return_counts=True)

            # # Combine unique values and counts into tuples and sort in descending order by count
            # sorted_counts = sorted(zip(unique_values, counts), key=lambda x: x[0], reverse=True)

            # hrow = np.array(row_sums).reshape(-1, 1)

            # histogram_line = np.hstack([hrow] * 4)

            # result = np.concatenate([t, histogram_line], axis=1)

            pairs = []
            gap_from_last_line = 0
            for y, row_sum in enumerate(row_sums):
                if not flag and row_sum > dark_pixel_threshold:
                    # Detect Start of the text, and add padding-top
                    pairs.append(max(y - line_gap_threshold, 0))
                    flag = not flag
                if flag and row_sum <= dark_pixel_threshold:
                    if gap_from_last_line < line_gap_threshold:
                        gap_from_last_line += 1
                        continue
                    # Detech End of the text, with padding-bottom included
                    pairs.append(y)
                    lines.append(pairs)
                    pairs = []
                    gap_from_last_line = 0
                    flag = not flag

            # for y in lines:
            #     cv2.line(display_img, (0, y), (display_img.shape[1], y), (255, 0, 0), 2)

            # os.makedirs(output_dir, exist_ok=True)

            # no more margin here, I've added that in the previous step
            for i in range(len(lines)):
                start_y, end_y = lines[i][0], lines[i][1]
                if end_y - start_y < (2 * line_gap_threshold) + 10 : #skip if that line is too small (10px)
                    continue
                if start_y >= end_y:  # Skip invalid or empty rows
                    # print(f"Skipping invalid row: start_y={start_y}, end_y={end_y}")
                    continue
                cv2.line(t, (0, start_y), (table_width, start_y), (255, 0, 0), 2)
                cv2.line(t, (0, end_y), (table_width, end_y), (255, 0, 0), 2)
                line = table.add_child([0, start_y, table_width, end_y - start_y], box_type="TABLE_LINE")
                target.append(line)
                cur_line[line_tracker] += 1
            cur_val += 1
            # table.show_image_highlight()

    def __partition_columns_from_line(self):
        self.element["Column"] = []
        for idx, line_obj in enumerate(self.element["Value_Table"]):
            col_count = 0
            display_line = line_obj.image()
            line = line_obj.image(otsu=True)
            line_height = line.shape[0]

            # Create vertical kernel and extract vertical lines
            v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, int(line.shape[0] * 0.90)))
            v_lines = cv2.morphologyEx(line, cv2.MORPH_OPEN, v_kernel)

            # Ensure vertical lines are detected
            if np.count_nonzero(v_lines) == 0:
                continue
            # print("+++++++++++++++++++++++")
            # Find and sort contours
            contours, _ = cv2.findContours(v_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])

            # Extract column positions
            columns_pos = []
            tmp = 0
            col = 0
            debug_img = display_line.copy()
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                cv2.rectangle(debug_img, (x, y), (x+w, y+h), self.COLOR_WHEEL[col % 3], 1)
                col += 1
                if tmp == None:
                    tmp = x
                    continue
                # print(f"Added new pos start at {tmp} and end at {x}")
                columns_pos.append((tmp, x))
                tmp = x

            # cv2.imshow(debug_img)

            # Extract and save columns
            display_col = display_line.copy()
            for start, end in columns_pos:
                if end <= start:
                    # print(f"Skipping invalid slice: start={start}, end={end}")
                    continue
                col = line_obj.add_child([start, 0, end - start, line_height], box_type=f"VALUE_COL{col_count}")
                col_count += 1

                # Debug: Draw rectangle on the column
                self.element["Column"].append(col)

    def print_all_line(self):
        merged_rows = []
        for idx, line_obj in enumerate(self.element["Value_Table"]):
            col_text = []
            for col_obj in line_obj.child:
                col_text.append(col_obj)
            # print(col_text)
            merged_rows.append(col_text)
        return merged_rows

    def merge_by_active_columns(self, threshold=3):
        table_data = self.print_all_line()
        def count_active_columns(row):
            active_count = 0
            for bbox in row:
                if bbox.print_paragraph().strip():
                    active_count += 1
            return active_count
        merged = []  # The final merged rows
        last_active_cols = None
        last_row = None  # Track last merged row
        last_box_pos = None  # Track last bounding box's bottom Y position

        for row in table_data:
            current_active_cols = count_active_columns(row)

            if not merged:
                # First row: merge normally and store each column as a list containing one merged BBox
                merged.append([[BoundingBox.merge_bounding_boxes(col)] for col in row])
                last_active_cols = current_active_cols
                last_row = merged[-1]
                last_box_pos = row[0].br[1]  # Store bottom Y position
                continue

            # Detect if a row wraps across a page by checking Y-position jumps
            first_box_pos = row[0].tl[1]  # Y position of first column in current row

            if first_box_pos < last_box_pos:  # New page detected (jump from bottom to top)
                is_wrapped_row = True
            else:
                is_wrapped_row = current_active_cols - last_active_cols <= threshold

            if is_wrapped_row:
                # Merge as much as possible within the same page
                for col_idx in range(len(row)):
                    if col_idx < len(last_row):
                        if isinstance(last_row[col_idx][-1], BoundingBox) and last_row[col_idx][-1].br[1] <= last_box_pos:
                            # Merge with last segment if still on the same page
                            last_row[col_idx][-1] = BoundingBox.merge_bounding_boxes(last_row[col_idx][-1], row[col_idx])
                        else:
                            # Otherwise, store as a new segment for this page
                            last_row[col_idx].append(BoundingBox.merge_bounding_boxes(row[col_idx]))
                    else:
                        last_row.append([BoundingBox.merge_bounding_boxes(row[col_idx])])  # Ensure new column is also a list
            else:
                # It's a new row, merge normally and store in lists
                merged.append([[BoundingBox.merge_bounding_boxes(col)] for col in row])
                last_row = merged[-1]

            last_active_cols = current_active_cols
            last_box_pos = row[0].br[1]  # Update bottom Y position for next iteration

        self.element["Full_Table"] = merged

    def extract_ocr_from_boundingbox(obbox, reader):
        img = obbox.image()
        text_data = reader.readtext(img, paragraph=True, y_ths=0.01)
        obbox.reset_children()
        for bbox, text in text_data:
            top_left, _, bottom_right, _ = bbox
            tl = [int(x) for x in top_left]
            br = [int(x) for x in bottom_right]
            tlx, tly = tl
            brx, bry = br
            cv2.rectangle(img, tl, br, (0, 255, 0), 4)
            obbox.add_child([tl, br], box_type="HEADER_TEXT")

        # cv2.imshow(img)
        # obbox.show_image_highlight()
        return text_data

    def match_keys_to_values(self, bbox, ths=50):
        key_value_pairs = {}

        last_key = None
        tmp = []

        for child in bbox.child:
            extracted_text = child.print_paragraph().strip()
            if not extracted_text:
                continue

            left_pos = child.tl[0]

            if last_key is None or left_pos < bbox.child[0].tl[0] + ths:
                if not last_key is None:
                    items = BoundingBox.merge_bounding_boxes(*tmp, box_type="Selectable_Split_Row")
                    items.note = last_key
                    self.element["Selectable_Field"].append(items)
                tmp = []
                tmp.append(child)
                last_key = correct(extracted_text)
                key_value_pairs[last_key] = []
            else:
                tmp.append(child)
                key_value_pairs[last_key].append(extracted_text)

        if not tmp == []:
            self.element["Selectable_Field"].append(BoundingBox.merge_bounding_boxes(*tmp, box_type="Selectable_Split_Row"))

        ret = []

        for key in key_value_pairs:
            key_value_pairs[key] = " ".join(key_value_pairs[key])
            ret.append([key, key_value_pairs[key]])


        return ret

    def divide_paragraph(self, bbox, ths=20):
        paragraph = []

        last_y = None
        tmp = []
        paragraph_tmp = []
        for child in bbox.child:
            extracted_text = child.print_paragraph().strip()
            if not extracted_text:
                continue

            y_pos = child.tl[1]

            if last_y is None or y_pos > last_y + ths:
                if not last_y is None:
                    self.element["Selectable_Field"].append(BoundingBox.merge_bounding_boxes(*tmp, box_type="Selectable_Paragraph"))
                    paragraph.append(paragraph_tmp)
                tmp = []
                paragraph_tmp = []
            tmp.append(child)
            last_y = child.bl[1]
            paragraph_tmp.append(extracted_text)

        if not tmp == []:
            self.element["Selectable_Field"].append(BoundingBox.merge_bounding_boxes(*tmp, box_type="Selectable_Paragraph"))
            paragraph.append(paragraph_tmp)

        ret = []

        for lst in paragraph:
            ret.append(" ".join(lst))

        return ret




    def __pair_header(self):
        header_bbox = self.element["Header_Column"]
        self.element["Header_Data"] = []
        for i in header_bbox:
            Document.extract_ocr_from_boundingbox(i, reader)
            i.sort_children()
            if len(i.child) < 3:
                print("Not enough row just a line of data.")
                return
            if abs(i.child[1].tl[0] - i.child[2].tl[0]) < 50:
                header_data = self.divide_paragraph(i)
            else:
                header_data = self.match_keys_to_values(i)
            self.element["Header_Data"].extend(header_data)

    def process_as_sample(self, output_dir):
        idx = 1
        for p_num, p in enumerate(self.pages):
            p_copy = p.copy()
            display_img = p.copy()
            for x in self.element["Selectable_Field"]:
                if np.array_equal(x.src_image, p_copy):
                    cv2.rectangle(display_img, x.tl, x.br, (0, 255, 0), 4)
                    text_position = (x.tl[0] - 25, x.tl[1] - 10)  # Slightly above top-left

                    # Put the number on the image
                    cv2.putText(display_img, str(idx), text_position,
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                    idx += 1
            for x in self.element["Tables"]:
                if x.box_type == "TLB_SUMMARY":
                    color = (0, 255, 0)
                elif x.box_type == "TLB_VALUE":
                    color = (0, 0, 255)
                elif x.box_type == "TLB_HEADER":
                    color = (255, 0, 0)
                if not np.array_equal(x.src_image, p_copy):
                    continue
                cv2.rectangle(display_img, (x.tl[0] + 2, x.tl[1] + 2), (x.br[0] - 2, x.br[1] - 2), color, 2)
            cv2.imwrite(f"{output_dir}/Sample_Scan_P{p_num + 1}.png", display_img)