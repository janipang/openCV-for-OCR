import Template from '../types/template';
import './template-select.css'

interface TemplateProps {
    templates: Template[];
    currentTemplate: Template;
    setTemplate: (template: Template) => void;
}
export default function TemplateSelect({templates, currentTemplate, setTemplate}: TemplateProps) {


    return (
        <div className="template-selector selector">
            <span className="top-bar">
                <h2 className="field-name">Select Template</h2>
                <span className='tab-group'>
                    {
                        templates.map((template) => (
                            <button className='tab-item' onClick={() => setTemplate(template)} >{template.name}</button>
                        ))
                    }
                </span>
            </span>

            <div className="frame">
                <div className='picture'>
                    <img src={currentTemplate.image} />
                </div>
            </div>
        </div>
    );
}