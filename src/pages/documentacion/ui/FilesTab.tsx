import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { supabase } from "@/shared/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { FileUp, File, AlertCircle, FileText, Download, Trash2 } from "lucide-react";

const ALLOWED_TYPES: Record<string, { label: string, accepts: string, ext: string }> = {
  pdf: { label: "Documento (.pdf)", accepts: "application/pdf", ext: ".pdf" },
  png: { label: "Imagen PNG (.png)", accepts: "image/png", ext: ".png" },
  jpg: { label: "Imagen JPEG (.jpg, .jpeg)", accepts: "image/jpeg", ext: ".jpg,.jpeg" },
  xlsx: { label: "Excel (.xlsx)", accepts: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: ".xlsx" },
};

export function FilesTab() {
  const [fileType, setFileType] = useState<string>("pdf");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from('minca_documents').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      
      if (error) throw error;
      setDocuments(data?.filter(d => d.name !== '.emptyFolderPlaceholder') || []);
    } catch (error) {
      console.error("Error fetching docs:", error);
      toast.error("Alerta: El bucket 'minca_documents' no existe o no tiene permisos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const config = ALLOWED_TYPES[fileType];
      const fileNameStr = file.name.toLowerCase();
      const validExts = config.ext.split(',');

      if (!validExts.some(ext => fileNameStr.endsWith(ext))) {
        toast.error(`Extensión inválida. Por favor sube un archivo con terminación ${config.ext}`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setSelectedFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const timestamp = new Date().getTime();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filePath = `${timestamp}_${safeName}`;

      const { error } = await supabase.storage
        .from('minca_documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      toast.success("Documento cargado exitosamente");
      clearFile();
      fetchDocuments(); 
    } catch (error: any) {
      console.error(error);
      toast.error(`Fallo la carga: The bucket might not exist! Crea el bucket 'minca_documents' primero en Supabase.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este documento permanentemente?")) return;
    try {
      const { error } = await supabase.storage.from('minca_documents').remove([fileName]);
      if (error) throw error;
      toast.success("Documento eliminado");
      fetchDocuments();
    } catch (e) {
      toast.error("Error eliminando documento");
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('minca_documents').getPublicUrl(fileName);
    window.open(data.publicUrl, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-zinc-800 bg-zinc-950/80 mt-2">
        <CardHeader>
          <CardTitle className="text-[#2ecc71] flex items-center gap-2 text-xl drop-shadow-[0_0_8px_rgba(46,204,113,0.3)]">
            <FileUp className="w-6 h-6"/> Gestor de Carga
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Escoge el formato especifico antes de buscar tu archivo, el sistema rechazará otras extensiones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-bold">1. Formato de Extensión</Label>
              <Select value={fileType} onValueChange={(val) => { setFileType(val); clearFile(); }}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 h-12 text-md">
                  <SelectValue placeholder="Seleccione el formato" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALLOWED_TYPES).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>{conf.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-300 font-bold">2. Seleccionar Archivo</Label>
              <div className="flex gap-2">
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept={ALLOWED_TYPES[fileType].accepts}
                  onChange={handleFileChange}
                  className="bg-zinc-900 border-zinc-700 text-zinc-300 file:bg-zinc-800 file:text-zinc-300 file:px-4 file:mr-4 file:rounded file:border-0 cursor-pointer w-full h-12 flex items-center justify-center p-2"
                />
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-[#2ecc71]/40 bg-[#2ecc71]/10 mt-6 shadow-[0_0_15px_rgba(46,204,113,0.15)]">
              <div className="flex items-center gap-3 truncate pr-4">
                <div className="p-2 bg-[#2ecc71]/20 rounded-lg">
                  <File className="w-6 h-6 text-[#2ecc71] shrink-0" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-white truncate">{selectedFile.name}</span>
                  <span className="text-xs text-[#2ecc71] font-medium">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) Lista para enviar</span>
                </div>
              </div>
              <Button 
                onClick={handleUpload} 
                className="shrink-0 animate-pulse bg-[#2ecc71] text-black hover:bg-[#27ae60]"
                disabled={isUploading}
              >
                {isUploading ? "Cargando..." : "Subir Archivo"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-950/80">
        <CardHeader>
          <CardTitle className="text-white text-xl">Mi Repositorio Minca</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 animate-pulse flex flex-col items-center">
              <FileText className="w-10 h-10 mb-4 opacity-50" />
              Conectando con Supabase Storage...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-700/50 rounded-xl bg-zinc-900/40">
              <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">Aún no hay archivos importados.</p>
              <p className="text-sm text-zinc-500 mt-1">Si este panel tira una Toast de Error recurrente, asegúrate de crear el bucket "minca_documents" como PUBLIC en el Storage de Supabase.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800 transition-colors shadow-sm">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2.5 bg-zinc-800/80 rounded-lg shrink-0 border border-zinc-700/50">
                      <FileText className="w-6 h-6 text-zinc-300" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-zinc-100 truncate" title={doc.name}>{doc.name}</span>
                      <span className="text-xs text-zinc-500">{new Date(doc.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white" onClick={() => getPublicUrl(doc.name)}>
                      <Download className="w-4 h-4 text-[#2ecc71]" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-red-950 hover:text-red-400 hover:border-red-900" onClick={() => handleDelete(doc.name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
