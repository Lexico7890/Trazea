import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, UserCog, Package, MapPin, Hash, CheckCircle2, XCircle, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MovementDetailsModalProps {
  movement: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: any, className?: string }) => (
  <div className={cn("flex flex-col space-y-1 p-2 rounded-md border bg-muted/20", className)}>
    <div className="flex items-center text-xs text-muted-foreground gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <div className="text-sm font-medium pl-5 break-words">
      {value || "-"}
    </div>
  </div>
);

export function MovementDetailsModal({ movement, open, onOpenChange }: MovementDetailsModalProps) {
  if (!movement) return null;

  const hasImage = !!movement.repuesto_imagen;

  const handleOpenImage = () => {
    if (movement.repuesto_imagen) {
      window.open(movement.repuesto_imagen, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary" />
             Detalles del Movimiento
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
             {/* General Info */}
            <div className="md:col-span-2">
                <h3 className="text-sm font-semibold mb-2 text-primary/80">Información General</h3>
            </div>

            <DetailItem
                icon={Calendar}
                label="Fecha"
                value={movement.fecha ? format(new Date(movement.fecha), "dd/MM/yyyy HH:mm") : "-"}
            />
            <DetailItem
                icon={Hash}
                label="Orden"
                value={movement.numero_orden}
            />
             <DetailItem
                icon={FileText}
                label="Concepto"
                value={movement.concepto?.toUpperCase()}
            />
             <DetailItem
                icon={FileText}
                label="Tipo"
                value={movement.tipo?.toUpperCase()}
            />

             <div className="md:col-span-2 mt-2">
                <h3 className="text-sm font-semibold mb-2 text-primary/80">Detalles Técnicos</h3>
            </div>

            <DetailItem
                icon={Package}
                label="Repuesto"
                value={`${movement.repuesto_referencia || ''} - ${movement.repuesto_nombre || ''}`}
                className="md:col-span-2"
            />
             <DetailItem
                icon={Hash}
                label="Cantidad"
                value={movement.cantidad}
            />
            <DetailItem
                icon={MapPin}
                label="Ubicación"
                value={movement.ubicacion_nombre}
            />
             <DetailItem
                icon={UserCog}
                label="Técnico Asignado"
                value={movement.tecnico_asignado}
            />
             <DetailItem
                icon={User}
                label="Responsable"
                value={movement.usuario_responsable}
            />
             <DetailItem
                icon={movement.descargada ? CheckCircle2 : XCircle}
                label="Estado Descarga"
                value={movement.descargada ? "Descargada" : "Pendiente"}
                className={movement.descargada ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10"}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={handleOpenImage}
            disabled={!hasImage}
          >
            <ImageIcon className="h-4 w-4" />
            {hasImage ? "Ver Imagen Original" : "Sin Imagen"}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
