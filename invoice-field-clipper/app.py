import os
import fitz
import cv2

def scan_files(folder_path):
    return os.listdir(folder_path)


def file_classification(file_name):
    if file_name.startswith("INV"):
        return "invoice"
    elif file_name.starstwith("CA"):
        return "ca??"


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
    target_dir="./src/temp/raw-file-png",
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
            terget_file_name = f"{file_name.split('.')[0]}_{page_number+1}-{number_of_pages}.{extension}"
            page = file.load_page(page_number)
            pixmap = page.get_pixmap(dpi=300)
            pixmap.save(f"{target_dir}/{document_type}/{terget_file_name}")
        file.close()


def extract_field_inv(
    src_directory, file_name, target_dir="./src/temp/snippet-data/inv", extension="png"
):
    image = cv2.imread(f"{src_directory}/{file_name}")  # image.shape -> (3508, 2481, 3)
    if image is None:
        print(f"Error: Unable to load '{src_directory}/{file_name}'")
        return

    # process only first page of document
    page_number = int(file_name.split("_")[1].split("-")[0])
    if page_number > 1:
        return

    # GET DATA FROM HEADER FORMAT
    position_data = get_field_position()
    for key in position_data.keys():
        for line in range(len(position_data[key])):
            (x_start, y_start, width, height) = position_data[key][line]
            
            # format: INV202411050003_ผู้ขาย_1-2
            target_file_path = f"{target_dir}/{file_name.split('_')[0]}_{key}_{line}-{len(position_data[key])}.{extension}"
            cv2.imencode(f".{extension}", image[y_start : y_start + height, x_start : x_start + width])[1].tofile(target_file_path)
            
            # not included thai filename
            # cv2.imwrite(
            #     target_file_path,
            #     image[y_start : y_start + height, x_start : x_start + width],
            # )


def extract_field_ca(src_directory, file_name):
    pass


def get_field_position(field="all"):
    # key: (x_start, y_start, width, height)
    data = {
        "เลขที่": [(1910, 242, 444, 46)],
        "วันที่": [(1910, 352, 444, 46)],
        "ครบกำหนด": [(1910, 298, 444, 46)],
        "ผู้ขาย": [(1910, 404, 470, 56), (1910, 456, 470, 56)],
        "อ้างอิง": [(1910, 514, 444, 46)],
        "เบอร์โทร": [(1910, 690, 470, 46)],
    }

    # if resized with scale = 0.5
    data_resized = {
        "เลขที่": [(955, 121, 222, 23)],
        "วันที่": [(955, 176, 222, 23)],
        "ครบกำหนด": [(955, 149, 222, 23)],
        "ผู้ขาย": [(955, 202, 235, 28), (955, 228, 235, 28)],
        "อ้างอิง": [(955, 257, 222, 23)],
        "เบอร์โทร": [(955, 345, 235, 23)],
    }
    match field:
        case "all":
            return data
        case "เลขที่" | "วันที่" | "ครบกำหนด" | "ผู้ขาย" | "อ้างอิง" | "เบอร์โทร":
            return data[field]
        case _:
            return []


def resize_image(image, scale=0.5):
    h, w = image.shape[:2]
    new_width = int(w * scale)
    new_height = int(h * scale)
    sized_image = cv2.resize(image, (new_width, new_height))
    return sized_image


def main():
    # convert all files to image
    files_name = scan_files("./src/raw-file")
    for file_name in files_name:
        document_type = check_document_type_by_name(file_name)
        convert_file_to_image(file_name, "./src/raw-file", document_type)

    # snippet header field from all image files
    files_name = scan_files("./src/temp/raw-file-png/inv")
    for file_name in files_name:
        extract_field_inv("./src/temp/raw-file-png/inv", file_name)


if __name__ == "__main__":
    main()
