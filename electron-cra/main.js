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
  backup: {
    base: path.join(PermDir, "backup"),
    list: path.join(PermDir, "backup", "list"),
  },
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
  const createFolderIfNotExist = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  };
  
  console.log("Checking Storage directories...");
  Object.values(perm_folders).forEach((folder) => {
    if (typeof folder === "object") {
      Object.values(folder).forEach(createFolderIfNotExist);
    } else {
      createFolderIfNotExist(folder);
    }
  });
  
  const templateDataFilePath = path.join(perm_folders.template.base, 'data.json');
  if (!fs.existsSync(templateDataFilePath)) {
    fs.writeFileSync(templateDataFilePath, '[]');
  }
  
  const backupDataFilePath = path.join(perm_folders.backup.base, 'data.json');
  if (!fs.existsSync(backupDataFilePath)) {
    fs.writeFileSync(backupDataFilePath, '[]');
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
    "png_converter.py",
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

async function runPngConverter(input_path, output_dir, page) {
  try {
    console.log("Running png_converter.py...");
    await runCommand("python", [
      "-u",
      path.join(folders.base, "png_converter.py"),
      input_path,
      output_dir,
      page
    ], folders.base);

    console.log("✅ Convert PDF to PNG Completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}



// API /////////////////////// API //////////////////////  API ////////////////// API ////////////////////////////////////////
// API /////////////////////// API //////////////////////  API ////////////////// API ////////////////////////////////////////

function getBackUpData() {
  const backUpsFilePath = path.join(perm_folders.backup.base, 'data.json');
  const stored_data = JSON.parse(fs.readFileSync(backUpsFilePath, 'utf8'));

  // send the full dir path
  stored_data.forEach((item) => {
    if (item.location) {
      item.location = path.join(perm_folders.backup.base, item.location);
    }
  });

  return stored_data;
}

function getRawBackUpData() {
  const backUpsFilePath = path.join(perm_folders.backup.base, 'data.json');
  const stored_data = JSON.parse(fs.readFileSync(backUpsFilePath, 'utf8'));
  return stored_data;
}

function postBackUpData(name, dirName, date, inputDir, outputPath, templateData, templateImagePath) {
  const backUps = getRawBackUpData();
  const backUpsFilePath = path.join(perm_folders.backup.base, 'data.json');
  console.log("Saving BackUp Data to ", perm_folders.backup.base, "...")
  
  function generateNewId() {
    if (backUps.length === 0) return 1; // ถ้าไม่มีข้อมูลให้เริ่มที่ 1

    const maxId = Math.max(...backUps.map(item => item.id)); // หาค่า id ที่สูงสุด
    return maxId + 1;
  }

  const id = generateNewId();
  const b_dirName = `${id}_${dirName}`;
  const b_listDir = path.join(perm_folders.backup.list, b_dirName);
  const b_templateDataPath = path.join(b_listDir, 'template.json');
  const b_templateImagePath = path.join(b_listDir, 'template.png');
  const b_inputDirPath = path.join(b_listDir, 'input');
  const b_resultPath = path.join(b_listDir, `${dirName}.xlsx`);
  // create new storage space
  if (fs.existsSync(b_listDir)) {
    fs.rmSync(b_listDir, { recursive: true, force: true });
  };
  fs.mkdirSync(b_listDir, { recursive: true });
  fs.mkdirSync(b_inputDirPath);
  // write template data & template file
  fs.writeFileSync(b_templateDataPath, JSON.stringify(templateData, null, 2));
  fs.copyFileSync(templateImagePath, b_templateImagePath);
  // copy output file
  fs.copyFileSync(outputPath, b_resultPath);
  // copy input files
  if (fs.existsSync(inputDir)) {
    fs.readdirSync(inputDir).forEach(file => {
      const inputFilePath = path.join(inputDir, file);
      const inputFileName = path.basename(inputFilePath);
      const b_filePath = path.join(b_inputDirPath, inputFileName);
      fs.copyFileSync(inputFilePath, b_filePath);
    });
  }

  console.log("Updating backup/data.json...")
  // update backup data >> data.json
  const newBackUp = {
    id: id,
    name: name,
    date: date,
    location: b_dirName}
    backUps.push(newBackUp);
  fs.writeFileSync(backUpsFilePath, JSON.stringify(backUps, null, 2));
  console.log("/ Saved BackUp Data Success")
  return true;
}

function getRawTemplateData() {
  const templatesFilePath = path.join(perm_folders.template.base, 'data.json');
  const stored_data = JSON.parse(fs.readFileSync(templatesFilePath, 'utf8'));
  return stored_data;
}

function getTemplateData() {
  const templatesFilePath = path.join(perm_folders.template.base, 'data.json');
  const stored_data = JSON.parse(fs.readFileSync(templatesFilePath, 'utf8'));

  // send the full imge path
  stored_data.forEach((item) => {
    if (item.image) {
      item.image = path.join(perm_folders.template.image, item.image);
    }
  });
 
  return stored_data;
}

function getRawTemplateDataById(id) {
  const templatesFilePath = path.join(perm_folders.template.base, 'data.json');
  const stored_data = JSON.parse(fs.readFileSync(templatesFilePath, 'utf8'));
  stored_data.forEach((item) => {
    if (item.id == id) {
      return item
    }
  });
  return null
}

function postTemplateData(name, image, field){
  const templates = getRawTemplateData();
  const templatesFilePath = path.join(perm_folders.template.base, "data.json");
  
  function generateNewId() {
    if (templates.length === 0) return 1; // ถ้าไม่มีข้อมูลให้เริ่มที่ 1

    const maxId = Math.max(...templates.map(item => item.id)); // หาค่า id ที่สูงสุด
    return maxId + 1;
  }

  const id = generateNewId();
  const imageName = id.toString()+ '.png';
  const imagePath = path.join(perm_folders.template.image, imageName);
  fs.writeFileSync(imagePath, image);
  const newTemplate = {
    id: id,
    name: name,
    image: imageName,
    accepted_field: field}
  templates.push(newTemplate);
  fs.writeFileSync(templatesFilePath, JSON.stringify(templates, null, 2));
  return true;
}

function putTemplateName(id, newName) {
  const templates = getRawTemplateData();
  const templatesFilePath = path.join(perm_folders.template.base, "data.json");
  
  const updatedTemplates = templates.map(item => {
    if (item.id === id) {
      return { ...item, name: newName };
    }
    return item;
  });

  fs.writeFileSync(templatesFilePath, JSON.stringify(updatedTemplates, null, 2));
  return true;
}

function putTemplateField(id, newField) {
  const templates = getRawTemplateData();
  const templatesFilePath = path.join(perm_folders.template.base, "data.json");
  
  const updatedTemplates = templates.map(item => {
    if (item.id === id) {
      return { ...item, accepted_field: newField };
    }
    return item;
  });

  fs.writeFileSync(templatesFilePath, JSON.stringify(updatedTemplates, null, 2));
  return true;
}

function deleteTemplateataById(id) {
  const templatesFilePath = path.join(perm_folders.template.base, "data.json");
  const templates = getRawTemplateData();
  const updatedTemplates = templates.filter(item => item.id !== id);
  if (updatedTemplates.length === templates.length) {
    console.log(`❌ ไม่พบ template ที่มี id: ${id}`);
    return;
  }
  fs.writeFileSync(templatesFilePath, JSON.stringify(updatedTemplates, null, 2));
  console.log(`✅ ลบ template ที่มี id: ${id} สำเร็จ`);
  return true;
}






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
    function sanitizeFileName(str) {
      return str
        .replace(/ /g, "_")  // Replace spaces with underscores
        .replace(/\//g, "-") // Replace slashes with hyphens
        .replace(/[\\:*?"<>|]/g, ""); // Remove invalid filename characters
    }
    console.log("running with config: ", config);
    const start_time = Date();
    const { output_dir, name, template } = config;
    const output_file_name = sanitizeFileName(name);
    const templateImagePath = path.join(perm_folders.template.image, template.id + '.png');
    const outputFilePath = path.join(output_dir, output_file_name + '.xlsx')
    await runPythonProcess(folders.raw , output_dir, output_file_name, template.accepted_field);
    postBackUpData(name, output_file_name, start_time, folders.raw, outputFilePath, template, templateImagePath);
    return true;
  });

  // handle get backups
  ipcMain.handle("get-backups", async () => {
    console.log("/ Fetched BackUps Data Success\n");
    return getBackUpData();
  })

  // handle get templates
  ipcMain.handle("get-templates", async () => {
    console.log("/ Fetched Templates Data Success\n");
    return getTemplateData();
  });

  // handle upload template
  ipcMain.handle("upload-template", async (_event, file) => {
    const plainTemplateFolder = folders.template.plain;
    const plainTemplateFilePath = path.join(plainTemplateFolder, file.name);
    const plainPngTemplateFolder = folders.template.plainpng;
    const plainPngTemplateFilePath = path.join(plainPngTemplateFolder, file.name.split('.')[0] + '.png');

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
        console.error("Saving Plain File error: ", err);
      } else {
        console.log("/ Plain Template File saved:", file.name, '\n');
      }
    });
    
    // convert plain template to png for preview
    await runPngConverter(plainTemplateFilePath, plainPngTemplateFolder, 1);
    
    // return plain template image to user
    const imageData = fs.readFileSync(plainPngTemplateFilePath).toString("base64");
    if (imageData) {
      return imageData;
    }
    else{
      return null;
    }
  });

  ipcMain.handle("process-template", async (_event) => {
    const plainTemplateFolder = folders.template.plain;
    const boundedTemplateFolder = folders.template.bounded;
    const fileName = fs.readdirSync(plainTemplateFolder)[0];
    console.log("fileName: ", fileName);
    const plainTemplateFilePath = path.join(plainTemplateFolder, fileName);
    const boundedTemplateFilePath = path.join(boundedTemplateFolder, fileName.split('.')[0] + '.png');
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
  
  // handle put template name
  ipcMain.handle("put-template-name", async (_event, id, name) => {
    const result = putTemplateName(id, name);
    return result
  });
  
  // handle put template field
  ipcMain.handle("put-template-field", async (_event, id, field) => {
    return putTemplateField(id, field);
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
