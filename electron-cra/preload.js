const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    copyFiles: (files) => ipcRenderer.invoke("copy-files", files),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    processFiles: (config) => ipcRenderer.invoke("process-files", config),
    onProcessUpdate: (callback) => {
      ipcRenderer.on('process-update', (_, data) => callback(data));
    },
    removeProcessUpdateListener: () => {
        ipcRenderer.removeAllListeners('process-update');
    },
    getBackUps: () => ipcRenderer.invoke('get-backups'),
    openFolder: (dirPath) => ipcRenderer.invoke('open-folder', dirPath),
    openFileInFolder: (dirPath) => ipcRenderer.invoke('open-file-in-folder', dirPath),
    getTemplates: () => ipcRenderer.invoke('get-templates'),
    uploadTemplate: (file) => ipcRenderer.invoke("upload-template", file),
    processTemplate: () => ipcRenderer.invoke("process-template"),
    viewFinalTemplate: (name, field) => ipcRenderer.invoke('view-final-template', name, field),
    saveTemplate: (name, acceptedField) => ipcRenderer.invoke('save-template', name, acceptedField),
    putTemplateName: (id, name) => ipcRenderer.invoke('put-template-name', id, name),
    putTemplateField: (id, field) => ipcRenderer.invoke('put-template-field', id, field),
});
