import FileStatus from "../types/file-status";

export function filter_duplicate_filesname_new(
    new_files: FileStatus[],
) {
    let duplicate_files: FileStatus[] = [];
    let approved_files: FileStatus[] = [];
    let seenFiles = new Set<string>();

    new_files.forEach((file) => {
        (seenFiles.has(file.name) ? duplicate_files : approved_files).push(file);
        seenFiles.add(file.name)
    });

    return {
        approved_files,
        duplicate: duplicate_files.length > 0,
        duplicate_files,
    };
}

export function filter_duplicate_filesname_new_old(
    new_files: FileStatus[],
    old_files: FileStatus[]
) {
    let duplicate_files: FileStatus[] = [];
    let approved_files: FileStatus[] = [];

    new_files.forEach((new_file) => {
        if (old_files.some((old) => old.name === new_file.name)) {
            duplicate_files.push(new_file);
        } else {
            approved_files.push(new_file);
        }
    });

    return {
        approved_files,
        duplicate: duplicate_files.length > 0,
        duplicate_files,
    };
}