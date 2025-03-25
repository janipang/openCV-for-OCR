import FileStatus from "../types/file-status";

export function validateOutputFileName(name: string){
  const regex = /^[^\\/:*?"<>|.]+$/;
  if (!regex.test(name)) {
    return false;
  }
  return true;
}

export function validateInputFile(inputFiles: FileStatus[]){
  if (!inputFiles || inputFiles.length === 0) return false;
  return true;
}

export function validateOutputDir(dir: string){
  if (!dir) return false;
  return true;
}

export function validateTemplateName(name: string){
  const regex = /^[^<>^\\"]*$/;
  if (!regex.test(name)) {
    return false;
  }
  return true;
}
