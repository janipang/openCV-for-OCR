export interface ElectronAPI {
    copyFiles: (files: ElectronFile[]) => Promise<boolean>;
    processFiles: () => Promise<boolean>;
    onProcessUpdate: (callback: (data: string) => void) => void;
    removeProcessUpdateListener: () => void;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }