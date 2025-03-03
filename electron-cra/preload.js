const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (files) => ipcRenderer.invoke("copy-files", files),
    processFiles: (config) => ipcRenderer.invoke("process-files", config),
    uploadTemplate: (file) => ipcRenderer.invoke("upload-template", file),
    onProcessUpdate: (callback) => {
      ipcRenderer.on('process-update', (_, data) => callback(data));
    },
    removeProcessUpdateListener: () => {
        ipcRenderer.removeAllListeners('process-update');
    },
});
