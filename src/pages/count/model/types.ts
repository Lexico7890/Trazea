export interface FileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}