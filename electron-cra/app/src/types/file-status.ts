export default interface FileStatus{
    name: string;
    status: "selected" | "pending" | "running" | "success" | "error";
}