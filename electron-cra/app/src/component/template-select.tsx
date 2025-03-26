import Template from "../types/template";
import "./template-select.css";

interface TemplateProps {
  templates: Template[];
  currentTemplate: Template;
  setTemplate: (template: Template) => void;
}
export default function TemplateSelect({
  templates,
  currentTemplate,
  setTemplate,
}: TemplateProps) {
  function handleTemplateChange(template_name: string) {
    console.log(template_name);
    const selected_template = templates.find(
      (template) => template.name === template_name
    ) as Template;
    setTemplate(selected_template);
  }

  return (
    <div className="template-selector selector">
      <span className="top-bar">
        <p className="field-name">Select Template</p>
        <select
          name="template-select"
          id="select-box"
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          {templates.map((template) => (
            <option value={template.name}>{template.name}</option>
          ))}
        </select>
      </span>

      <div className="frame">
        <div className="picture">
          <img src={currentTemplate.image} />
        </div>
      </div>
    </div>
  );
}
