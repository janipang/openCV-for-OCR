export interface ElectronAPI {
    copyFiles: (paths: string[]) => Promise<boolean>;
    ProcessFiles: () => Promise<boolean>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }