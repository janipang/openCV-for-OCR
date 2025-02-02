export interface ElectronAPI {
    copyFiles: (paths: string[]) => Promise<boolean>;
    processFiles: () => Promise<boolean>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }