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
  // const [outputFileName, setOutputFileName] = useState<string>("");
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
  }, [message, setInputFiles]);

  useEffect(() => {
    console.log("inputFiles", inputFiles)
  }, [inputFiles]);

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

  async function onProcessFiles() {
      try {
          const result = await window.electron.processFiles(
            {
              output_dir: "C:/Users/pangj/Downloads/rabbit_noi",
              output_file_name: "rabbit_data",
              selected_field: [3,4,5,6,7,8,9]
            });
          console.log("Message sent, received in main process:", result);
      } catch (error) {
          console.error("Error in sending message:", error);
      }
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
          <div className="wide-card">
            <p className="field-name">Select Output Folder</p>
             {/* @ts-expect-error */}
            <input id="folder-input" directory="" webkitdirectory="" type="file" />
            <label htmlFor="folder-input" className="file-label">
              Select Folder
            </label>
          </div>
          <div className="wide-card">
            <p>Output File Name</p>
          </div>
          <div className="wide-card">
            <button className="submit" onClick={() => onProcessFiles()}>Process</button>
          </div>
        </section>

        <section className="progress">
          <h2 className="title">Progress</h2>
          <button className="submit" onClick={() => onProcessFiles()}>Process</button>
          <div className='file-list'>
            {inputFiles.map((file) => (
              <div key={file.name} className='small-wide-card'>
                <p className="file-name">{file.name}</p>
                <span className={`file-status ${file.status}`} />
              </div>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
