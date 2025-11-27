import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { InventoryItem } from "../types";

interface InventoryTableRowProps {
    item: InventoryItem;
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
    // Determine if stock is low
    const isLowStock = item.stock_actual < item.cantidad_minima;

    return (
        <TableRow>
            <TableCell className="font-medium">{item.referencia}</TableCell>
            <TableCell>{item.nombre}</TableCell>
            <TableCell>
                <Badge variant="outline" className="capitalize">
                    {item.tipo || 'N/A'}
                </Badge>
            </TableCell>
            <TableCell>
                <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
                    {item.stock_actual}
                </span>
            </TableCell>
            <TableCell>{item.cantidad_minima}</TableCell>
            <TableCell>
                {item.descontinuado ? (
                    <Badge variant="destructive">Descontinuado</Badge>
                ) : (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Activo
                    </Badge>
                )}
            </TableCell>
        </TableRow>
    );
}
