import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { bulkUploadRepuestos } from "../services";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BulkUploadProps {
    onSuccess: () => void;
}

export function BulkUpload({ onSuccess }: BulkUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: number; errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            if (
                selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "application/vnd.ms-excel" ||
                selectedFile.name.endsWith(".xlsx") ||
                selectedFile.name.endsWith(".xls")
            ) {
                setFile(selectedFile);
                setUploadResult(null);
            } else {
                toast.error("Por favor, sube un archivo Excel válido (.xlsx o .xls)");
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await bulkUploadRepuestos(file);
            setUploadResult(result);
            if (result.success > 0) {
                toast.success(`${result.success} repuestos cargados exitosamente`);
                onSuccess();
            }
            if (result.errors.length > 0) {
                toast.warning(`${result.errors.length} filas tuvieron errores`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al procesar el archivo");
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setUploadResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset();
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Carga Masiva
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Carga Masiva de Repuestos</DialogTitle>
                    <DialogDescription>
                        Sube un archivo Excel con los repuestos. El archivo debe contener las columnas: referencia, nombre, tipo, cantidad_minima, etc.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    {file && (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                                {isUploading ? "Cargando..." : "Procesar"}
                            </Button>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="space-y-2">
                            <Alert variant={uploadResult.errors.length === 0 ? "default" : "destructive"}>
                                {uploadResult.errors.length === 0 ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertTitle>Resultado de la carga</AlertTitle>
                                <AlertDescription>
                                    Se cargaron {uploadResult.success} registros correctamente.
                                    {uploadResult.errors.length > 0 && ` Fallaron ${uploadResult.errors.length} registros.`}
                                </AlertDescription>
                            </Alert>

                            {uploadResult.errors.length > 0 && (
                                <div className="max-h-[150px] overflow-y-auto text-xs border rounded p-2 bg-muted">
                                    <p className="font-semibold mb-1">Errores:</p>
                                    {uploadResult.errors.map((err, idx) => (
                                        <div key={idx} className="mb-1 text-destructive">
                                            Fila {JSON.stringify(err.row)}: {err.error?.message || "Error desconocido"}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
