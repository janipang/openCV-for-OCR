export default function FileUpload() {
    const selectedPaths = [
        // "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202411030001.pdf",
        // "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010002.pdf",
        // "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010004.pdf",
        // "D:/Code/Project/Software/openCV-for-OCR/src/project-docs-1/CA202412010005.pdf",
        "D:/projects/openCV-for-OCR/src/project-docs-1/CA202411020001.pdf",
        "D:/projects/openCV-for-OCR/src/project-docs-1/CA202411020002.pdf",
        "D:/projects/openCV-for-OCR/src/project-docs-1/INV202411050003.pdf",
        "D:/projects/openCV-for-OCR/src/project-docs-1/INV202411050004.pdf",
    ]
    async function onSelectFiles(paths: string[]) {
        try {
            const result = await window.electron.copyFiles(paths);
            console.log("Message sent, received in main process:", result);
        } catch (error) {
            console.error("Error in sending message:", error);
        }
    }

    return (
        <div className="file-dropzone">
            <button onClick={() => onSelectFiles(selectedPaths)}>select files here</button>
        </div>
    )
}