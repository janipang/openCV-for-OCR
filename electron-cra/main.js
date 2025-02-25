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

async function runPythonApp() {
  try {
    // console.log("Upgrading pip...");
    // await runCommand("python", ["-m", "pip", "install", "--upgrade", "pip"], folders.base);

    // console.log("Upgraded pip. Installing dependencies...");
    // await runCommand("python", ["-m", "pip", "install", "-r", "require ments.txt"], folders.base);

    console.log("Dependencies installed. Running app.py...");
    // await runCommand("python", [path.join(folders.base, "app.py")], folders.base);
    await runCommand("python", ['-u', path.join(folders.base, "communication.py")], folders.base);

    console.log("✅ Processing completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("copy-files", async (_event, files) => {
    const rawFilesFolder = folders.raw;
    console.log("Copying files to ", rawFilesFolder, "...");

    // create raw-file folder
    if (fs.existsSync(rawFilesFolder)) {
      fs.rmSync(rawFilesFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(rawFilesFolder, { recursive: true });

    //save files
    console.log(files)
    Array.from(files).forEach((file) => {
      fs.writeFile(path.join(rawFilesFolder, file.name), Buffer.from(file.data), (err) => {
        if (err) {
          console.error("File saving error:", err);
        } else {
          console.log("File saved to:", file);
        }
      });
    });
    console.log("/ Copied Success.\n");

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
      "communication.py",
    ];
    pythonFileNames.forEach((fileName) => {
      const filePath = path.join(__dirname, "resources", fileName);
      fs.copyFileSync(filePath, path.join(folders.base, fileName));
    });
    console.log("/ Copied Success.\n");

    // create output folder
    console.log("Creating working directories...");
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
    console.log("/ Created Success.\n");

    runPythonApp({ base: folders.base });
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
