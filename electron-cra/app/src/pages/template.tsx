import { useEffect, useState } from "react";
import Template from "../types/template";

export default function TemplatePage() {
  const [templateData, setTemplateData] = useState<Template[]>([]);
  const [status, setStatus] = useState<'viewing' | 'selecting' | 'labeling'>("viewing");
  const [templateName, setTemplateName] = useState<string>("");
  const [PlainTemplateImage, setPlainTemplateImage] = useState<string | null>(null);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>("");

  useEffect(() => {
    async function  getTemplateData(){
      try {
        const result = await window.electron.fetchTemplates();
        console.log("copyFiles sent, received in main process:", result);
        setTemplateData(result);
      } catch (error) {
        console.error("Error in sending message:", error);
      }
    }
    getTemplateData();
  },[]);

  function ValidateTemplateName(){
    if(templateName === ""){
        alert("Please enter a template name");
        return false;
    }
    return true;
  }

  function validateSelectedField(field: string){
    const regex = /^(\d+(-\d+)?,)*(?:\d+(-\d+)?)$/;
      if(field === ""){
          alert("Please select a field to label");
          return false;
      }
      if(!regex.test(field)){
          alert("Invalid field format");
          return false;
      }
      return true;
  }

  function convertFieldToArray(field: string){
    const field_array = field.split(",").map((field) => {
      if(field.includes("-")){
        const range = field.split("-").map((num) => parseInt(num));
        return Array.from({length: range[1] - range[0] + 1}, (_, i) => i + range[0]);
      }
      return parseInt(field);
    });
    return field_array.flat();
  }

  async function handleSelectTemplateFile(files: FileList | null){
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
    if(!ValidateTemplateName()){
      console.log("Invalid template name");
      return false;
    }
    if(!validateSelectedField(selectedField)){
      console.log("Invalid field format");
      return false;
    }
    alert(convertFieldToArray(selectedField));

    try{
      const result = await window.electron.processTemplate();
      setTemplateImage(result);
      setStatus("labeling");
      console.log("uploadTemplate sent, received in main process:", result);
    }
    catch(error){
      console.error("Error in sending message:", error);
    }
    return true
  }

  async function handleSaveTemplate() {
    try{
      const result = await window.electron.saveTemplate(templateName, [1,2,3]);
      console.log("saveTemplate sent, received in main process:", result);
      alert("Template saved successfully");
      setStatus("viewing");
    }
    catch(error){
      console.error("Error in sending message:", error);
    }
  }

  return (
    <article className={`template ${status}`}>
      <section className="list">
        <span className="top-bar">
          <h2 className="title">Select Template</h2>
          <button className="icon-button create" onClick={() => setStatus("selecting")}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7143 10.2857H10.2857V16.7143C10.2857 17.0553 10.1503 17.3823 9.90914 17.6234C9.66802 17.8645 9.34099 18 9 18C8.65901 18 8.33198 17.8645 8.09086 17.6234C7.84974 17.3823 7.71429 17.0553 7.71429 16.7143V10.2857H1.28571C0.944722 10.2857 0.617695 10.1503 0.376577 9.90914C0.135459 9.66802 0 9.34099 0 9C0 8.65901 0.135459 8.33198 0.376577 8.09086C0.617695 7.84975 0.944722 7.71429 1.28571 7.71429H7.71429V1.28571C7.71429 0.944722 7.84974 0.617695 8.09086 0.376577C8.33198 0.135458 8.65901 0 9 0C9.34099 0 9.66802 0.135458 9.90914 0.376577C10.1503 0.617695 10.2857 0.944722 10.2857 1.28571V7.71429H16.7143C17.0553 7.71429 17.3823 7.84975 17.6234 8.09086C17.8645 8.33198 18 8.65901 18 9C18 9.34099 17.8645 9.66802 17.6234 9.90914C17.3823 10.1503 17.0553 10.2857 16.7143 10.2857Z" fill="white"/>
            </svg>
            <p>New Template</p>
          </button>
        </span>

        <div className="template-list">
          {templateData.map((template) => (
            <div className="template-card">
              <img src={template.image} alt={template.name} />
              <p>{template.name}</p>
              <p>{template.accepted_field}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="create">
        <h2 className="title">New Template</h2>
        { status === 'selecting' && 
          <>
            <input type="text" id="template-name" onChange={(e)=>setTemplateName(e.target.value)} value={templateName}/>
            <label htmlFor="template-name">Template Name</label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => {handleSelectTemplateFile(e.target.files);}}
            />
            <label htmlFor="file-input" className="icon-button file-trigger">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.0268 6.14197L14.7455 2.86072C14.6846 2.79979 14.6122 2.75148 14.5325 2.71855C14.4528 2.68561 14.3675 2.66869 14.2812 2.66876H7.71875C7.37065 2.66876 7.03681 2.80704 6.79067 3.05318C6.54453 3.29933 6.40625 3.63317 6.40625 3.98126V5.29376H5.09375C4.74565 5.29376 4.41181 5.43204 4.16567 5.67818C3.91953 5.92433 3.78125 6.25817 3.78125 6.60626V18.4188C3.78125 18.7669 3.91953 19.1007 4.16567 19.3468C4.41181 19.593 4.74565 19.7313 5.09375 19.7313H14.2812C14.6293 19.7313 14.9632 19.593 15.2093 19.3468C15.4555 19.1007 15.5938 18.7669 15.5938 18.4188V17.1063H16.9062C17.2543 17.1063 17.5882 16.968 17.8343 16.7218C18.0805 16.4757 18.2188 16.1419 18.2188 15.7938V6.60626C18.2188 6.52006 18.2019 6.43468 18.169 6.35502C18.136 6.27535 18.0877 6.20296 18.0268 6.14197ZM14.2812 18.4188H5.09375V6.60626H11.3847L14.2812 9.50279V18.4188ZM16.9062 15.7938H15.5938V9.23126C15.5938 9.14506 15.5769 9.05968 15.544 8.98002C15.511 8.90035 15.4627 8.82796 15.4018 8.76696L12.1205 5.48572C12.0596 5.42479 11.9872 5.37648 11.9075 5.34355C11.8278 5.31061 11.7425 5.29369 11.6562 5.29376H7.71875V3.98126H14.0097L16.9062 6.87779V15.7938ZM12.3125 13.1688C12.3125 13.3428 12.2434 13.5097 12.1203 13.6328C11.9972 13.7559 11.8303 13.825 11.6562 13.825H7.71875C7.5447 13.825 7.37778 13.7559 7.25471 13.6328C7.13164 13.5097 7.0625 13.3428 7.0625 13.1688C7.0625 12.9947 7.13164 12.8278 7.25471 12.7047C7.37778 12.5817 7.5447 12.5125 7.71875 12.5125H11.6562C11.8303 12.5125 11.9972 12.5817 12.1203 12.7047C12.2434 12.8278 12.3125 12.9947 12.3125 13.1688ZM12.3125 15.7938C12.3125 15.9678 12.2434 16.1347 12.1203 16.2578C11.9972 16.3809 11.8303 16.45 11.6562 16.45H7.71875C7.5447 16.45 7.37778 16.3809 7.25471 16.2578C7.13164 16.1347 7.0625 15.9678 7.0625 15.7938C7.0625 15.6197 7.13164 15.4528 7.25471 15.3297C7.37778 15.2067 7.5447 15.1375 7.71875 15.1375H11.6562C11.8303 15.1375 11.9972 15.2067 12.1203 15.3297C12.2434 15.4528 12.3125 15.6197 12.3125 15.7938Z" fill="white"/>
              </svg>
              <p>Select Files</p>
            </label>
            <img src={`data:image/png;base64,${PlainTemplateImage}`} />
            <input
              id="file-input"
              type="text"
              onChange={(e) => {setSelectedField(e.target.value);}}
              value={selectedField}
            />
            <button className="create-button">Cancel</button>
            <button className="create-button" onClick={() => handleProcessTemplate()}>Next</button>
          </>
        }

        { status === 'labeling' && 
          <>
            <img src={`data:image/png;base64,${templateImage}`} />
            <button className="create-button">Cancel</button>
            <button className="create-button" onClick={() => handleSaveTemplate()}>Save</button>
          </>
        }
      </section>
    </article>
  );
}
