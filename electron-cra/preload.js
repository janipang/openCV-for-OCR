const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (filepaths) => ipcRenderer.invoke("copy-files", filepaths),
    processFiles: () => ipcRenderer.invoke("process-files"),
    // onProcessUpdate: (callback) => {
    //   ipcRenderer.on('process-update', (_, data) => callback(data));
    // },
    // removeProcessUpdateListener: () => {
    //     ipcRenderer.removeAllListeners('process-update');
    // },
});
