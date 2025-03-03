const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { spawn, exec } = require("child_process");

let mainWindow;

const baseTempDir = path.join(
  app.getPath("temp"),
  "invoice-data-gathering-app"
);

// Define folders
const folders = {
  base: baseTempDir,
  raw: path.join(baseTempDir, "src", "raw-file"),
  output: path.join(baseTempDir, "src", "output"),
  temp: path.join(baseTempDir, "src", "temp"),
  template: {
    plain: path.join(baseTempDir, "src", "template", "plain"),
    bounded: path.join(baseTempDir, "src", "template", "bounded"),
  },
};

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Electron + Create React App",
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: false,
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

    process.stdout.on("data", (data) => {
      const message = data.toString().trim();
      const parts = message.split(':');
      if (parts[0] == 'process-update') {
        console.log(message)
        mainWindow.webContents.send("process-update", (parts[1] + ":" +  parts[2]).toString());
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
    // await runCommand("python", ["-m", "pip", "install", "-r", "require ments.txt"], folders.base);

    console.log("Running process.py...");
    // await runCommand("python", [path.join(folders.base, "app.py")], folders.base);
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

async function runPythonTemplate() {
  try {
    console.log("Running template.py...");
    await runCommand("python", ['-u', path.join(folders.base, "template.py")], folders.base);

    console.log("✅ Processing completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  createFileStructure();

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

  // handle run process on files
  ipcMain.handle("process-files", async (_event, config) => {
    console.log("running with config: ", config);
    const { output_dir, output_file_name, selected_field } = config;
    runPythonProcess(folders.raw , output_dir, output_file_name, selected_field);
    return true;
  });

  // handle upload template
  ipcMain.handle("upload-template", async (_event, file) => {
    const plainTemplateFolder = folders.template.plain;
    console.log("Saving file to ", plainTemplateFolder, "...");

    //save file
    fs.writeFile(path.join(plainTemplateFolder, file.name), Buffer.from(file.data), (err) => {
      if (err) {
        console.error("File saving error:", err);
      } else {
        console.log("/ File saved:", file.name);
      }
    });
    runPythonTemplate();
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
