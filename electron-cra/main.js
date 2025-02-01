const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');


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

    ipcMain.handle("copy-files", async (_event, files) => {
        console.log("hello: ", files);
        const processFolder = path.join(app.getPath("userData"), "user-datas", "raw-files");
        if (!fs.existsSync(processFolder)) fs.mkdirSync(processFolder);

        files.forEach((file) => {
            const fileName = path.basename(file);
            fs.copyFileSync(file, path.join(processFolder, fileName));
        });

        return true; // Return the processing folder path
    });

    ipcMain.handle("process-files", async (_event) => {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(__dirname, "resources", "app.py"); // Change if stored elsewhere

            const pythonProcess = spawn("python", [pythonScript, processFolder]);

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
        app.quit();
    }
});