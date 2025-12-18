import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { InventoryItem } from "../types";
import { InventoryEditSheet } from "./InventoryEditSheet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface InventoryTableRowProps {
    item: InventoryItem;
}

export function InventoryTableRow({ item }: InventoryTableRowProps) {
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const queryClient = useQueryClient();

    // Determine if stock is low
    const isLowStock = item.stock_actual < item.cantidad_minima;

    // Determine if item is "New"
    const isNew = item.nuevo_hasta && new Date() < new Date(item.nuevo_hasta);

    const handleSaveSuccess = () => {
        // Invalidate the inventory query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
    };

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    {item.referencia}
                    {isNew && (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm leading-none">
                            NEW
                        </span>
                    )}
                </div>
            </TableCell>
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
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditSheetOpen(true)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>

                <InventoryEditSheet
                    item={item}
                    open={isEditSheetOpen}
                    onOpenChange={setIsEditSheetOpen}
                    onSaveSuccess={handleSaveSuccess}
                />
            </TableCell>
        </TableRow>
    );
}
