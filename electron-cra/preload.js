const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (files) => ipcRenderer.invoke("copy-files", files),
    processFiles: () => ipcRenderer.invoke("process-files"),
    onProcessUpdate: (callback) => {
      ipcRenderer.on('process-update', (_, data) => callback(data));
    },
    removeProcessUpdateListener: () => {
        ipcRenderer.removeAllListeners('process-update');
    },
});
