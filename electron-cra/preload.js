const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (files) => {ipcRenderer.invoke("copy-files", files); console.log("preload received");},
    processFiles: () => ipcRenderer.invoke("process-files"),
});
