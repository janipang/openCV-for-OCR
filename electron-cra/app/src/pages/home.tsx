import './home.css'
import TemplateSelect from '../component/template-select';
// import { useState } from 'react';

export default function HomePage() {

    // async function onProcessFiles() {
    //     try {
    //         const result = await window.electron.processFiles();
    //         console.log("Message sent, received in main process:", result);
    //     } catch (error) {
    //         console.error("Error in sending message:", error);
    //     }
    // }

    // const [files, setFiles] = useState<any>([]);
    // console.log(files);

    // const handleFileUpload = (newFiles: any[]) => {
    //     setFiles([...newFiles]);
    // }

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
        <>
            <article className='scanner'>
                <section className="selection">

                    {/* template select component */}
                    <TemplateSelect />
                    <div className="wide-card">
                        <p>Select Files or Folder</p>
                        <span className="button-group">
                            <input id="file-input" type="file" multiple onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    // handleFileUpload(Array.from(files));
                                }
                            }} />
                            <label htmlFor="file-input" className="file-label">
                                Select Files
                            </label>
                            {/* @ts-expect-error */}
                            <input directory="" webkitdirectory="" type="file" />
                            <label htmlFor="file-input" className="file-label">
                                Select Folder
                            </label>
                            {/* this damn here by the lazy developer */}
                            {/* https://stackoverflow.com/questions/71444475/webkitdirectory-in-typescript-and-react */}
                        </span>
                    </div>
                    <div className="wide-card">
                        <p>Select Output Folder</p>
                        {/* @ts-expect-error */}
                        <input directory="" webkitdirectory="" type="file" />
                        <label htmlFor="file-input" className="file-label">
                            Select Folder
                        </label>
                    </div>
                    <div className="wide-card">
                        <p>Output File Name</p>
                    </div>
                </section>

                <section className="progress">
                    <h2 className="title">Progress</h2>
                    {/* <button className="submit" onClick={() => onProcessFiles()}>Process</button> */}
                </section>
            </article>
        </>
    )
}