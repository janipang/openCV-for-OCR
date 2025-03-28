import { useState } from "react";
import { formatNumberRanges, parseNumberRanges, validateNumberRangeInput } from "../services/format-number";
import { validateTemplateName } from "../services/validate";
import Template from "../types/template";
import './template-card.css'

interface TemplateCardProps {
  templateData: Template;
  setTemplateItemName: (id: string, name: string) => void;
  setTemplateItemField: (id: string, field: number[]) => void;
}

export default function TemplateCard({
  templateData,
  setTemplateItemName,
  setTemplateItemField,
}: TemplateCardProps) {
  const [nameStatus, setNameStatus] = useState<"viewing" | "editing">(
    "viewing"
  );
  const [fieldStatus, setFieldStatus] = useState<"viewing" | "editing">(
    "viewing"
  );
  const [fieldDataDisplay, setFieldDataDisplay] = useState<string>(formatNumberRanges(templateData.accepted_field));

  return (
    <div className="template-card">

      <div className="element first">
        <span className="small-wide-card">
          <input
            type="text"
            className="name"
            value={templateData.name}
            disabled={nameStatus == 'viewing'}
            onChange={(e) => {
              setTemplateItemName(templateData.id, e.target.value);
            }}
          />
          {nameStatus == "editing" ? (
            <button
              className="active-icon"
              onClick={async () => {
                if (validateTemplateName(templateData.name)) {
                  try {
                    const result = window.electron.putTemplateName(
                      templateData.id,
                      templateData.name
                    );
                    console.log(
                      "putTemplateName send to main, received with status: ",
                      result
                    );
                    setNameStatus('viewing');
                  } catch (error) {
                    console.error("Error in sending putTemplateName:", error);
                  }
                } else {
                  alert('กรุณาใช้ชื่อที่ไม่ประกอบด้วย <>, ^, \\, " ');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#383838">
                <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
              </svg>
            </button>
          ) : (
            <button
              className="active-icon"
              onClick={() => {
                setNameStatus('editing');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#383838"> 
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
              </svg>
            </button>
          )}
        </span>
      </div>

      <div className="element second">
        <div className="view-box">
          <div className="image">
            <img src={templateData.image} alt={templateData.name} />
          </div>
        </div>
      </div>
      
      <div className="element third" >
        <p className="field-name">Accepted Field</p>
        <span className="small-wide-card">
          <input
            type="text"
            className="field"
            value={fieldDataDisplay}
            disabled={fieldStatus == 'viewing'}
            onChange={(e) => {
              setFieldDataDisplay(e.target.value);
            }}
          />
          {fieldStatus == "editing" ? (
            <button
              className="active-icon"
              onClick={async () => {
                const validate_result = validateNumberRangeInput(fieldDataDisplay);
                if (validate_result.valid) {
                  setTemplateItemField(templateData.id, parseNumberRanges(fieldDataDisplay));
                  try {
                    const result = window.electron.putTemplateField(
                      templateData.id,
                      parseNumberRanges(fieldDataDisplay)
                    );
                    console.log( "putTemplateField send to main, received with status: ", result );
                    setFieldStatus('viewing');
                  } catch (error) {
                    console.error("Error in sending putTemplateField:", error);
                  }
                } else {
                  alert(validate_result.error);
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#383838">
                <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
              </svg>
            </button>
          ) : (
            <button
              className="active-icon"
              onClick={() => {
                setFieldStatus('editing');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#383838"> 
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
              </svg>
            </button>
          )}
        </span>
      </div>

    </div>
  );
}
