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
    getTemplates: () => ipcRenderer.invoke('get-templates'),
    uploadTemplate: (file) => ipcRenderer.invoke("upload-template", file),
    processTemplate: () => ipcRenderer.invoke("process-template"),
    saveTemplate: (name, acceptedField) => ipcRenderer.invoke('save-template', name, acceptedField),
    putTemplateName: (id, name) => ipcRenderer.invoke('put-template-name', id, name),
    putTemplateField: (id, field) => ipcRenderer.invoke('put-template-field', id, field),
});
