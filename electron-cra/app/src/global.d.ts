export interface ElectronAPI {
    copyFiles: (paths: string[]) => Promise<boolean>;
    processFiles: () => Promise<boolean>;
    // onProcessUpdate: (callback: (data: string) => void) => void;
    // removeProcessUpdateListener: () => void;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }