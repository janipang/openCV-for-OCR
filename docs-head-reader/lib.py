import os
import fitz
import cv2

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