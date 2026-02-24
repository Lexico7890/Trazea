import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import type { GuaranteeGroup } from "../model/types";
import { SparePartsPopover } from "./SparePartsPopover";
import { StatusBadge } from "./StatusBadge";
import { WarrantyDetailsCard } from "./WarrantyDetailsCard";
import type { Guarantee } from "@/entities/guarantees";

interface GuaranteesTableProps {
  groups: GuaranteeGroup[];
  hasActiveFilters: boolean;
  onSendWarranty?: (warranty: Guarantee[]) => void;
  onUpdateStatus?: (id: string, status: string) => void;
  isStatusUpdatePending?: boolean;
}

export function GuaranteesTable({
  groups,
  hasActiveFilters,
  onSendWarranty,
  onUpdateStatus,
  isStatusUpdatePending,
}: GuaranteesTableProps) {
  console.log("Rendering GuaranteesTable with groups:", groups);
  return (
    <div className="rounded-xl border bg-card shadow-lg overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold">Fecha</TableHead>
              <TableHead className="font-bold">Repuesto</TableHead>
              <TableHead className="font-bold">Orden</TableHead>
              <TableHead className="font-bold">Técnico</TableHead>
              <TableHead className="font-bold">Estado</TableHead>
              <TableHead className="font-bold text-center w-[100px]">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group: GuaranteeGroup) => (
              <TableRow
                key={group.orden}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium text-muted-foreground text-sm">
                  {group.fecha_reporte 
                    ? format(new Date(group.fecha_reporte), 'dd/MM/yyyy') 
                    : '-'}
                </TableCell>
                <TableCell>
                  <SparePartsPopover
                    items={group.items} 
                    repuestosCount={group.repuestosCount} 
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono bg-background">
                    {group.orden || 'S/N'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {(group.tecnico_responsable || group.reportado_por || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">
                      {group.tecnico_responsable || group.reportado_por || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={group.estado} />
                </TableCell>
                <TableCell className="text-center">
                  <WarrantyDetailsCard
                    group={group}
                    onSendWarranty={onSendWarranty}
                    onUpdateStatus={onUpdateStatus}
                    isStatusUpdatePending={isStatusUpdatePending}
                  />
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-muted-foreground">
                    {hasActiveFilters
                      ? "No se encontraron garantías con los filtros aplicados."
                      : "No hay garantías registradas."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
