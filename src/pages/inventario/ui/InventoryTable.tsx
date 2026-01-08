import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { InventoryItem } from "@/entities/inventario";
import { InventoryTableRow } from "./InventoryTableRow";

interface InventoryTableProps {
    items: InventoryItem[];
    orderBy: string;
    direction: 'asc' | 'desc';
    onSort: (column: string) => void;
}

export function InventoryTable({ items, orderBy, direction, onSort }: InventoryTableProps) {
    const getSortIcon = (column: string) => {
        if (orderBy !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return direction === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-lg">No se encontraron repuestos</p>
                <p className="text-muted-foreground text-sm mt-2">
                    Intenta ajustar los filtros de búsqueda
                </p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">
                        <Button
                            variant="ghost"
                            onClick={() => onSort('referencia')}
                            className="h-8 px-2 lg:px-3"
                        >
                            Referencia
                            {getSortIcon('referencia')}
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button
                            variant="ghost"
                            onClick={() => onSort('nombre')}
                            className="h-8 px-2 lg:px-3 "
                        >
                            Nombre
                            {getSortIcon('nombre')}
                        </Button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                        <Button
                            variant="ghost"
                            onClick={() => onSort('stock_actual')}
                            className="h-8 px-2 lg:px-3"
                        >
                            Stock Actual
                            {getSortIcon('stock_actual')}
                        </Button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                        <Button
                            variant="ghost"
                            onClick={() => onSort('cantidad_minima')}
                            className="h-8 px-2 lg:px-3"
                        >
                            Cant. Mínima
                            {getSortIcon('cantidad_minima')}
                        </Button>
                    </TableHead>
                    <TableHead className="w-[150px]">
                        <Button
                            variant="ghost"
                            onClick={() => onSort('estado_stock')}
                            className="h-8 px-2 lg:px-3"
                        >
                            Estado Stock
                            {getSortIcon('estado_stock')}
                        </Button>
                    </TableHead>

                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <InventoryTableRow key={item.id_inventario} item={item} />
                ))}
            </TableBody>
        </Table>
    );
}
