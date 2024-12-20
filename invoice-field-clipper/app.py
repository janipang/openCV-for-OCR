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
  
def convert_file_to_image(file_name, src_directory, target_dir = "./src/temp/raw-file-jpg", extension="jpg"):
  '''
  output file name format INVYYYYMMDDXXXX_1/n ; n = number of pages
  '''
  file = fitz.open(src_directory + "/" + file_name)
  if len(file) == 0:
    print("can't read file data")
  else:
    number_of_pages = len(file)
    for page_number in range(number_of_pages):
      terget_file_name = f"{file_name.split('.')[0]}_{page_number+1}-{number_of_pages}.{extension}"
      page = file.load_page(page_number)
      pixmap = page.get_pixmap(dpi=300)
      pixmap.save(target_dir + "/" + terget_file_name)
    file.close()
    

def extract_field_from_files(files_path):
  pass

def main():
    files_name = scan_files("./src/raw-file")
    for file_name in files_name:
      convert_file_to_image(file_name, "./src/raw-file")
      # match file_classification(file_name):
      #   case "invoice":
      #     break
    

if __name__ == "__main__":
    main()