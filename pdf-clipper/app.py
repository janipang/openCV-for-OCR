import cv2
import fitz

def pdf_to_jpg(pdf_path, output_folder):
    # Open the PDF file
    pdf_document = fitz.open(pdf_path)

    # Convert each page to an image
    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        pixmap = page.get_pixmap(dpi=300)
        # get_pixmap(*, matrix=pymupdf.Identity, dpi=None, colorspace=pymupdf.csRGB, clip=None, alpha=False, annots=True)
        # to increase image resolution -> https://pymupdf.readthedocs.io/en/latest/recipes-images.html#how-to-increase-image-resolution

        # Save the image
        output_path = f"{output_folder}/document_page_{page_number + 1}.jpg"
        pixmap.save(output_path)
        print(f"Saved: {output_path}")

    pdf_document.close()

def show_selecting_window(input_path, output_path):
    '''
    input - path of raw document image file (png/jpg/jpeg)
    output - path for folder to save cropped data of selected fields
    '''
    

    # Load the input image
    image = cv2.imread(input_path)
    if image is None:
        print("Error: Unable to load file.jpg")
        return

    # Resize the image to fit 70vh
    image_resized = resize_to_70vh(image)

    # Let the user select ROI (Region of Interest)
    print("Drag a rectangle over the image. Press ENTER to confirm selection or ESC to cancel.")
    roi = cv2.selectROI("Select ROI", image_resized, fromCenter=False, showCrosshair=True)

    # Check if ROI is valid (non-zero width and height)
    if roi[2] > 0 and roi[3] > 0:
        x, y, w, h = roi
        # Crop the ROI from the original image (not resized)
        scale_x = image.shape[1] / image_resized.shape[1]
        scale_y = image.shape[0] / image_resized.shape[0]
        
        x_original = int(x * scale_x)
        y_original = int(y * scale_y)
        w_original = int(w * scale_x)
        h_original = int(h * scale_y)
        
        cropped_image = image[y_original:y_original+h_original, x_original:x_original+w_original]
        cropped_coord = [((x_original,y_original),(x_original + w_original, y_original + h_original)) ]
        print(f"field coordinates: {cropped_coord}")

        # Save the cropped image
        cv2.imwrite((output_path + "/cropped_field.jpg"), cropped_image)
        print(f"Cropped image saved at {output_path}")

        # Display the cropped image
        cv2.imshow("Cropped Image", cropped_image)
        cv2.waitKey(0)

    # Clean up
    cv2.destroyAllWindows()
    
def resize_to_70vh(image, vh_percent=0.7):
    """Resize the image proportionally to 70% of the screen height."""
    screen_height = 1080  # Default fallback if screen resolution cannot be detected

    # Get screen resolution dynamically
    screen_height = int(cv2.getWindowImageRect("Temp")[3]) if cv2.namedWindow("Temp") else 1080
    max_height = int(screen_height * vh_percent)

    # Resize only if the image is taller than the target height
    h, w = image.shape[:2]
    if h > max_height:
        scale = max_height / h
        new_width = int(w * scale)
        new_height = int(h * scale)
        return cv2.resize(image, (new_width, new_height))
    return image

def main():
    pdf_to_jpg("./src/document.pdf", "./src")
    show_selecting_window("./src/document_page_1.jpg", "./src")

if __name__ == "__main__":
    main()
