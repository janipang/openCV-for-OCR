import fitz
import sys
import os


def pdf_to_png(file_path, output_dir, page=None):
    pdf_document = fitz.open(file_path)
    pdf_name = os.path.splitext(os.path.basename(file_path))[0]

    if page is not None:
        pages = [page-1]
    else:
        pages = range(len(pdf_document))

    for idx, page_num in enumerate(pages):
        pdf_page = pdf_document.load_page(page_num)
        pix = pdf_page.get_pixmap()

        if len(pages) == 1:
            output_path = f"{output_dir}/{pdf_name}.png"
        else:
            output_path = f"{output_dir}/{pdf_name}_page{idx + 1}.png"

        pix.save(output_path)


if __name__ == "__main__":
    file_path = sys.argv[1]
    output_dir = sys.argv[2]
    page = int(sys.argv[3]) if len(sys.argv) > 3 else None

    pdf_to_png(file_path, output_dir, page)
