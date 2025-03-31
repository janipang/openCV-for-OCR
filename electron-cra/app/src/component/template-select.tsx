import { useState } from "react";
import Template from "../types/template";
import "./template-select.css";

interface TemplateProps {
  templates: Template[] | null;
  currentTemplate: Template | null;
  setTemplate: (template: Template) => void;
}
export default function TemplateSelect({
  templates,
  currentTemplate,
  setTemplate,
}: TemplateProps) {

  const [isOpen, setIsOpen] = useState(false);

  function handleTemplateChange(template_name: string) {
    const selected_template = templates!.find(
      (template) => template.name === template_name
    ) as Template;
    setTemplate(selected_template);
    setIsOpen(false);
  }

  return (
    <div className="template-selector selector">
      <span className="top-bar">
        <p className="field-name">Select Template</p>
        {/* <select
          name="template-select"
          id="select-box"
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          {templates?.map((template) => (
            <option value={template.name}>
              <span className="button-span">{template.name}</span>
            </option>
          ))}
        </select> */}
        <div className="custom-dropdown">
          <div className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
            <p>{currentTemplate?.name}</p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_67_383)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 15.707C12.5196 15.8945 12.2653 15.9998 12.0001 15.9998C11.7349 15.9998 11.4806 15.8945 11.2931 15.707L5.6361 10.05C5.54059 9.95776 5.46441 9.84742 5.412 9.72541C5.35959 9.60341 5.332 9.47219 5.33085 9.33941C5.32969 9.20663 5.355 9.07495 5.40528 8.95205C5.45556 8.82916 5.52981 8.7175 5.6237 8.62361C5.7176 8.52972 5.82925 8.45547 5.95214 8.40519C6.07504 8.3549 6.20672 8.3296 6.3395 8.33076C6.47228 8.33191 6.6035 8.3595 6.7255 8.41191C6.84751 8.46431 6.95785 8.5405 7.0501 8.63601L12.0001 13.586L16.9501 8.63601C17.1387 8.45385 17.3913 8.35305 17.6535 8.35533C17.9157 8.35761 18.1665 8.46278 18.3519 8.64819C18.5373 8.8336 18.6425 9.08441 18.6448 9.34661C18.6471 9.6088 18.5463 9.86141 18.3641 10.05L12.7071 15.707Z" fill="#1D4ED8"/>
              </g>
              <defs>
                <clipPath id="clip0_67_383">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
              </defs>
            </svg>

          </div>
          {isOpen && (
            <ul className="dropdown-list">
              {templates?.map((template) => (
                <li
                  key={template.name}
                  className="dropdown-item"
                  onClick={() => handleTemplateChange(template.name)}
                >
                  {template.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </span>

      <div className="frame">
        <div className="picture">
          <img src={currentTemplate?.image} />
        </div>
      </div>
    </div>
  );
}
