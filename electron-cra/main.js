const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

function createWindow() {
    let win = new BrowserWindow({
        title: 'Electron + Create React App',
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    const startUrl = url.format({
        pathname: path.join(__dirname, 'app/dist/index.html'),
        protocol: 'file:'
    })
console.log(startUrl);
    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

ipcMain.handle("copy-files", async (_event, files) => {
    const processFolder = path.join(app.getPath("userData"), "processing");
    if (!fs.existsSync(processFolder)) fs.mkdirSync(processFolder);

    files.forEach((file) => {
        const fileName = path.basename(file);
        fs.copyFileSync(file, path.join(processFolder, fileName));
    });

    return processFolder; // Return the processing folder path
});