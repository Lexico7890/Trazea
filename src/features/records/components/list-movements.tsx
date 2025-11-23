import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useSearchMovements } from "../queries";
import { Loader2 } from "lucide-react";

export default function ListMovements() {
    const { data, isLoading, isError, error } = useSearchMovements();

    if (isLoading) {
        return (
            <div className="bg-card p-4 flex justify-center items-center border rounded-lg h-full w-full">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Cargando movimientos...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-card p-4 flex justify-center items-center border rounded-lg h-full w-full">
                <div className="text-center">
                    <p className="text-destructive font-semibold">Error al cargar los movimientos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-card p-4 flex justify-center items-center border rounded-lg h-full w-full">
                <p className="text-muted-foreground">No hay movimientos técnicos registrados</p>
            </div>
        );
    }

    return (
        <div className="bg-card p-4 flex justify-center items-start border rounded-lg h-full w-full">
            <Table>
                <TableCaption>Lista de movimientos técnicos recientes</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((movement: any) => (
                        <TableRow key={movement.id}>
                            <TableCell className="font-medium">
                                {typeof movement.id === 'string' && movement.id.startsWith('temp-')
                                    ? <span className="text-muted-foreground italic">Guardando...</span>
                                    : movement.id
                                }
                            </TableCell>
                            <TableCell>
                                {movement.fecha
                                    ? new Date(movement.fecha).toLocaleDateString('es-ES')
                                    : '-'
                                }
                            </TableCell>
                            <TableCell>{movement.tipo_concepto || '-'}</TableCell>
                            <TableCell className="text-right">{movement.cantidad || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}