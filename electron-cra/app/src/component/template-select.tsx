import './template-select.css'

export default function TemplateSelect() {

    const templates = [{ name: "template1", image: "https://i.pinimg.com/736x/ad/2d/45/ad2d4570c8a6f58c4e62fc0d2851b9ac.jpg" },
        { name: "template2", image: "https://th.bing.com/th/id/OIP.BADqZVZnDV9TbOI1Ws-7nAHaHa?rs=1&pid=ImgDetMain" },
        { name: "template3", image: "https://img.freepik.com/premium-photo/cartoon-scene-scene-with-person-monster-with-pond-background_869640-43707.jpg" }]
    return (
        <div className="template-selector selector">
            <span className="top-bar">
                <h2 className="field-name">Select Template</h2>
                <span className='tab-group'>
                    {
                        templates.map((template) => (
                            <button className='tab-item'>{template.name}</button>
                        ))
                    }
                </span>
            </span>

            <div className="frame">
                <div className='picture'>
                    <img src={templates[2].image} />
                </div>
            </div>
        </div>
    );
}