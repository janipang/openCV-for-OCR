  # # scan  all pdf files to png
  # scanAll(input_folder="./src/raw-file/inv", output_folder="./src/temp/inv-png")

  # # extract table from all png files
  # inv_files = scan_files("./src//temp/inv-png")
  # for file_name in inv_files:
  #   table_img = extract_dynamic_table(f"./src/temp/inv-png/{file_name}", 1010)
  #   cv2.imwrite(f"./src/temp/main-box/{file_name}", table_img)