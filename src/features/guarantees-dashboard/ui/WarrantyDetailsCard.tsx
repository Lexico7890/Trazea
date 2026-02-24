import { Button } from "@/shared/ui/button";
import { User, Wrench, MapPin, Activity, Image, Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/ui/hover-card";
import type { GuaranteeGroup } from "../model/types";
import type { Guarantee } from "@/entities/guarantees";
import { StatusBadge } from "./StatusBadge";

interface WarrantyDetailsCardProps {
  group: GuaranteeGroup;
  onSendWarranty?: (warranty: Guarantee[]) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  isStatusUpdatePending?: boolean;
}

export function WarrantyDetailsCard({
  group,
  onSendWarranty,
  onUpdateStatus,
  isStatusUpdatePending,
}: WarrantyDetailsCardProps) {
  const isPendingStatus = group.estado === 'Pendiente' || group.estado === 'pendiente';
  const isUnsentStatus = group.estado === 'Sin enviar' || group.estado === 'sin enviar';

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Info className="h-4 w-4" />
          <span className="sr-only">Detalles</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
          <h4 className="font-semibold text-sm">Detalle de Garantía</h4>
          <StatusBadge status={group.estado} />
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Motivo Falla
              </p>
              <p className="font-medium line-clamp-2" title={group.motivo_falla}>
                {group.motivo_falla || 'No especificado'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Kilometraje
              </p>
              <p className="font-medium">{group.kilometraje || 0} km</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Solicitante
              </p>
              <p className="font-medium truncate">{group.solicitante || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Wrench className="h-3 w-3" /> Taller Origen
              </p>
              <p className="font-medium truncate">{group.taller_origen || '-'}</p>
            </div>
          </div>

          {group.url_evidencia_foto && (
            <div className="pt-2 border-t">
              <a
                href={group.url_evidencia_foto}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Image className="h-3 w-3" /> Ver evidencia fotográfica
              </a>
            </div>
          )}

          {isUnsentStatus && (
            <div className="pt-2 border-t">
              <Button
                size="sm"
                className="w-full text-xs h-8 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => {
                  if (onSendWarranty) {
                    onSendWarranty(group.items);
                  }
                }}
              >
                Enviar Garantia
              </Button>
            </div>
          )}

          {isPendingStatus && (
            <div className="pt-2 border-t">
              <Button
                size="sm"
                className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (onUpdateStatus && group.items[0]?.id_garantia) {
                    onUpdateStatus(group.items[0].id_garantia, 'Aprobada');
                  }
                }}
                disabled={isStatusUpdatePending}
              >
                {isStatusUpdatePending ? 'Actualizando...' : 'Gestionado'}
              </Button>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
