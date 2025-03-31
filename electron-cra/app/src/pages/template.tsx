import { useEffect, useState } from "react";
import Template from "../types/template";
import './template.css'
import TemplateCard from "../component/template-card";
import { parseNumberRanges, validateNumberRangeInput } from "../services/format-number";

export default function TemplatePage() {
  const [templateData, setTemplateData] = useState<Template[]>([]);
  const [status, setStatus] = useState<'viewing' | 'selecting' | 'labeling' | 'confirming' | 'deleting'>('viewing');

  // for create new template
  const [templateName, setTemplateName] = useState<string>("");
  const [plainTemplateImage, setPlainTemplateImage] = useState<string[] | null>(null);
  const [boxedTemplateImage, setBoxedTemplateImage] = useState<string[] | null>(null);
  const [templateImage, setTemplateImage] = useState<string[] | null>(null);
  const [selectedField, setSelectedField] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  async function getTemplateData(){
      try {
        const result = await window.electron.getTemplates();
        console.log("copyFiles sent, received in main process:", result);
        setTemplateData(result);
      } catch (error) {
        console.error("Error in sending message:", error);
      }
    }

  useEffect(() => {
    getTemplateData();
  },[]);

  async function deleteTemplateById(id: string) {
    try {
      const result = await window.electron.deleteTemplate(id);
      console.log("deleteTemplate sent, received in main process:", result);
      getTemplateData();
    } catch (error) {
      console.error("Error in sending message:", error);
    }
  }

  // ///////////////////////////////////////////// VALIDATION ///////////////////////////////////////////////
  // ///////////////////////////////////////////// VALIDATION ///////////////////////////////////////////////
  function ValidateTemplateName(){
    if(templateName === ""){
        alert("Please enter a template name");
        return false;
    }
    return true;
  }

  // ///////////////////////////////////////////// CREATE TEMPLATE ///////////////////////////////////////////////
  // ///////////////////////////////////////////// CREATE TEMPLATE ///////////////////////////////////////////////

  async function handleUploadTemplate(files: FileList | null){
    if (files && files.length > 0) {
      const selectedFile = files[0]; // เก็บไฟล์แรกจาก FileList
      console.log("Selected file:", selectedFile);
      const electronFile = {
        name: selectedFile.name,
        data: Array.from(new Uint8Array(await selectedFile.arrayBuffer())),
      };
      try{
        const result = await window.electron.uploadTemplate(electronFile);
        setPlainTemplateImage(result);
        console.log("uploadTemplate sent, received in main process:", result);
      }
      catch(error){
        console.error("Error in sending message:", error);
      }
    }
  }

  async function handleProcessTemplate(){
    setLoading(true);
    try{
      const result = await window.electron.processTemplate();
      setBoxedTemplateImage(result);
      setLoading(false);
      setStatus("labeling");
      console.log("processTemplate sent, received in main process:", result);
    }
    catch(error){
      console.error("Error in sending message:", error);
    }
    return true
  }

  async function handleLabelTemplate() {
    if(!validateNumberRangeInput(selectedField).valid){
      alert('ฟิลด์ที่เลือก'+ validateNumberRangeInput(selectedField).error)
      return false;
    }
    setLoading(true);
    try{
      const result = await window.electron.viewFinalTemplate(templateName, parseNumberRanges(selectedField));
      setTemplateImage(result);
      setLoading(false);
      setStatus('confirming');
      console.log("viewFinalTemplate sent, received in main process:", result);
    }
    catch(error){
      console.error("Error in sending message:", error);
    }
    return true
  }

  async function handleSaveTemplate() {
    if(!ValidateTemplateName()){
      alert("Invalid template name");
      return false;
    }
    if(!validateNumberRangeInput(selectedField).valid){
      alert('ฟิลด์ที่เลือก'+ validateNumberRangeInput(selectedField).error)
      return false;
    }
    try{
      const result = await window.electron.saveTemplate(templateName, parseNumberRanges(selectedField));
      console.log("saveTemplate sent, received in main process:", result);
      alert("Template saved successfully");
      getTemplateData();
      setStatus("viewing");
    }
    catch(error){
      console.error("Error in sending message:", error);
    }
  }

  function handleCancelCreate(){
    alert("The Change will not be Saved");
    setTemplateName("");
    setPlainTemplateImage(null);
    setTemplateImage(null);
    setSelectedField("");
    getTemplateData();
    setStatus("viewing");
  }

  function setTemplateItemName(id:string, name: string){
    const updatedTemplates = templateData.map(item => {
      if (item.id === id) {
        return { ...item, name: name };
      }
      return item;
    });
    setTemplateData(updatedTemplates);
  }

  return (
    <article className={`template ${status}`}>
      <section className="list">
        <span className="top-bar">
          <h2 className="title">Templates</h2>
          <span className="button-group">
            <button className="icon-button create" onClick={() => setStatus("selecting")}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.7143 10.2857H10.2857V16.7143C10.2857 17.0553 10.1503 17.3823 9.90914 17.6234C9.66802 17.8645 9.34099 18 9 18C8.65901 18 8.33198 17.8645 8.09086 17.6234C7.84974 17.3823 7.71429 17.0553 7.71429 16.7143V10.2857H1.28571C0.944722 10.2857 0.617695 10.1503 0.376577 9.90914C0.135459 9.66802 0 9.34099 0 9C0 8.65901 0.135459 8.33198 0.376577 8.09086C0.617695 7.84975 0.944722 7.71429 1.28571 7.71429H7.71429V1.28571C7.71429 0.944722 7.84974 0.617695 8.09086 0.376577C8.33198 0.135458 8.65901 0 9 0C9.34099 0 9.66802 0.135458 9.90914 0.376577C10.1503 0.617695 10.2857 0.944722 10.2857 1.28571V7.71429H16.7143C17.0553 7.71429 17.3823 7.84975 17.6234 8.09086C17.8645 8.33198 18 8.65901 18 9C18 9.34099 17.8645 9.66802 17.6234 9.90914C17.3823 10.1503 17.0553 10.2857 16.7143 10.2857Z" fill="white"/>
              </svg>
              <p>New Template</p>
            </button>
            { status !== 'deleting' ?
              <button className="icon-button delete" onClick={() => setStatus("deleting")}>
                <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.1667 4.16675V4.66675H18.6667H22.6667C22.8877 4.66675 23.0996 4.75455 23.2559 4.91083C23.4122 5.06711 23.5 5.27907 23.5 5.50008C23.5 5.7211 23.4122 5.93306 23.2559 6.08934C23.0996 6.24562 22.8877 6.33342 22.6667 6.33342H21.3333H20.8333V6.83342V21.5001C20.8333 22.4283 20.4646 23.3186 19.8082 23.975C19.1518 24.6313 18.2616 25.0001 17.3333 25.0001H6.66667C5.73841 25.0001 4.84817 24.6313 4.19179 23.975C3.53542 23.3186 3.16667 22.4283 3.16667 21.5001V6.83342V6.33342H2.66667H1.33333C1.11232 6.33342 0.900358 6.24562 0.744078 6.08934C0.587797 5.93306 0.5 5.7211 0.5 5.50008C0.5 5.27907 0.587797 5.06711 0.744078 4.91083C0.900358 4.75455 1.11232 4.66675 1.33333 4.66675H5.33333H5.83333V4.16675V2.83341C5.83333 2.25878 6.06161 1.70768 6.46794 1.30135C6.87426 0.895021 7.42536 0.666748 8 0.666748H16C16.5746 0.666748 17.1257 0.895021 17.5321 1.30135C17.9384 1.70768 18.1667 2.25878 18.1667 2.83341V4.16675ZM16.5 2.83341V2.33341H16H8H7.5V2.83341V4.16675V4.66675H8H16H16.5V4.16675V2.83341ZM19.1667 6.83342V6.33342H18.6667H5.33333H4.83333V6.83342V21.5001C4.83333 21.9863 5.02649 22.4526 5.3703 22.7964C5.71412 23.1403 6.18044 23.3334 6.66667 23.3334H17.3333C17.8196 23.3334 18.2859 23.1403 18.6297 22.7964C18.9735 22.4526 19.1667 21.9863 19.1667 21.5001V6.83342Z" fill="#FF3B30" stroke="#FF3B30"/>
                  <path d="M8.5 10H10.1667V19.6667H8.5V10ZM13.8333 10H15.5V19.6667H13.8333V10Z" fill="#FF3B30" stroke="#FF3B30"/>
                </svg>
                <p>Delete</p>
              </button> 
              : 
              <button className="icon-button complete" onClick={() => setStatus("viewing")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.55018 15.15L18.0252 6.675C18.2252 6.475 18.4585 6.375 18.7252 6.375C18.9918 6.375 19.2252 6.475 19.4252 6.675C19.6252 6.875 19.7252 7.11267 19.7252 7.388C19.7252 7.66333 19.6252 7.90067 19.4252 8.1L10.2502 17.3C10.0502 17.5 9.81685 17.6 9.55018 17.6C9.28351 17.6 9.05018 17.5 8.85018 17.3L4.55018 13C4.35018 12.8 4.25418 12.5627 4.26218 12.288C4.27018 12.0133 4.37451 11.7757 4.57518 11.575C4.77585 11.3743 5.01351 11.2743 5.28818 11.275C5.56285 11.2757 5.80018 11.3757 6.00018 11.575L9.55018 15.15Z" fill="black"/>
                </svg>
                <p>Complete</p>
              </button> 
            }
          </span>
          
        </span>

        <div className="template-list">
          <div className="template-list-content">
            {templateData.map((template) => (
              <TemplateCard templateData={template} setTemplateItemName={setTemplateItemName} deleteTemplateById={deleteTemplateById}isDeleting={status=='deleting'}/>
            ))}
          </div>
        </div>
      </section>

      <section className={`create ${status}`}>
        <h2 className="title">New Template</h2>
        <label className="text-label" htmlFor="template-name">Template Name</label>
        <input type="text" id="template-name" onChange={(e)=>setTemplateName(e.target.value)} value={templateName}/>
        <label className="text-label">Template File</label>
        
        { status === 'selecting' && 
          <>
            <div className="upload-container">
              { plainTemplateImage && 
                <div className="image-slide">
                  { plainTemplateImage.map(imgsrc => (
                    <img className="background" src={`data:image/png;base64,${imgsrc}`} />
                  ))}
                </div>
              }
              <input
                id="file-input"
                type="file"
                onChange={(e) => {handleUploadTemplate(e.target.files);}}
              />
              {!loading ? 
                <>
                  <label htmlFor="file-input" className="upload-button">
                    <p>Select Files</p>
                  </label>
                </> :
                <svg className="loading-icon" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3">
                  <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                </svg>
              }
            </div>
            <span className="button-group">
              <button className="cancel" onClick={() => handleCancelCreate()}>Cancel</button>
              <button className="next" onClick={() => handleProcessTemplate()}>Next</button>
            </span>
          </>
        }

        { status === 'labeling' && 
          <>
            <div className="upload-container">
              { boxedTemplateImage && 
                <div className="image-slide">
                  { boxedTemplateImage.map(imgsrc => (
                    <img className="background" src={`data:image/png;base64,${imgsrc}`} />
                  ))}
                </div>
              }
              
              {loading &&
                <svg className="loading-icon" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3">
                  <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                </svg>
              }   

            </div>
            <label htmlFor="accepted-field" className="text-label">Accepted Field</label>
            <input
              id="field-input"
              type="text"
              onChange={(e) => {setSelectedField(e.target.value);}}
              value={selectedField}
            />
            <span className="button-group">
              <button className="cancel" onClick={() => handleCancelCreate()}>Cancel</button>
              <button className="submit" onClick={() => handleLabelTemplate()}>Next</button>
            </span>
          </>
        }

        { status === 'confirming' && 
          <>
            <div className="upload-container">
              { templateImage && 
                <div className="image-slide">
                  { templateImage.map(imgsrc => (
                    <img className="background" src={`data:image/png;base64,${imgsrc}`} />
                  ))}
                </div>
              }
            
              {loading &&
                <svg className="loading-icon" xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3">
                  <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                </svg>
              }   
            </div>
            <span className="button-group">
              <button className="cancel" onClick={() => handleCancelCreate()}>Cancel</button>
              <button className="submit" onClick={() => handleSaveTemplate()}>Save</button>
            </span>
          </>
        }
      </section>
    </article>
  );
}
