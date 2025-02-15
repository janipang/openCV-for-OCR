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
            <article className='scanner'>
                <section className="selection">
                    {/* template select component */}
                    <div className="wide-card">
                        <p>Select Files or Folder</p>
                        <span>
                            <button>Select Files</button>
                            <button>Select Folder</button>
                        </span>
                    </div>
                </section>
                <section className="progress">
                    <button className="submit" onClick={() => onProcessFiles()}>Process</button>
                </section>
            </article>
        </>
    )
}