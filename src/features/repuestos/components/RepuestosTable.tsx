import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { Repuesto } from "../types";

interface RepuestosTableProps {
    items: Repuesto[];
    orderBy: keyof Repuesto;
    direction: 'asc' | 'desc';
    onSort: (column: keyof Repuesto) => void;
    onEdit: (repuesto: Repuesto) => void;
    onDelete: (id: string) => void;
}

const SortIcon = ({
    column,
    orderBy,
    direction
}: {
    column: keyof Repuesto;
    orderBy: keyof Repuesto;
    direction: 'asc' | 'desc'
}) => {
    if (orderBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 ${direction === 'asc' ? 'text-primary' : 'text-primary rotate-180'}`} />;
};

export function RepuestosTable({
    items,
    orderBy,
    direction,
    onSort,
    onEdit,
    onDelete,
}: RepuestosTableProps) {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Referencia copiada al portapapeles");
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => onSort('referencia')}>
                            <div className="flex items-center">
                                Referencia
                                <SortIcon column="referencia" orderBy={orderBy} direction={direction} />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort('nombre')}>
                            <div className="flex items-center">
                                Nombre
                                <SortIcon column="nombre" orderBy={orderBy} direction={direction} />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort('tipo')}>
                            <div className="flex items-center">
                                Tipo
                                <SortIcon column="tipo" orderBy={orderBy} direction={direction} />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort('fecha_estimada')}>
                            <div className="flex items-center">
                                Fecha Estimada
                                <SortIcon column="fecha_estimada" orderBy={orderBy} direction={direction} />
                            </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort('descontinuado')}>
                            <div className="flex items-center">
                                Estado
                                <SortIcon column="descontinuado" orderBy={orderBy} direction={direction} />
                            </div>
                        </TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No se encontraron repuestos.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id_repuesto}>
                                <TableCell
                                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleCopy(item.referencia)}
                                    title="Click para copiar referencia"
                                >
                                    {item.referencia}
                                </TableCell>
                                <TableCell>{item.nombre}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{item.tipo}</Badge>
                                </TableCell>
                                <TableCell>
                                    {item.fecha_estimada
                                        ? format(new Date(item.fecha_estimada), "PPP", { locale: es })
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.descontinuado ? "destructive" : "default"}>
                                        {item.descontinuado ? "Descontinuado" : "Activo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item.id_repuesto)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
