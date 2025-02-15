import { useState } from 'react';
import './file-upload.css';

export default function FileUpload() {
    const [files, setFiles] = useState<any>([]);

    const handleFileUpload = (newFiles: any[]) => {
        setFiles([...newFiles]);
    }

    console.log(files);

    // const selectedPaths = [
    //     "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202411030001.pdf",
    //     "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010002.pdf",
    //     "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010004.pdf",
    //     "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010005.pdf",
    //     // "D:/projects/openCV-for-OCR/src/project-docs-1/CA202411020001.pdf",
    //     // "D:/projects/openCV-for-OCR/src/project-docs-1/CA202411020002.pdf",
    //     // "D:/projects/openCV-for-OCR/src/project-docs-1/INV202411050003.pdf",
    //     // "D:/projects/openCV-for-OCR/src/project-docs-1/INV202411050004.pdf",
    // ]
    // async function onSelectFiles(paths: string[]) {
    //     try {
    //         const result = await window.electron.copyFiles(paths);
    //         console.log("Message sent, received in main process:", result);
    //     } catch (error) {
    //         console.error("Error in sending message:", error);
    //     }
    // }

    return (
        <div className="file-upload">
            <span>
                <p className='field-name'>Select Template</p>
                <div>
                    <button>template1</button>
                    <button>template2</button>
                    <button>template3</button>
                </div>
            </span>
            <input id="file-input" type="file" multiple onChange={(e) => {
                const files = e.target.files;
                if (files) {
                    handleFileUpload(Array.from(files));
                }
            }} />
            {/* @ts-expect-error */}
            <input directory="" webkitdirectory="" type="file" />
            {/* this damn here by the lazy developer */}
            {/* https://stackoverflow.com/questions/71444475/webkitdirectory-in-typescript-and-react */}
            <label htmlFor="file-input">Select Files to Process</label>
        </div>
    )
}