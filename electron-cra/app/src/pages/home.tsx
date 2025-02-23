import "./home.css";
import TemplateSelect from "../component/template-select";
import { useState } from "react";
// import { ipcRenderer } from 'electron';
import Template from "../types/template";

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
  // const [inputFilePaths, setInputFilePaths] = useState<File[]>();
  // const [outputDir, setOutputDir] = useState<string>("");
  // const [outputFileName, setOutputFileName] = useState<string>("");
//   const [message, setMessage] = useState<string | null>(null);

  // useEffect(() => {
  //     ipcRenderer.on('process-update', (_, fileName) => {
  //         setMessage(`File Processed: ${fileName}`);
  //         console.log(message)
  //     });

  //     return () => {
  //       ipcRenderer.removeAllListeners('process-update');
  //     };
  //   }, []);

  // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!event.target.files) return;

  //     const uploadedFiles = Array.from(event.target.files);
  //     const tempPaths = await Promise.all(
  //       uploadedFiles.map(async (file) => {
  //         // Simulate moving the file to a temp location
  //         const tempPath = await saveToTempFolder(file); // Your logic here
  //         return tempPath;
  //       })
  //     );

  //     setInputFilePaths(tempPaths);
  //   };
  // async function onProcessFiles() {
  //     try {
  //         const result = await window.electron.processFiles();
  //         console.log("Message sent, received in main process:", result);
  //     } catch (error) {
  //         console.error("Error in sending message:", error);
  //     }
  // }

  // const [files, setFiles] = useState<any>([]);
  // console.log(files);

  // const handleFileUpload = (newFiles: any[]) => {
  //     setFiles([...newFiles]);
  // }

  async function onSelectFiles(files: FileList | null) {
    if (files) {
      const fileDatas = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }));

      console.log(fileDatas)

    //   try {
    //     const result = await window.electron.copyFiles(list of string of field "url " from fileDatas);
    //     console.log("Message sent, received in main process:", result);
    //   } catch (error) {
    //     console.error("Error in sending message:", error);
    //   }
    }
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
          <div className="wide-card">
            <p>Select Files or Folder</p>
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
          <div className="wide-card">
            <p>Select Output Folder</p>
            {/* @ts-expect-error */}
            <input id="folder-input" directory="" webkitdirectory="" type="file" />
            <label htmlFor="folder-input" className="file-label">
              Select Folder
            </label>
          </div>
          <div className="wide-card">
            <p>Output File Name</p>
          </div>
        </section>

        <section className="progress">
          <h2 className="title">Progress</h2>
          {/* <button className="submit" onClick={() => onProcessFiles()}>Process</button> */}
        </section>
      </article>
    </>
  );
}
