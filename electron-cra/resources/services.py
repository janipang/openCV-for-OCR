import os
from document import *

def process_file_as_sample(target, output_dir="/content/"):
    try:
        print(f"Processing: {target}")

        d = Document(target)
        d.process_as_sample(output_dir)

    except Exception as e:
        print(e)
        
def process_file(target, input_dir = "/content/INV_Dataset/", output_dir="/content/invoice_data.xlsx"):

    pdf_files = [f for f in os.listdir(input_dir) if f.endswith(".pdf")]

    processed_data = []
    c = 0
    x = 0
    m = 5

    for pdf_file in pdf_files:
        print(f"process-update:file-start:{pdf_file}", flush=True)
        if m == 0:
            break
        m -= 1
        pdf_path = os.path.join(input_dir, pdf_file)

        try:
            row = []
            print(f"Processing: {pdf_file}")

            d = Document(pdf_path)

            header_data_list = d.element["Header_Data"] if "Header_Data" in d.element else []


            for idx, data in enumerate(header_data_list):
                if idx in target:
                    if len(data) == 2:
                        row.append(data[1])
                    elif len(data) == 1:
                        row.append(data[0])
                    else:
                        print("data is in wrong format")

            # print(row)
            processed_data.append(row)
            print(f"process-update:file-success:{pdf_file}", flush=True)
            c += 1

        except Exception as e:
            print(f"Error processing {pdf_file}: {str(e)}")
            x += 1

    df = pd.DataFrame(processed_data)
    output_path = output_dir
    df.to_excel(output_path, index=False, engine="openpyxl")

    print(f"process-update:process-success:file saved", flush=True)