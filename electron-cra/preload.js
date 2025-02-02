const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (filepaths) => {ipcRenderer.invoke("copy-files", filepaths); console.log("preload received");},
    processFiles: () => ipcRenderer.invoke("process-files"),
});
