import './home.css'
import FileUpload from '../component/file-upload';

export default function HomePage() {

    async function onProcessFiles() {
        try {
            const result = await window.electron.processFiles();
            console.log("Message sent, received in main process:", result);
        } catch (error) {
            console.error("Error in sending message:", error);
        }
    }
    return (
        <>
            <article className="process">
                <FileUpload />
                <section className="select section-content">
                    <h3>Select Template</h3>
                    <div className="template-select">
                        <span className="card">
                            <div><span>Template1</span><span></span></div>
                        </span>
                        <span className="card">
                            <div><span>Template2</span><span></span></div>
                        </span>
                        <span className="card">
                            <div><span>Template3</span><span></span></div>
                        </span>
                    </div>
                </section>
                <section className="filename section-content">
                    <h3>Output File Name</h3>
                    <span className="input-name">
                        <input type="text" />
                        <p>.csv</p>
                    </span>
                </section>
                <button className="submit" onClick={() => onProcessFiles()}>Process</button>
            </article>
        </>
    )
}