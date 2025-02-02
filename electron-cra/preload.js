const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (filepaths) => {ipcRenderer.invoke("copy-files", filepaths)},
    processFiles: () => {ipcRenderer.invoke("process-files"); console.log("preload received");},
});
