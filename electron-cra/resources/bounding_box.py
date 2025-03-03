import cv2
import easyocr

reader = easyocr.Reader(['th', 'en'])

class BoundingBox:
    def __init__(self, src_image, pos, box_type, parent=None, note = None, indexing_treshold = 20) -> None:
        self.src_image = src_image
        self.box_type = box_type
        self.note = note
        self.parent = parent
        self.child = []
        self.text = None
        self.paragraph = None
        if len(pos) == 4: # OpenCV Bounding Box (x, y, w, h)
            self.pos = list(pos)
            self.tl = [self.pos[0] , self.pos[1]]
            self.tr = [self.pos[0] + self.pos[2] , self.pos[1]]
            self.bl = [self.pos[0] , self.pos[1] + self.pos[3]]
            self.br = [self.pos[0] + self.pos[2] , self.pos[1] + self.pos[3]]
        elif len(pos) == 2:  # Bounding Box [[tlx, tly], [brx, bry]]
            self.tl = list(pos[0])
            self.br = list(pos[1])
            self.tr = [self.br[0], self.tl[1]]
            self.bl = [self.tl[0], self.br[1]]
            self.pos = [self.tl[0], self.tl[1], self.br[0] - self.tl[0], self.br[1] - self.tl[1]]
        self.indexing = (round(self.tl[1] / indexing_treshold) * self.src_image.shape[1]) + self.tl[0]

    def __repr__(self) -> str:
        return f"This is a bounding box of {self.box_type}, Having absolute position of {self.tl[0]} and {self.tl[1]} as top left. Also have {len(self.child)} child element in it\n"

    def print_paragraph(self):
        if self.text == None:
            self.textOCR()
        if self.paragraph != None:
            return self.paragraph

        k = []
        for data in self.text:
            # box, text
            _, text = data
            k.append(text)
        self.paragraph = " ".join(k)
        return self.paragraph

    def textOCR(self):
        if self.text != None:
            return self.text
        t = self.image()
        self.text = reader.readtext(t, paragraph=True, y_ths=0.01)

    def show_image(self) -> None:
        display = self.src_image.copy()
        display = display[self.tl[1] : self.br[1], self.tl[0] : self.br[0]]
        cv2_imshow(display)

    def show_image_highlight(self) -> None:
        display = self.src_image.copy()
        q = [self]
        while q != []:
            bbox = q.pop(0)
            cv2.rectangle(display, bbox.tl, bbox.br, (0, 255, 0), 4)
            q.extend(bbox.child)
        cv2_imshow(display)

    def image(self, otsu=False):
        image = self.src_image.copy()
        image = image[self.tl[1] : self.br[1], self.tl[0] : self.br[0]]
        if not otsu:
            return image
        grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, otsud = cv2.threshold(grey, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
        return otsud

    def merge_bounding_boxes(*bounding_boxes, box_type="merged"):
        if not bounding_boxes:
            return None  # No bounding boxes to merge

        # Find the top-left and bottom-right coordinates that enclose all bounding boxes
        min_x = min(bbox.tl[0] for bbox in bounding_boxes)
        min_y = min(bbox.tl[1] for bbox in bounding_boxes)
        max_x = max(bbox.br[0] for bbox in bounding_boxes)
        max_y = max(bbox.br[1] for bbox in bounding_boxes)

        # Compute the new bounding box width and height
        new_width = max_x - min_x
        new_height = max_y - min_y

        # Determine the largest parent (None is considered the largest)
        largest_parent = None
        for bbox in bounding_boxes:
            if bbox.parent is None:
                largest_parent = None  # If any bbox has no parent, the merged box is the top-level
                src_image = bbox.src_image
                break

            if largest_parent is None or bbox.parent is None:
                largest_parent = bbox.parent
                src_image = bbox.src_image

            elif bbox.parent == largest_parent:
                continue
            elif bbox.parent is not None:
                largest_parent = bbox.parent  # Ensure the highest ancestor is chosen
                src_image = bbox.src_image

        # Create the new bounding box
        merged_box = BoundingBox(src_image, (min_x, min_y, new_width, new_height), box_type, parent=largest_parent)

        # Assign all provided bounding boxes as children of the new bounding box
        for bbox in bounding_boxes:
            bbox.parent = merged_box
            merged_box.child.append(bbox)

        return merged_box

    def add_child(self, pos, box_type="X") -> "BoundingBox":
        if len(pos) == 2:  # Bounding Box [[tlx, tly], [brx, bry]]
            tl = list(pos[0])
            br = list(pos[1])
            abs_x = self.tl[0] + tl[0]
            abs_y = self.tl[1] + tl[1]
            abs_w = br[0] - tl[0]
            abs_h = br[1] - tl[1]
        else:
            abs_x = self.tl[0] + pos[0]
            abs_y = self.tl[1] + pos[1]
            abs_w = pos[2]
            abs_h = pos[3]

        # Create the child bounding box
        child_box = BoundingBox(self.src_image, (abs_x, abs_y, abs_w, abs_h), box_type, parent=self)

        # Append to parent's children list
        self.child.append(child_box)

        return child_box  # Return the new child box

    def sort_children(self):
        """Sorts child bounding boxes based on self.indexing."""
        self.child.sort(key=lambda bbox: bbox.indexing)

    def reset_children(self):

        for child in self.child:
            child.parent = None

        self.child = []
        