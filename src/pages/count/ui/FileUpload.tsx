import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import type { FileUploadProps } from '../model/types';

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange([...files, ...acceptedFiles]);
  }, [files, onFilesChange]);

  const removeFile = (fileToRemove: File) => {
    onFilesChange(files.filter(file => file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        {isDragActive ? (
          <p className="mt-4 text-primary">Suelta los archivos aquí...</p>
        ) : (
          <p className="mt-4 text-muted-foreground">
            Arrastra y suelta tus archivos de Excel aquí, o haz clic para seleccionarlos.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold">Archivos Cargados:</h4>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ningún archivo cargado.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <button onClick={() => removeFile(file)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="font-semibold">Formato del Excel:</h4>
        <p className="text-sm text-muted-foreground">
          Asegúrate de que tu archivo de Excel tenga las siguientes columnas:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
          <li><strong>REF.</strong> (Referencia del repuesto)</li>
          <li><strong>CANT.</strong> (Cantidad contada)</li>
        </ul>
      </div>
    </div>
  );
}
