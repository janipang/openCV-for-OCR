export interface ElectronAPI {
    copyFiles: (paths: string[]) => Promise<string>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }