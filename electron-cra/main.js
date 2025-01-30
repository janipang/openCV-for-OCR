const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

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

// file:///D:/assets/index-BtVi8doP.js