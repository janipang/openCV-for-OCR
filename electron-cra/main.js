const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { spawn, exec } = require("child_process");

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
};

function createWindow() {
  let win = new BrowserWindow({
    title: "Electron + Create React App",
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      enableRemoteModule: false,
      contextIsolation: true,
    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, "app/dist/index.html"),
    protocol: "file:",
  });
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("copy-files", async (_event, filepaths) => {
    const rawFilesFolder = folders.raw;
    console.log("Copying files from to ", rawFilesFolder, "...");

    // create raw-file folder
    if (fs.existsSync(rawFilesFolder)) {
      fs.rmSync(rawFilesFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(rawFilesFolder, { recursive: true });

    filepaths.forEach((filepath) => {
      const fileName = path.basename(filepath);
      fs.copyFileSync(filepath, path.join(rawFilesFolder, fileName));
    });

    return true;
  });

  ipcMain.handle("process-files", async (_event) => {

    // add resources file
    console.log("Copying Resources files...");
    const pythonFileNames = [
      "app.py",
      "data_collector.py",
      "header_scanner.py",
      "table_scanner.py",
      "custom_service.py",
      "requirements.txt",
    ];
    pythonFileNames.forEach((fileName) => {
      const filePath = path.join(__dirname, "resources", fileName);
      fs.copyFileSync(filePath, path.join(folders.base, fileName));
    });

    // create output folder
    const outputFolder = folders.output;
    if (fs.existsSync(outputFolder)) {
      fs.rmSync(outputFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(outputFolder, { recursive: true });

    // create temp folder
    const tempFolder = folders.temp;
    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(tempFolder, { recursive: true });

    // pip install dependencies
    console.log("Installing Dependencies...");
    const requirementsFile = path.join(folders.base, "requirements.txt");
    const installDeps = spawn("pip", ["install", "-r", requirementsFile], {
      shell: true,
    });

    installDeps.stdout.on("data", (data) => {
      console.log(`pip install: ${data}`);
    });

    installDeps.stderr.on("data", (data) => {
      console.error(`pip install error: ${data}`);
    });

    installDeps.on("close", (code) => {
      if (code === 0) {
        console.log("Dependencies installed. Running app.py...");

        // run python app file
        process_status = new Promise((resolve, reject) => {
          const pythonScript = path.join(folders.base, "app.py");
          const pythonProcess = spawn("python", [pythonScript, folders.base]);

          pythonProcess.stdout.on("data", (data) => {
            console.log(`Python Output: ${data}`);
          });

          pythonProcess.stderr.on("data", (data) => {
            console.error(`Python Error: ${data}`);
          });

          pythonProcess.on("close", (code) => {
            if (code === 0) {
              resolve("Processing completed");
            } else {
              reject(new Error("Processing failed"));
            }
          });
        });
        return process_status;
      } else {
        console.error("Failed to install dependencies.");
        return false;
      }
    });
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
