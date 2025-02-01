
export default function FileUpload() {
    const selectedPaths = [
        "D:/Code/Project/Software/openCV-for-OCR/src/เอกสารทำ Project-1/CA202411030001.pdf",
        "D:/Code/Project/Software/openCV-for-OCR/src/เอกสารทำ Project-1/CA202412010002.pdf",
        "D:/Code/Project/Software/openCV-for-OCR/src/เอกสารทำ Project-1/CA202412010004.pdf",
        "D:/Code/Project/Software/openCV-for-OCR/src/เอกสารทำ Project-1/CA202412010005.pdf",
    ]
    async function onSelectFiles(paths: string[]) {
        // const status = await window.electron.copyFiles(paths);
        // if (status === "success") {console.log("copied")}
        console.log(paths);
    }

    return (
        <div className="file-dropzone">
            <button onClick={() => onSelectFiles(selectedPaths)}>select files here</button>
        </div>
    )
}