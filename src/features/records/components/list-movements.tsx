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
import { ActionMenu } from "@/components/common/ActionMenu";
import { useRecordsStore, type MovementToEdit } from "../store/useRecordsStore";

export default function ListMovements() {
    const { data, isLoading, isError, error } = useSearchMovements();
    const { setMovementToEdit } = useRecordsStore();

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
                        <TableHead className="w-[100px]">Referencia</TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((movement: any) => (
                        <TableRow key={movement.id_movimientos_tecnicos || movement.id}>
                            <TableCell className="font-medium">
                                {typeof movement.id === 'string' && movement.id.startsWith('temp-')
                                    ? <span className="text-muted-foreground italic">Guardando...</span>
                                    : movement.repuesto_referencia
                                }
                            </TableCell>
                            <TableCell>{movement.numero_orden || '-'}</TableCell>
                            <TableCell>{movement.tecnico_asignado || '-'}</TableCell>
                            <TableCell>{movement.concepto || '-'}</TableCell>
                            <TableCell className="text-right">{movement.cantidad || '-'}</TableCell>
                            <TableCell>
                                <ActionMenu
                                    onEdit={() => setMovementToEdit({
                                        id_movimientos_tecnicos: movement.id_movimientos_tecnicos,
                                        id_repuesto: movement.id_repuesto,
                                        repuesto_referencia: movement.repuesto_referencia,
                                        repuesto_nombre: movement.repuesto_nombre,
                                        id_tecnico_asignado: movement.id_tecnico_asignado,
                                        tipo: movement.tipo,
                                        concepto: movement.concepto,
                                        cantidad: movement.cantidad,
                                        numero_orden: movement.numero_orden
                                    })}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
