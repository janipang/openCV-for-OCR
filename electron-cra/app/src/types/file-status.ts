export default interface FileStatus{
    name: string;
    data: number[];
    status: "selected" | "pending" | "running" | "success" | "error";
}