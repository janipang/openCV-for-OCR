import "./home.css";
import TemplateSelect from "../component/template-select";
import { useEffect, useState } from "react";
import Template from "../types/template";
import FileStatus from "../types/file-status";

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
  // const [outputDir, setOutputDir] = useState<string>("");
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

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
  }, [message, setInputFiles]);

  useEffect(() => {
      console.log(inputFiles);
  }, [inputFiles]);

  async function onProcessFiles() {
      try {
          const result = await window.electron.processFiles(
            {
              output_dir: "C:/Users/pangj/Downloads/rabbit_noi",
              output_file_name: "rabbit_data",
              selected_field: [3,4,5,6,7,8,9]
            });

          // set status of all file as pending
          setInputFiles((prevFiles) => prevFiles.map(file => ({ ...file, status: "pending" })));
          console.log("backend processing files ends with status code: ", result)
      } catch (error) {
          console.error("Error in sending message:", error);
      }
  }

  function onCancel(){
    setTemplate(templates[0]);
    setInputFiles([]);
    // setOutputDir("");
    setOutputFileName("");
  }

  async function onSelectFiles(files: FileList | null) {
    if (files) {
      const fileArray = await Promise.all(
        Array.from(files).map(async (file) => {
          return {
            name: file.name,
            data: Array.from(new Uint8Array(await file.arrayBuffer())), // Convert to serializable data
          };
        })
      );
      console.log(fileArray);

      try {
        const result = await window.electron.copyFiles(fileArray);
        console.log("Message sent, received in main process:", result);
        setInputFiles([...createFileStatus(files)]);
      } catch (error) {
        console.error("Error in sending message:", error);
      }
    }
  }

  function createFileStatus(files: FileList) {
    let temp_status: FileStatus[] = [];
    Array.from(files).map((file) => {
      let item: FileStatus = {
        name: file.name,
        status: "selected",
      };
      temp_status.push(item);
    });

    return temp_status;
  }

  async function handleSelectDirectory(){
    const selectedPath = await window.electron.selectDirectory();
    if (selectedPath){
      console.log(selectedPath);
    }
  }

  function handleSetFileName(filename: string){
    const regex = /^[^\\/:*?"<>|]+$/;
    if (!regex.test(filename)) {
      console.log("Invalid file name");
      return ;
    }
    setOutputFileName(filename);
  }

  return (
    <>
      <article className="scanner">
        <section className="selection">
          {/* template select component */}
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
                onChange={(e) => onSelectFiles(e.target.files)}
              />
              <label htmlFor="file-input" className="file-label">
                Select Files
              </label>

              {/* @ts-expect-error */}
              <input id="folder-input" directory="" webkitdirectory="" type="file" />
              <label htmlFor="folder-input" className="file-label">
                Select Folder
              </label>
              {/* this damn here by the lazy developer */}
              {/* https://stackoverflow.com/questions/71444475/webkitdirectory-in-typescript-and-react */}
            </span>
          </div>
          <div className="field-card">
            <p className="field-name">Select Output Folder</p>
            <button className="file-label" onClick={handleSelectDirectory}>Select Folder</button>
          </div>
          <div className="field-card">
            <p>Output File Name</p>
            <input type="text" onChange={(e) => {handleSetFileName(e.target.value)}} placeholder="Enter Your Project Name" value={outputFileName}/>
          </div>
          <div className="field-card top-space ">
            <span className="ghost"></span>
            <span className="button-group">
              <button className="icon-button cancel" onClick={() => onCancel()}>
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.4412 13.9L15.3412 16.8C15.5245 16.9833 15.7578 17.075 16.0412 17.075C16.3245 17.075 16.5578 16.9833 16.7412 16.8C16.9245 16.6167 17.0162 16.3833 17.0162 16.1C17.0162 15.8167 16.9245 15.5833 16.7412 15.4L13.8412 12.5L16.7412 9.6C16.9245 9.41667 17.0162 9.18333 17.0162 8.9C17.0162 8.61667 16.9245 8.38333 16.7412 8.2C16.5578 8.01667 16.3245 7.925 16.0412 7.925C15.7578 7.925 15.5245 8.01667 15.3412 8.2L12.4412 11.1L9.54116 8.2C9.35783 8.01667 9.1245 7.925 8.84116 7.925C8.55783 7.925 8.3245 8.01667 8.14116 8.2C7.95783 8.38333 7.86616 8.61667 7.86616 8.9C7.86616 9.18333 7.95783 9.41667 8.14116 9.6L11.0412 12.5L8.14116 15.4C7.95783 15.5833 7.86616 15.8167 7.86616 16.1C7.86616 16.3833 7.95783 16.6167 8.14116 16.8C8.3245 16.9833 8.55783 17.075 8.84116 17.075C9.1245 17.075 9.35783 16.9833 9.54116 16.8L12.4412 13.9ZM12.4412 22.5C11.0578 22.5 9.75783 22.2373 8.54116 21.712C7.3245 21.1867 6.26616 20.4743 5.36616 19.575C4.46616 18.6757 3.75383 17.6173 3.22916 16.4C2.7045 15.1827 2.44183 13.8827 2.44116 12.5C2.4405 11.1173 2.70316 9.81733 3.22916 8.6C3.75516 7.38267 4.4675 6.32433 5.36616 5.425C6.26483 4.52567 7.32316 3.81333 8.54116 3.288C9.75916 2.76267 11.0592 2.5 12.4412 2.5C13.8232 2.5 15.1232 2.76267 16.3412 3.288C17.5592 3.81333 18.6175 4.52567 19.5162 5.425C20.4148 6.32433 21.1275 7.38267 21.6542 8.6C22.1808 9.81733 22.4432 11.1173 22.4412 12.5C22.4392 13.8827 22.1765 15.1827 21.6532 16.4C21.1298 17.6173 20.4175 18.6757 19.5162 19.575C18.6148 20.4743 17.5565 21.187 16.3412 21.713C15.1258 22.239 13.8258 22.5013 12.4412 22.5ZM12.4412 20.5C14.6745 20.5 16.5662 19.725 18.1162 18.175C19.6662 16.625 20.4412 14.7333 20.4412 12.5C20.4412 10.2667 19.6662 8.375 18.1162 6.825C16.5662 5.275 14.6745 4.5 12.4412 4.5C10.2078 4.5 8.31616 5.275 6.76616 6.825C5.21616 8.375 4.44116 10.2667 4.44116 12.5C4.44116 14.7333 5.21616 16.625 6.76616 18.175C8.31616 19.725 10.2078 20.5 12.4412 20.5Z" fill="#FF3B30"/></svg>
                <p>Cancel</p>
              </button>
              <button className="icon-button submit" onClick={() => onProcessFiles()}>
                <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.74216 3.21155C2.53512 5.30075 2.43432 7.39912 2.44016 9.49855C2.44016 12.2995 2.61016 14.4955 2.74216 15.7875C4.65411 14.9191 6.52144 13.9555 8.33716 12.9005C10.1581 11.8558 11.9256 10.7207 13.6332 9.49955C11.926 8.27702 10.1588 7.1406 8.33816 6.09455C6.52204 5.0409 4.65437 4.0787 2.74216 3.21155ZM0.837162 2.26355C0.864168 2.03649 0.943772 1.81886 1.06964 1.62796C1.19552 1.43706 1.36419 1.27816 1.56225 1.16389C1.7603 1.04962 1.98229 0.983127 2.21056 0.9697C2.43882 0.956273 2.66707 0.996282 2.87716 1.08655C3.93916 1.54055 6.31916 2.61955 9.33916 4.36255C12.3602 6.10655 14.4852 7.62955 15.4082 8.32055C16.1962 8.91155 16.1982 10.0835 15.4092 10.6765C14.4952 11.3635 12.3962 12.8665 9.33916 14.6325C6.27916 16.3985 3.92716 17.4645 2.87516 17.9125C1.96916 18.2995 0.955162 17.7125 0.837162 16.7355C0.699162 15.5935 0.441162 13.0005 0.441162 9.49855C0.441162 5.99855 0.698162 3.40655 0.837162 2.26355Z" fill="white"/></svg>
                <p>Start Processing</p>
              </button>
            </span>
          </div>
        </section>

        <section className="progress">
          <h2 className="title">Progress</h2>
          <div className='file-list'>
            {inputFiles.map((file) => (
              <div key={file.name} className='small-wide-card'>
                <p className="file-name">{file.name}</p>
                {
                  file.status === 'selected' ? 
                    <button> X </button> : 
                    <span className={`file-status ${file.status}`} />
                }
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
