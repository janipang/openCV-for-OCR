const { app, BrowserWindow, ipcMain, dialog, screen  } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { spawn, exec } = require("child_process");
const readline = require("readline");
// const pdfPoppler = require('pdf-poppler');

let mainWindow;

const baseTempDir = path.join(
  app.getPath("temp"),
  "invoice-data-gathering-app"
);

const PermDir = path.join(
  app.getPath("userData"),
  "userData"
);

// Define temp folders
const folders = {
  base: baseTempDir,
  raw: path.join(baseTempDir, "src", "raw-file"),
  output: path.join(baseTempDir, "src", "output"),
  temp: path.join(baseTempDir, "src", "temp"),
  template: {
    plain: path.join(baseTempDir, "src", "template", "plain"),
    plainpng: path.join(baseTempDir, "src", "template", "plainpng"),
    bounded: path.join(baseTempDir, "src", "template", "bounded"),
  },
};

// Define perm folders
const perm_folders = {
  base: PermDir,
  template: {
    base: path.join(PermDir, "template"),
    image: path.join(PermDir, "template", "image"),
  },
  process: path.join(PermDir, "process"),
};

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    title: "Electron + Create React App", 
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,  // Recommended for security
      nodeIntegration: false,  // Disable node integration
      enableRemoteModule: false, // Disable remote module
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, "app/dist/index.html"),
    protocol: "file:",
  });
  mainWindow.loadURL(startUrl);
}

function checkAndCreatePermStorage() {
  const recreateFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
    fs.mkdirSync(folderPath, { recursive: true });
  };
  
  console.log("Checking Storage directories...");
  Object.values(perm_folders).forEach((folder) => {
    if (typeof folder === "object") {
      Object.values(folder).forEach(recreateFolder);
    } else {
      recreateFolder(folder);
    }
  });
  
  const dataFilePath = path.join(perm_folders.template.base, 'data.json');

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, '[]');
  }
  console.log("/ Confirm Storage Exsisted at "  + perm_folders.base + "\n");
}

function createFileStructure() {
  const recreateFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
    fs.mkdirSync(folderPath, { recursive: true });
  };
  
  console.log("Creating working directories...");
  Object.values(folders).forEach((folder) => {
    if (typeof folder === "object") {
      Object.values(folder).forEach(recreateFolder);
    } else {
      recreateFolder(folder);
    }
  });
  console.log("/ Created Structure Success.\n");

  // copy resources file
  console.log("Copying Resources files...");
  const pythonFileNames = [
    "bounding_box.py",
    "document.py",
    "process.py",
    "services.py",
    "template.py",
    "communication.py",
    "requirements.txt",
  ];
  pythonFileNames.forEach((fileName) => {
    const filePath = path.join(__dirname, "resources", fileName);
    fs.copyFileSync(filePath, path.join(folders.base, fileName));
  });
  console.log("/ Copied Resource Files Success.\n");
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { cwd, shell: true });
    const rl = readline.createInterface({
      input: process.stdout,
      output: process.stderr,
      terminal: false,
    });

    // process.stdout.on("data", (data) => {
    //   const message = data.toString().trim();
    //   const parts = message.split(':');
    //   if (parts[0] == 'process-update') {
    //     console.log(message)
    //     mainWindow.webContents.send("process-update", (parts[1] + ":" +  parts[2]).toString());
    //   }
    // });

    // use readline instead directly read from stdout prevent buffering and receiving multiple lines
    rl.on("line", (line) => {
      const message = line.trim();
      console.log(message); // Debugging
      const parts = message.split(":");
      if (parts[0] === "process-update" && parts.length >= 3) {
        mainWindow.webContents.send("process-update", `${parts[1]}:${parts.slice(2).join(":")}`);
      }
    });

    process.stderr.on("data", (data) => console.error(`${command} error: ${data}`));

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed with exit code ${code}`));
      }
    });
  });
}

async function runPythonProcess(input_dir, output_dir, output_file_name, selected_field) {
  try {
    // console.log("Upgrading pip...");
    // await runCommand("python", ["-m", "pip", "install", "--upgrade", "pip"], folders.base);

    // console.log("Upgraded pip. Installing dependencies...");
    // await runCommand("python", ["-m", "pip", "install", "-r", "requirements.txt"], folders.base);

    console.log("Running process.py...");
    await runCommand("python", [
      "-u",
      path.join(folders.base, "process.py"),
      input_dir,
      output_dir,
      output_file_name,
      JSON.stringify(selected_field) // Convert array to JSON string
    ], folders.base);

    console.log("✅ Processing completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function runPythonTemplate(input_path, output_path) {
  try {
    console.log("Running template.py...");
    await runCommand("python", [
      "-u",
      path.join(folders.base, "template.py"),
      input_path,
      output_path,
    ], folders.base);

    console.log("✅ Scanning Template Field Completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}



// API /////////////////////// API //////////////////////  API ////////////////// API ////////////////////////////////////////
// API /////////////////////// API //////////////////////  API ////////////////// API ////////////////////////////////////////

function getTemplateData(){
  const templatesFilePath = path.join(perm_folders.template.base, 'data.json');
  if (templatesFilePath) {
    return JSON.parse(fs.readFileSync(templatesFilePath, 'utf8'));
  }
  return [];
}

function postTemplateData(name, image, field){
  const templates = getTemplateData();
  
  function generateNewId() {
    if (templates.length === 0) return 1; // ถ้าไม่มีข้อมูลให้เริ่มที่ 1

    const maxId = Math.max(...templates.map(item => item.id)); // หาค่า id ที่สูงสุด
    return maxId + 1;
  }

  const id = generateNewId();
  const imagePath = path.join(perm_folders.template.image, id.toString(), '.png');
  fs.writeFileSync(path.perm_folders.template.image, image);
  const newTemplate = {
    id: string,
    name: name,
    image: imagePath,
    accepted_field: field}
  templates.push(newTemplate);
  fs.writeFileSync(perm_folders.template.data, JSON.stringify(templates));
  return true;
}

// function deleteTemplateData(name){
//   const templates = getTemplateData();
//   templates.find(index, 1);
//   fs.writeFileSync(perm_folders.template.data, JSON.stringify(templates));
// }







// RUN APP /////////////////////// RUN APP //////////////////////  RUN APP ////////////////// RUN APP ////////////////////////////////////////
// RUN APP /////////////////////// RUN APP //////////////////////  RUN APP ////////////////// RUN APP ////////////////////////////////////////

app.whenReady().then(() => {
  createWindow();
  createFileStructure();
  checkAndCreatePermStorage();

  // handle upload input file
  ipcMain.handle("copy-files", async (_event, files) => {
    const rawFilesFolder = folders.raw;
    console.log("Saving files to ", rawFilesFolder, "...");

    //save files
    Array.from(files).forEach((file) => {
      fs.writeFile(path.join(rawFilesFolder, file.name), Buffer.from(file.data), (err) => {
        if (err) {
          console.error("File saving error:", err);
        } else {
          console.log("File saved:", file.name);
        }
      });
    });
    console.log("/ Saved Files Success.\n");

    return true;
  });
  
  // handle select output directory
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
  
    return result.filePaths[0].replace(/\\/g, "/") || null; // Return the selected directory path
  });

  // handle run process on files
  ipcMain.handle("process-files", async (_event, config) => {
    console.log("running with config: ", config);
    const { output_dir, output_file_name, selected_field } = config;
    runPythonProcess(folders.raw , output_dir, output_file_name, selected_field);
    return true;
  });

  // handle fetch templates
  ipcMain.handle("fetch-templates", async () => {
    console.log("/ Fetching Templates.\n");
    return getTemplateData();
  });

  // handle upload template
  ipcMain.handle("upload-template", async (_event, file) => {
    const plainTemplateFolder = folders.template.plain;
    const plainTemplateFilePath = path.join(plainTemplateFolder, file.name);

    // delete existing plain template
    if (fs.existsSync(plainTemplateFolder)) {
      fs.readdirSync(plainTemplateFolder).forEach(file => {
        const filePath = path.join(plainTemplateFolder, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      });
    }
    console.log("Saving Plain Template file to ", plainTemplateFolder, "...");

    // write plain template file to temp folder
    fs.writeFile(plainTemplateFilePath, Buffer.from(file.data), (err) => {
      if (err) {
        console.error("File saving error:", err);
      } else {
        console.log("/ Plain Template File saved:", file.name, '\n');
      }
    });
    
    // convert plain template to png for preview
    // pdfPoppler.convert(plainTemplateFilePath, {format: 'png', out_dir: plainPngTemplateFolder, out_prefix: file.name.split[0], page: 1})
    // .then(() => {
    //   console.log('Conversion complete');
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });
    
    // // return plain template image to user
    // const imageData = fs.readFileSync(plainPngTemplateFilePath).toString("base64");
    // if (imageData) {
    //   return imageData;
    // }
    // else{
    //   return null;
    // }
    return null;
  });

  ipcMain.handle("process-template", async (_event) => {
    const plainTemplateFolder = folders.template.plain;
    const boundedTemplateFolder = folders.template.bounded;
    const fileName = fs.readdirSync(plainTemplateFolder)[0];
    console.log("fileName: ", fileName);
    const plainTemplateFilePath = path.join(plainTemplateFolder, fileName);
    const boundedTemplateFilePath = path.join(boundedTemplateFolder, fileName.split('.')[0] + '.png');
    console.log("plainTemplateFilePath: ", plainTemplateFilePath);
    console.log("boundedTemplateFilePath: ", boundedTemplateFilePath);
    // delete existing bounded template
    console.log("Deleting Old template...");
    if (fs.existsSync(boundedTemplateFolder)) {
      fs.readdirSync(boundedTemplateFolder).forEach(file => {
        const filePath = path.join(boundedTemplateFolder, file);
        // ตรวจสอบว่าเป็นไฟล์หรือไม่
        if (fs.statSync(filePath).isFile()) {
          fs.rmSync(filePath);
        }
      });
    }
    
    // run python and save bounding-box image to bounded template folder
    await runPythonTemplate(plainTemplateFilePath, boundedTemplateFolder);
    console.log("/ Boxed Template Saved to " , boundedTemplateFilePath, "Success.\n");

    let targetFile = fs.readdirSync(boundedTemplateFolder)[0];
    let targetFilePath = path.join(boundedTemplateFolder, targetFile);

    // return bounded template image to user
    const imageData = fs.readFileSync(targetFilePath).toString("base64");
    if (imageData) {
      return imageData;
    }
    else{
      return null;
    }
  });

  ipcMain.handle("save-template", async (_event, name, field) => {
    const boundedTemplateFolder = folders.template.bounded;
    const fileName = fs.readdirSync(boundedTemplateFolder)[0];
    const boundedTemplateFilePath = path.join(boundedTemplateFolder, fileName);

    const image = fs.readFileSync(boundedTemplateFilePath);
    postTemplateData(name, image, field);
    console.log("/ Saved Template to ", perm_folders.template, "Success.\n");
    return true;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    const appTempFolder = folders.base;
    if (fs.existsSync(appTempFolder)) {
      fs.rmSync(appTempFolder, { recursive: true, force: true });
    }
    app.quit();
  }
});
