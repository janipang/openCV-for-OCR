from document import *
from bounding_box import *

import pickle
import weakref

def document_to_json(document, pkl_save_path):
    obj = remove_weakrefs_recursive(document)
    with open(pkl_save_path, 'wb') as file:
        pickle.dump(obj, file)

def document_from_json(pkl_read_path):
    with open(pkl_read_path, 'rb') as file:
        document = pickle.load(file)
    return document

def remove_weakrefs_recursive(obj):
    """ลบ weakref dictionary ใน object ที่ซับซ้อน"""
    if isinstance(obj, weakref.WeakValueDictionary):
        return dict(obj)  # แปลง WeakValueDictionary เป็น dict
    elif isinstance(obj, dict):
        return {key: remove_weakrefs_recursive(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [remove_weakrefs_recursive(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(remove_weakrefs_recursive(item) for item in obj)
    elif hasattr(obj, "__dict__"):  # ถ้าเป็น object class
        obj_dict = obj.__dict__.copy()
        for key, value in obj_dict.items():
            obj_dict[key] = remove_weakrefs_recursive(value)
        obj.__dict__ = obj_dict
    return obj