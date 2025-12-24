import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Camera,
  Upload,
  Loader2,
  Save,
  RefreshCcw,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

interface ScannedItem {
  id_repuesto: string;
  nombre_detectado: string;
  nombre_real: string;
  referencia: string;
  cantidad: number;
  porcentage: number;
}

export function InventoryImageUploadModal({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "loading" | "results" | "error">(
    "initial"
  );
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDragError, setIsDragError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const { currentLocation } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep("initial");
      setItems([]);
      setSelectedIds(new Set());
      setIsDragging(false);
      setIsDragError(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor sube un archivo de imagen válido.");
      return;
    }
    setSelectedFile(file);
    startLoadingProcess(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if dragged item is an image
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file' && !item.type.startsWith('image/')) {
        setIsDragError(true);
        setIsDragging(true);
        return;
      }
    }

    setIsDragError(false);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragError(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragError(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const startLoadingProcess = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    if (!file) return;

    if (!currentLocation) {
      toast.error(
        "Ubicación no seleccionada. Por favor, selecciona una ubicación antes de subir una imagen."
      );
      return;
    }

    setStep("loading");
    const bucketName = "repuestos"; // Asegúrate de que este bucket exista en Supabase

    try {
      // ---------------------------------------------------------
      // PASO 1: Subir imagen al Storage de Supabase
      // ---------------------------------------------------------
      console.log("Subiendo imagen al Storage...");

      // Creamos un nombre único
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `temp/${currentLocation.id_localizacion}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Error subiendo imagen: ${uploadError.message}`);
      }

      console.log("Imagen subida. Ruta:", uploadData.path);

      // ---------------------------------------------------------
      // PASO 2: Invocar la Edge Function con la RUTA
      // ---------------------------------------------------------
      console.log("Invocando Edge Function...");

      const { data, error } = await supabase.functions.invoke(
        "escanear-repuestos",
        {
          body: {
            imagePath: uploadData.path,
            bucketName: bucketName,
          },
        }
      );

      if (error) {
        // Intentar leer el mensaje de error JSON si existe
        let msg = error.message;
        try {
          msg = JSON.parse(error.message).error || msg;
        } catch (e) {}
        throw new Error(msg);
      }

      // ---------------------------------------------------------
      // PASO 3: Procesar respuesta
      // ---------------------------------------------------------
      if (data && Array.isArray(data.match)) {
        setItems(data.match);
        setStep("results");
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (err: any) {
      console.error("Error en el proceso:", err);
      const message = err.message || "Ocurrió un error inesperado";
      setErrorMessage(message);
      toast.error(message);
      setStep("error");
    }
  };

  const toggleSelection = (itemId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    setIsOpen(false);
    toast.success("Repuestos cargados al inventario correctamente");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-md transition-all duration-300 ${
          step === "results"
            ? "sm:max-w-2xl max-h-[90vh] flex flex-col"
            : ""
        }`}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Cargar Inventario por Imagen</DialogTitle>
            <Popover>
              <PopoverTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <div className="space-y-4">
                  <p className="font-medium">
                    Leyenda de Nivel de Confianza
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>
                      <strong>Verde (96%-100%):</strong> Alta confianza. El
                      repuesto fue identificado con alta seguridad.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span>
                      <strong>Amarillo (61%-95%):</strong> Confianza media.
                      Verifica que el nombre real sea correcto.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>
                      <strong>Rojo (&lt;61%):</strong> Confianza baja. Es muy
                      probable que el repuesto no sea el correcto. Se recomienda
                      ingresarlo manualmente si no estás seguro.
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <DialogDescription>
            {step === "initial" &&
              "Selecciona una imagen o toma una foto para procesar el inventario."}
            {step === "loading" && "Procesando imagen..."}
            {step === "results" &&
              "Verifica los items detectados y selecciona los que deseas guardar."}
            {step === "error" &&
              "Ocurrió un error al procesar la imagen. Puedes intentarlo de nuevo."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 min-h-[200px]",
            step === "results" && "flex-1 min-h-0"
          )}
        >
          {step === "initial" && (
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {/* Hidden Inputs */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />

              {isMobile ? (
                 <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Cargar Imagen
                    </Button>

                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Tomar Foto
                    </Button>
                 </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors w-full",
                    isDragError
                      ? "border-destructive bg-destructive/10"
                      : isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={cn(
                      "p-4 rounded-full bg-background border",
                      isDragError ? "border-destructive text-destructive" : "border-muted-foreground/20 text-muted-foreground"
                    )}>
                       <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-lg font-medium">
                         Arrastra y suelta una imagen aquí
                       </p>
                       <p className="text-sm text-muted-foreground">
                         o haz clic para seleccionar
                       </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, WEBP
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-center">
                Analizando imagen...
                <br />
                Por favor espere.
              </p>
            </div>
          )}

          {step === "error" && selectedFile && (
            <div className="flex flex-col items-center gap-4 w-full">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Vista previa de la imagen seleccionada"
                className="max-h-48 rounded-md border"
              />
              <p className="text-destructive text-center font-semibold">
                No se pudo procesar la imagen.
              </p>
              {errorMessage && (
                <div className="w-full p-2 text-xs text-center bg-destructive/10 text-destructive rounded-md">
                  <p>{errorMessage}</p>
                </div>
              )}
              <Button
                onClick={() => startLoadingProcess()}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </div>
          )}

          {step === "results" && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="flex-1 border rounded-md overflow-y-auto overflow-x-auto">
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead className="min-w-[200px]">
                        Nombre Detectado
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        Nombre Real
                      </TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead className="text-right min-w-[100px]">
                        Confianza
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const isSelected = selectedIds.has(item.id_repuesto);

                      const getConfidenceColorClass = (percentage: number) => {
                        if (percentage <= 0.6)
                          return "bg-red-500/10 dark:bg-red-900/20";
                        if (percentage <= 0.95)
                          return "bg-yellow-500/10 dark:bg-yellow-900/20";
                        return "bg-green-500/10 dark:bg-green-900/20";
                      };

                      const getConfidenceDotClass = (percentage: number) => {
                        if (percentage <= 0.6) return "bg-red-500";
                        if (percentage <= 0.95) return "bg-yellow-500";
                        return "bg-green-500";
                      };

                      return (
                        <TableRow
                          key={item.id_repuesto}
                          className={cn(
                            "cursor-pointer",
                            isSelected
                              ? "bg-green-200 hover:bg-green-300/80 dark:bg-green-800/50 dark:hover:bg-green-800/60"
                              : getConfidenceColorClass(item.porcentage)
                          )}
                          onClick={() => toggleSelection(item.id_repuesto)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleSelection(item.id_repuesto)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{item.nombre_detectado}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.nombre_detectado}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{item.nombre_real}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.nombre_real}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  getConfidenceDotClass(item.porcentage)
                                )}
                              />
                              <span>
                                {`${(item.porcentage * 100).toFixed(0)}%`}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </TooltipProvider>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar ({selectedIds.size})
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
