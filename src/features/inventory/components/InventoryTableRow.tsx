import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { InventoryItem } from "../types";
import { PopoverOptions } from "./PopoverOptions";

interface InventoryTableRowProps {
    item: InventoryItem;
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
    // Determine if stock is low
    const isLowStock = item.stock_actual < item.cantidad_minima;

    return (
        <TableRow>
            <TableCell className="font-medium">{item.referencia}</TableCell>
            <TableCell className="capitalize text-center text-nowrap overflow-hidden whitespace-nowrap max-w-[150px]">{item.nombre}</TableCell>
            <TableCell className="text-center">
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
                <PopoverOptions item={item} />
            </TableCell>
        </TableRow>
    );
}
