import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Camera, Upload, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface InventoryItemMock {
  id: number;
  name: string;
  quantity: number;
}

export function InventoryImageUploadModal({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "loading" | "results">(
    "initial"
  );
  const [items, setItems] = useState<InventoryItemMock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDragError, setIsDragError] = useState(false);

  const isMobile = useIsMobile();
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
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startLoadingProcess();
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

      if (!file.type.startsWith('image/')) {
        toast.error("Por favor sube un archivo de imagen válido.");
        return;
      }

      // Manually set the file input files
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        startLoadingProcess();
      }
    }
  };

  const startLoadingProcess = () => {
    setStep("loading");
    setTimeout(() => {
      // Generate dummy data
      const dummyItems = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Repuesto Detectado ${i + 1}`,
        quantity: Math.floor(Math.random() * 50) + 1,
      }));
      setItems(dummyItems);
      setStep("results");
    }, 5000);
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
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
          step === "results" ? "sm:max-w-2xl max-h-[80vh] overflow-y-auto" : ""
        }`}
      >
        <DialogHeader>
          <DialogTitle>Cargar Inventario por Imagen</DialogTitle>
          <DialogDescription>
            {step === "initial" &&
              "Selecciona una imagen o toma una foto para procesar el inventario."}
            {step === "loading" && "Procesando imagen..."}
            {step === "results" &&
              "Verifica los items detectados y selecciona los que deseas guardar."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
          {step === "initial" && (
            <div className="flex flex-col gap-4 w-full">
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

          {step === "results" && (
            <div className="w-full space-y-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <TableRow
                          key={item.id}
                          className={
                            isSelected
                              ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                              : ""
                          }
                          onClick={() => toggleSelection(item.id)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(item.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
