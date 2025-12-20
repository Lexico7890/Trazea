import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, User, Wrench, MapPin, FileText, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WarrantyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warranty: Record<string, unknown> | null;
}

export default function WarrantyDetailsModal({
  open,
  onOpenChange,
  warranty,
}: WarrantyDetailsModalProps) {
  if (!warranty) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "aprobado":
        return "bg-green-100 text-green-800 border-green-200";
      case "rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-8">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-2xl font-bold">
                  Detalles de Garantía
                </DialogTitle>
                <Badge className={`text-sm shadow-sm ${getStatusColor(warranty.estado)}`}>
                  {warranty.estado || "Pendiente"}
                </Badge>
              </div>
              <DialogDescription className="mt-1">
                Información detallada del reporte técnico.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column: General Info */}
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" /> INFORMACIÓN DEL REPUESTO
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Repuesto</p>
                  <p className="font-semibold">{warranty.nombre_repuesto}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Referencia</p>
                  <p className="font-mono text-sm">{warranty.referencia_repuesto}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" /> UBICACIÓN Y FECHA
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Taller</p>
                    <p className="text-sm font-medium">{warranty.taller_origen}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Fecha Reporte</p>
                    <p className="text-sm font-medium">
                      {warranty.fecha_reporte
                        ? format(new Date(warranty.fecha_reporte), "PPP p", { locale: es })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <User className="h-4 w-4" /> RESPONSABLES
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Reportado por</p>
                    <p className="text-sm font-medium">{warranty.reportado_por}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">Técnico Responsable</p>
                    <p className="text-sm font-medium">{warranty.tecnico_responsable || "No asignado"}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Evidence & Details */}
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" /> MOTIVO DE FALLA
              </h3>
              <div className="bg-card p-4 rounded-lg border min-h-[100px]">
                <p className="text-sm italic text-foreground/80 leading-relaxed">
                  "{warranty.motivo_falla}"
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                <ExternalLink className="h-4 w-4" /> EVIDENCIA FOTOGRÁFICA
              </h3>
              <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted group">
                {warranty.url_evidencia_foto ? (
                  <>
                    <img
                      src={warranty.url_evidencia_foto}
                      alt="Evidencia de garantía"
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <a
                      href={warranty.url_evidencia_foto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="text-white text-xs font-semibold flex items-center gap-1">
                        Ver imagen completa <ExternalLink className="h-3 w-3" />
                      </span>
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-xs">Sin evidencia fotográfica</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {warranty.comentarios_resolucion && (
          <>
            <Separator className="my-2" />
            <section className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">RESUMEN DE RESOLUCIÓN</h3>
              <div className="bg-primary/5 p-4 rounded-lg border-primary/10 border italic text-sm">
                {warranty.comentarios_resolucion}
              </div>
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
