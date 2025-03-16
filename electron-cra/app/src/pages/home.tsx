import "./home.css";
import TemplateSelect from "../component/template-select";
import { useEffect, useState } from "react";
import Template from "../types/template";
import FileStatus from "../types/file-status";
import { filter_duplicate_filesname_new, filter_duplicate_filesname_new_old } from "../services/validate_file";
import FileSelectErrorDialog from "../component/file_select_error_dialog";

export default function HomePage() {
  const templates: Template[] = [
    {
      id: "bo001",
      name: "template1",
      image:
        "https://i.pinimg.com/736x/ad/2d/45/ad2d4570c8a6f58c4e62fc0d2851b9ac.jpg",
      accepted_field: [1, 3, 5, 7, 9, 10],
    },
    {
      id: "bo002",
      name: "template2",
      image:
        "https://th.bing.com/th/id/OIP.BADqZVZnDV9TbOI1Ws-7nAHaHa?rs=1&pid=ImgDetMain",
      accepted_field: [1, 3, 5, 7, 9, 10],
    },
    {
      id: "bo003",
      name: "template3",
      image:
        "https://img.freepik.com/premium-photo/cartoon-scene-scene-with-person-monster-with-pond-background_869640-43707.jpg",
      accepted_field: [1, 3, 5, 7, 9, 10],
    },
  ];

  const [template, setTemplate] = useState<Template>(templates[0]);
  const [inputFiles, setInputFiles] = useState<FileStatus[]>([]);
  const [outputDir, setOutputDir] = useState<string>("");
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<"waiting"|"running"|"complete">("waiting");

  useEffect(() => {
    if (window.electron?.onProcessUpdate) {
      const handler = (data: string) => {
        console.log("Received:", data);
        setMessage(data);
      };

      window.electron.onProcessUpdate(handler);

      return () => {
        // Remove event listener to avoid memory leaks
        window.electron?.onProcessUpdate(() => {});
      };
    }
  }, []);

  //receive message from electron main process
  useEffect(() => {
    if (typeof message !== "string") {
      console.warn("Message is not a string:", message);
      return;
    }
  
    const parts = message.split(":");
    if (parts[0] === "file-success") {
      const filename = parts[1];
  
      setInputFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.name === filename ? { ...file, status: "success" } : file
        )
      );
    }
    else if (parts[0] === "file-start") {
      const filename = parts[1];

      setInputFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.name === filename ? { ...file, status: "running" } : file
        )
      );
      console.log("set-status-running");
    }
    else if (parts[0] === "process-success"){
      setProcessStatus("complete");
    }
  }, [message, setInputFiles]);


  useEffect(() => {
      console.log("inputFiles", inputFiles);
  }, [inputFiles]);


  async function onProcessFiles() {
    if (!validateInputFile()){
      console.log("please select only pdf file to process");
      return false;
    }
    if (!validateOutputFileName()){
      console.log("please correct your output file name");
      return false;
    }
    if (!validateOutputDir()){
      console.log("please correct your output dir");
      return false;
    }
    
    setProcessStatus("running");

    try {
      const result = await window.electron.copyFiles(inputFiles);
      console.log("copyFiles sent, received in main process:", result);
    } catch (error) {
      console.error("Error in sending message:", error);
    }

    try {
        const result = await window.electron.processFiles(
          {
            output_dir: outputDir,
            output_file_name: outputFileName,
            selected_field: template.accepted_field,
          });

        // set status of all file as pending
        setInputFiles((prevFiles) => prevFiles.map(file => ({ ...file, status: "pending" })));
        console.log("Message sent, received in main process:", result);
    } catch (error) {
        console.error("Error in sending message:", error);
    }
  }

  function onCancel(){
    setTemplate(templates[0]);
    setInputFiles([]);
    setOutputDir("");
    setOutputFileName("");
    setProcessStatus("waiting");
  }

  async function onSelectFiles(files: FileList | null) {
    if (!files) return;
    const selected_files: FileStatus[] = await Promise.all(
      Array.from(files).map(async (file) => {
        return {
          name: file.name,
          data: Array.from(new Uint8Array(await file.arrayBuffer())), // Convert to serializable data
          status: "selected",
        };
      })
    );
    const filtered_files: FileStatus[] = [];
    const valid1 = filter_duplicate_filesname_new(selected_files);
    const valid2 = filter_duplicate_filesname_new_old(valid1.approved_files, inputFiles);
    filtered_files.push(...valid2.approved_files);
    console.log("filtered_files", filtered_files);
    setInputFiles([...inputFiles, ...filtered_files]);

    if (valid1.duplicate || valid2.duplicate) {
      return <FileSelectErrorDialog handleClose={() => setDialogOpen(false)} duplicate_new_files={valid1.duplicate_files} duplicate_new_old_files={valid2.duplicate_files} />;
    }
    console.log(dialogOpen);
  }

  async function handleSelectDirectory(){
    const selectedPath = await window.electron.selectDirectory();
    if (selectedPath){
      console.log(selectedPath);
      setOutputDir(selectedPath);
    }
  }

  function validateOutputFileName(){
    const regex = /^[^\\/:*?"<>|.]+$/;
    console.log(outputFileName);
    if (!regex.test(outputFileName)) {
      return false;
    }
    return true;
  }

  function validateInputFile(){
    if (!inputFiles || inputFiles.length === 0) return false;
    return true;
  }

  function validateOutputDir(){
    if (!outputDir) return false;
    return true;
  }

  return (
      <article className="scanner">
        <section className="selection">
          {/* template select component */}
          <div className="form">
            <TemplateSelect
              templates={templates}
              currentTemplate={template}
              setTemplate={setTemplate}
            />
            <div className="field-card">
              <p className="field-name">Select Files or Folder</p>
              <span className="button-group">
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={(e) => {onSelectFiles(e.target.files); e.target.value = "";}}
                />
                <label htmlFor="file-input" className="file-label">
                  Select Files
                </label>

                {/* @ts-expect-error */}
                <input id="folder-input" directory="" webkitdirectory="" type="file" onChange={(e) => onSelectFiles(e.target.files)}/>
                <label htmlFor="folder-input" className="file-label">
                  Select Folder
                </label>
                {/* this damn here by the lazy developer */}
                {/* https://stackoverflow.com/questions/71444475/webkitdirectory-in-typescript-and-react */}
              </span>
            </div>
            <div className="field-card">
              <p className="field-name">Select Output Folder</p>
              <span>
                <button className="file-label" onClick={handleSelectDirectory}>Select Folder</button>
              </span>
              
            </div>
            <div className="field-card">
              <p className="field-name">Output File Name</p>
              <span className="button-group">
                <input type="text" onChange={(e) => setOutputFileName(e.target.value)} placeholder="Enter Your Project Name" value={outputFileName}/>
              </span>
            </div>
          </div>

          <div className="field-card action-group">
            <span className="ghost"></span>
            <span className="button-group">
              <button className="icon-button cancel" onClick={() => onCancel()}>
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4412 13.9L15.3412 16.8C15.5245 16.9833 15.7578 17.075 16.0412 17.075C16.3245 17.075 16.5578 16.9833 16.7412 16.8C16.9245 16.6167 17.0162 16.3833 17.0162 16.1C17.0162 15.8167 16.9245 15.5833 16.7412 15.4L13.8412 12.5L16.7412 9.6C16.9245 9.41667 17.0162 9.18333 17.0162 8.9C17.0162 8.61667 16.9245 8.38333 16.7412 8.2C16.5578 8.01667 16.3245 7.925 16.0412 7.925C15.7578 7.925 15.5245 8.01667 15.3412 8.2L12.4412 11.1L9.54116 8.2C9.35783 8.01667 9.1245 7.925 8.84116 7.925C8.55783 7.925 8.3245 8.01667 8.14116 8.2C7.95783 8.38333 7.86616 8.61667 7.86616 8.9C7.86616 9.18333 7.95783 9.41667 8.14116 9.6L11.0412 12.5L8.14116 15.4C7.95783 15.5833 7.86616 15.8167 7.86616 16.1C7.86616 16.3833 7.95783 16.6167 8.14116 16.8C8.3245 16.9833 8.55783 17.075 8.84116 17.075C9.1245 17.075 9.35783 16.9833 9.54116 16.8L12.4412 13.9ZM12.4412 22.5C11.0578 22.5 9.75783 22.2373 8.54116 21.712C7.3245 21.1867 6.26616 20.4743 5.36616 19.575C4.46616 18.6757 3.75383 17.6173 3.22916 16.4C2.7045 15.1827 2.44183 13.8827 2.44116 12.5C2.4405 11.1173 2.70316 9.81733 3.22916 8.6C3.75516 7.38267 4.4675 6.32433 5.36616 5.425C6.26483 4.52567 7.32316 3.81333 8.54116 3.288C9.75916 2.76267 11.0592 2.5 12.4412 2.5C13.8232 2.5 15.1232 2.76267 16.3412 3.288C17.5592 3.81333 18.6175 4.52567 19.5162 5.425C20.4148 6.32433 21.1275 7.38267 21.6542 8.6C22.1808 9.81733 22.4432 11.1173 22.4412 12.5C22.4392 13.8827 22.1765 15.1827 21.6532 16.4C21.1298 17.6173 20.4175 18.6757 19.5162 19.575C18.6148 20.4743 17.5565 21.187 16.3412 21.713C15.1258 22.239 13.8258 22.5013 12.4412 22.5ZM12.4412 20.5C14.6745 20.5 16.5662 19.725 18.1162 18.175C19.6662 16.625 20.4412 14.7333 20.4412 12.5C20.4412 10.2667 19.6662 8.375 18.1162 6.825C16.5662 5.275 14.6745 4.5 12.4412 4.5C10.2078 4.5 8.31616 5.275 6.76616 6.825C5.21616 8.375 4.44116 10.2667 4.44116 12.5C4.44116 14.7333 5.21616 16.625 6.76616 18.175C8.31616 19.725 10.2078 20.5 12.4412 20.5Z" fill="#FF3B30"/>
                </svg>
                <p>Cancel</p>
              </button>
              { processStatus === "waiting" ? 
                <button className="icon-button submit" onClick={() => onProcessFiles()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.301 5.24438C6.09395 7.33359 5.99316 9.43196 5.999 11.5314C5.999 14.3324 6.169 16.5284 6.301 17.8204C8.21295 16.9519 10.0803 15.9884 11.896 14.9334C13.7169 13.8887 15.4844 12.7536 17.192 11.5324C15.4848 10.3099 13.7176 9.17343 11.897 8.12738C10.0809 7.07373 8.21321 6.11153 6.301 5.24438ZM4.396 4.29638C4.42301 4.06932 4.50261 3.8517 4.62848 3.6608C4.75435 3.4699 4.92302 3.311 5.12108 3.19673C5.31914 3.08246 5.54113 3.01596 5.76939 3.00254C5.99766 2.98911 6.22591 3.02912 6.436 3.11938C7.498 3.57338 9.878 4.65238 12.898 6.39538C15.919 8.13938 18.044 9.66238 18.967 10.3534C19.755 10.9444 19.757 12.1164 18.968 12.7094C18.054 13.3964 15.955 14.8994 12.898 16.6654C9.838 18.4314 7.486 19.4974 6.434 19.9454C5.528 20.3324 4.514 19.7454 4.396 18.7684C4.258 17.6264 4 15.0334 4 11.5314C4 8.03138 4.257 5.43938 4.396 4.29638Z" fill="white"/>
                  </svg>
                  <p>Start Processing</p>
                </button>
              : processStatus === "running" ?
                <button className="icon-button disabled" >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                  </svg>
                  <p>Running</p>
                </button>
              : 
                <button className="icon-button success">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                  </svg>
                  <p>Complete</p>
                </button>
              }
              
            </span>
          </div>
        </section>

        <section className="progress">
          <h2 className="title">Progress</h2>
          <div className='file-list'>
            {inputFiles.map((file, idx) => (
              <div key={file.name} className='small-wide-card'>
                <p className="file-name">{file.name}</p>
                {
                  file.status === 'selected' ? 
                    <button className="remove" onClick={() => setInputFiles(inputFiles.filter((_, i) => i !== idx))}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                      </svg>
                    </button> : 
                    <span className={`file-status ${file.status}`} />
                }
              </div>
            ))}
          </div>
        </section>
      </article>
  );
}
