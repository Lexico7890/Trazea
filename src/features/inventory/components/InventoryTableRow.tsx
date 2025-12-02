import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { InventoryItem } from "../types";
import { useRequestsStore } from "@/features/requests/store/useRequestsStore";
import { toast } from "sonner";

interface InventoryTableRowProps {
    item: InventoryItem;
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
    const { addItem } = useRequestsStore();
    // Determine if stock is low
    const isLowStock = item.stock_actual < item.cantidad_minima;

    const handleRequest = () => {
        addItem({
            id: item.id_repuesto,
            nombre: item.nombre,
            referencia: item.referencia,
        });
        toast.success(`"${item.nombre}" agregado a solicitudes`);
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{item.referencia}</TableCell>
            <TableCell>{item.nombre}</TableCell>
            <TableCell>
                <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
                    {item.stock_actual}
                </span>
            </TableCell>
            <TableCell>{item.cantidad_minima}</TableCell>
            <TableCell>
                <Badge variant="outline" className="capitalize" style={{ backgroundColor: item.estado_stock === 'BAJO' ? 'orange' : item.estado_stock === 'CRITICO' ? 'red' : 'green' }}>
                    {item.estado_stock || 'N/A'}
                </Badge>
            </TableCell>
            <TableCell>
                {item.descontinuado ? (
                    <Badge variant="destructive">Descontinuado</Badge>
                ) : (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Activo
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={item.descontinuado}
                    onClick={handleRequest}
                    title="Solicitar Repuesto"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Solicitar
                </Button>
            </TableCell>
        </TableRow>
    );
}
