import { useState } from "react";
import { validateTemplateName } from "../services/validate";
import Template from "../types/template";
import './template-card.css'

interface TemplateCardProps {
  templateData: Template;
  setTemplateItemName: (id: string, name: string) => void;
  deleteTemplateById: (id: string) => void;
  isDeleting: boolean;
}

export default function TemplateCard({
  templateData,
  setTemplateItemName,
  deleteTemplateById,
  isDeleting
}: TemplateCardProps) {
  const [nameStatus, setNameStatus] = useState<"viewing" | "editing">(
    "viewing"
  );

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
          { isDeleting ? (
              <button 
                className="active-icon"
                onClick={()=> deleteTemplateById(templateData.id)}
              >
                <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.1667 4.16675V4.66675H18.6667H22.6667C22.8877 4.66675 23.0996 4.75455 23.2559 4.91083C23.4122 5.06711 23.5 5.27907 23.5 5.50008C23.5 5.7211 23.4122 5.93306 23.2559 6.08934C23.0996 6.24562 22.8877 6.33342 22.6667 6.33342H21.3333H20.8333V6.83342V21.5001C20.8333 22.4283 20.4646 23.3186 19.8082 23.975C19.1518 24.6313 18.2616 25.0001 17.3333 25.0001H6.66667C5.73841 25.0001 4.84817 24.6313 4.19179 23.975C3.53542 23.3186 3.16667 22.4283 3.16667 21.5001V6.83342V6.33342H2.66667H1.33333C1.11232 6.33342 0.900358 6.24562 0.744078 6.08934C0.587797 5.93306 0.5 5.7211 0.5 5.50008C0.5 5.27907 0.587797 5.06711 0.744078 4.91083C0.900358 4.75455 1.11232 4.66675 1.33333 4.66675H5.33333H5.83333V4.16675V2.83341C5.83333 2.25878 6.06161 1.70768 6.46794 1.30135C6.87426 0.895021 7.42536 0.666748 8 0.666748H16C16.5746 0.666748 17.1257 0.895021 17.5321 1.30135C17.9384 1.70768 18.1667 2.25878 18.1667 2.83341V4.16675ZM16.5 2.83341V2.33341H16H8H7.5V2.83341V4.16675V4.66675H8H16H16.5V4.16675V2.83341ZM19.1667 6.83342V6.33342H18.6667H5.33333H4.83333V6.83342V21.5001C4.83333 21.9863 5.02649 22.4526 5.3703 22.7964C5.71412 23.1403 6.18044 23.3334 6.66667 23.3334H17.3333C17.8196 23.3334 18.2859 23.1403 18.6297 22.7964C18.9735 22.4526 19.1667 21.9863 19.1667 21.5001V6.83342Z" fill="black" stroke="black"/>
                  <path d="M8.5 10H10.1667V19.6667H8.5V10ZM13.8333 10H15.5V19.6667H13.8333V10Z" fill="black" stroke="black"/>
                </svg>
              </button>
            ) : nameStatus == "editing" ? (
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
              </button> ) : (
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
    </div>
  );
}
