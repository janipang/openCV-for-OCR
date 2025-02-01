const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (files) => ipcRenderer.invoke("copy-files", files),
});

contextBridge.exposeInMainWorld("electron", {
    processFiles: (processFolder) => ipcRenderer.invoke("process-files", processFolder),
});
