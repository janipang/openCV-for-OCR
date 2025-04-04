import os
import json
from document import *

def process_file_as_sample(target, output_dir="/content/"):
    try:
        print(f"Processing: {target}")

        d = Document(target)
        d.process_as_sample(output_dir)
        print(d)
        return d

    except Exception as e:
        print(e)
        
# I CHANGE THIS : params[1] + Document()
def draw_only_selected_field(template_file_path, field, json_save_path, image_save_dir, bounded_dir):
    print('DRAW ONLY RUNNING...')
    print('plain_png_path ', template_file_path)
    print('field ', field)
    print('json_save_path ', json_save_path)
    print('image_save_dir ', image_save_dir)
    print('bounded_dir ', bounded_dir)
    # Test
    
    document = Document(template_file_path)
    document.process_as_sample(bounded_dir)
    # I CHANGE THIS : just write file any where
    
    json_dict = {}
    json_dict["Selected_Keys"] = []
    json_dict["Selected_Indexs"] = []
    idx = 1
    for p_num, p in enumerate(document.pages):
        p_copy = p.copy()
        display_img = p.copy()
        for x in document.element["Selectable_Field"]: 
            if np.array_equal(x.src_image, p_copy):
                if idx in field: 
                    if x.box_type == "Selectable_Split_Row":
                        json_dict["Selected_Keys"].append(x.note)
                    elif x.box_type == "Selectable_Paragraph":
                        json_dict["Selected_Indexs"].append(idx)
                    elif x.box_type == "Selectable_Summary":
                        json_dict["Selected_Keys"].append(x.note)
                    cv2.rectangle(display_img, x.tl, x.br, (0, 255, 0), 4)
                    text_position = (x.tl[0] - 25, x.tl[1] - 10)  # Slightly above top-left

                    cv2.putText(display_img, str(idx), text_position,
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
                idx += 1
        for x in document.element["Tables"]:
            if x.box_type == "TLB_SUMMARY":
                color = (0, 255, 0)
            elif x.box_type == "TLB_VALUE":
                color = (0, 0, 255)
            elif x.box_type == "TLB_HEADER":
                color = (255, 0, 0)
            if not np.array_equal(x.src_image, p_copy):
                continue
            cv2.rectangle(display_img, (x.tl[0] + 2, x.tl[1] + 2), (x.br[0] - 2, x.br[1] - 2), color, 2)
            image_save_path = os.path.join(image_save_dir, f"Selected_Field_P{p_num}.png")
            cv2.imwrite(image_save_path, display_img)
    
    print(json_dict)
    
    with open(json_save_path, 'w', encoding='utf-8') as file:
        json.dump(json_dict, file, indent=4)
        
        
def process_file(target_json, input_dir = "/content/INV_Dataset/", output_path="/content/invoice_data.xlsx", read_table = False):

    pdf_files = [f for f in os.listdir(input_dir) if f.endswith(".pdf")]

    processed_data = []
    with open(target_json, 'r', encoding='utf-8') as file:
        target = json.load(file)
    table = []
    # I CHANGE THIS : new var

    for pdf_file in pdf_files:
        pdf_path = os.path.join(input_dir, pdf_file)

        try:
            row = []
            print(f"process-update:file-start:{pdf_file}", flush=True)

            d = Document(pdf_path)

            header_data_list = d.element["Header_Data"] if "Header_Data" in d.element else []


            print(header_data_list)

            print(target["Selected_Indexs"])
            for index in target["Selected_Indexs"]:
                print(f"Selecting Index {index}")
                print(f"Found {header_data_list[index - 1]}")
                if header_data_list[index + 1]:
                    row.append(header_data_list[index - 1])

            data_dict = {k: v for item in d.element["Header_Data"] if isinstance(item, list) and len(item) == 2 for k, v in [item]}
            print(target["Selected_Keys"])
            for key in target["Selected_Keys"]:
                value = data_dict.get(key)
                print(f"Key : {key}, Value : {value}")
                if value:
                    row.append(value)
                else:
                    row.append("-")

            # I CHANGE THIS : write table summary
            if read_table:
                table.extend(d.read_table())

            # print(row)
            processed_data.append(row)
            print(f"process-update:file-success:{pdf_file}", flush=True)

        except Exception as e:
            print(f"Error processing {pdf_file}: {str(e)}")

    # I CHANGE THIS : write table summary
    if read_table:
        table_df = pd.DataFrame(table)

    df = pd.DataFrame(processed_data)
    df.to_excel(output_path, index=False, engine="openpyxl")
    
    # I CHANGE THIS : write table summary
    if (read_table):
        product_output_path = output_path.split('.')[0] + '-product-summary' + '.xlsx'
        table_df.to_excel(product_output_path, index=False, engine="openpyxl")

    print(f"process-update:process-success:file saved", flush=True)