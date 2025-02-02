const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const baseTempDir = path.join(app.getPath("temp"), "invoice-data-gathering-app");

// Define folders
const folders = {
    base: baseTempDir,
    raw: path.join(baseTempDir, "src", "raw-file"),
    output: path.join(baseTempDir, "src", "output"),
    temp: path.join(baseTempDir, "src", "temp")
};

function createWindow() {
    let win = new BrowserWindow({
        title: 'Electron + Create React App',
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
            contextIsolation: true,
        }
    });

    const startUrl = url.format({
        pathname: path.join(__dirname, 'app/dist/index.html'),
        protocol: 'file:'
    })
    console.log(startUrl);
    win.loadURL(startUrl);
}


app.whenReady().then(() => {
    createWindow();

    ipcMain.handle("copy-files", async (_event, filepaths) => {

        const inputFilesFolder = folders.raw
        console.log(inputFilesFolder);

        if (fs.existsSync(inputFilesFolder)) {
            fs.rmSync(inputFilesFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(inputFilesFolder, { recursive: true });

        filepaths.forEach((filepath) => {
            const fileName = path.basename(filepath);
            fs.copyFileSync(filepath, path.join(inputFilesFolder, fileName));
        });

        return true;
    });

    ipcMain.handle("process-files", async (_event) => {
        console.log("Processing files");

        const pythonFileNames = ["app.py", "data_collector.py", "header_scanner.py", "table_scanner.py"];
        pythonFileNames.forEach((fileName) => {
            const filePath = path.join(__dirname, "resources", fileName);
            fs.copyFileSync(filePath, path.join(folders.base, fileName));
        });

        const outputFolder = folders.output
        if (fs.existsSync(outputFolder)) {
            fs.rmSync(outputFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(outputFolder, { recursive: true });
        
        const tempFolder = folders.temp
        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, { recursive: true, force: true });
        }
        fs.mkdirSync(tempFolder, { recursive: true });

        return new Promise((resolve, reject) => {
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
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        const appTempFolder = folders.base
        if (fs.existsSync(appTempFolder)) {
            fs.rmSync(appTempFolder, { recursive: true, force: true });
        }
        app.quit();
    }
});