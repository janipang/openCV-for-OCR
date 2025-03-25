export interface ElectronAPI {
    copyFiles: (files: ElectronFile[]) => Promise<boolean>;
    selectDirectory: () => Promise<string | null>;
    processFiles: (config: ProcessConfig) => Promise<boolean>;
    onProcessUpdate: (callback: (data: string) => void) => void;
    removeProcessUpdateListener: () => void;
    getTemplates: () => Promise<Template[]>;
    uploadTemplate: (file: ElectronFile) => Promise<string | null>;
    processTemplate: () => Promise<string | null>;
    saveTemplate: (name: string, acceptedField: number[]) => Promise<boolean>;
    putTemplateName: (id: string, name: string) => Promise<boolean>;
    putTemplateField: (id:  string, field: number[]) => Promise<boolean>;
  }
  interface ProcessConfig {
    output_dir: string;
    output_file_name: string;
    selected_field: number[];
  }

  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }