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
    output file name format INVYYYYMMDDXXXX_1/n ; n = number of pages
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


def extract_field_inv(src_directory, file_name):
    image = cv2.imread(f"{src_directory}/{file_name}")
    if image is None:
        print(f"Error: Unable to load '{src_directory}/{file_name}'")
        return
    # print(image.shape)
    # (3508, 2481, 3)
    # new_image = resize_image(image)
    # roi = cv2.selectROI(
    #     "Drag On Field", new_image, fromCenter=False, showCrosshair=True
    # )
    # print(roi)


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


def extract_field_ca(src_directory, file_name):
    pass


def main():
    files_name = scan_files("./src/raw-file")
    for file_name in files_name:
      document_type = check_document_type_by_name(file_name)
      convert_file_to_image(file_name, "./src/raw-file", document_type)
    # extract_field_inv("./src/temp/raw-file-png/inv", "INV202411130001_1-1.png")



if __name__ == "__main__":
    main()
