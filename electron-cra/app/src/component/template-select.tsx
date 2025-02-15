export default function TemplateSelect() {
    return (
        <div className="template-selector selector">
            <span className="top-bar">
                <h2 className="field-name">Select Template</h2>
                <div>
                    <button>template1</button>
                    <button>template2</button>
                    <button>template3</button>
                </div>
            </span>
            <div className="frame">
                <p>image here</p>
                <img></img>
            </div>
        </div>
    );
}