export interface ElectronAPI {
    copyFiles: (files: ElectronFile[]) => Promise<boolean>;
    selectDirectory: () => Promise<string | null>;
    processFiles: (config: ProcessConfig) => Promise<boolean>;
    uploadTemplate: (file: ElectronFile) => Promise<boolean>;
    onProcessUpdate: (callback: (data: string) => void) => void;
    removeProcessUpdateListener: () => void;
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