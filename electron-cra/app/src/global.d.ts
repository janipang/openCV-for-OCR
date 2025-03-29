import BackUp from "./types/backup";
import Template from "./types/template";

export interface ElectronAPI {
    copyFiles: (files: ElectronFile[]) => Promise<boolean>;
    selectDirectory: () => Promise<string | null>;
    processFiles: (config: ProcessConfig) => Promise<boolean>;
    onProcessUpdate: (callback: (data: string) => void) => void;
    removeProcessUpdateListener: () => void;
    getBackUps: () => Promise<BackUp[]>;
    openFolder: (folderPath) => Promise<boolean>;
    getTemplates: () => Promise<Template[]>;
    uploadTemplate: (file: ElectronFile) => Promise<string | null>;
    processTemplate: () => Promise<string | null>;
    viewFinalTemplate: (name: string, field: number[]) => Promise<string | null>;
    saveTemplate: (name: string, acceptedField: number[]) => Promise<boolean>;
    putTemplateName: (id: string, name: string) => Promise<boolean>;
    putTemplateField: (id:  string, field: number[]) => Promise<boolean>;
  }
  interface ProcessConfig {
    output_dir: string;
    name: string;
    template: Template;
  }

  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }