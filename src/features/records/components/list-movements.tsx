import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useSearchMovements, useMarkMovementAsDownloaded } from "../queries";
import { Loader2, Edit, Eye, Download } from "lucide-react";
import { ActionMenu } from "@/components/common/ActionMenu";
import { useRecordsStore } from "../store/useRecordsStore";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function ListMovements() {
    const { data, isLoading, isError, error } = useSearchMovements();
    const { setMovementToEdit } = useRecordsStore();
    const markAsDownloaded = useMarkMovementAsDownloaded();
    const [downloadConfirmId, setDownloadConfirmId] = useState<string | null>(null);

    const handleDownload = () => {
        if (downloadConfirmId) {
            markAsDownloaded.mutate(downloadConfirmId);
            setDownloadConfirmId(null);
        }
    };

    const getRowClass = (movement: any) => {
        if (movement.descargada === true) {
            return "bg-green-100 dark:bg-green-900/20"; // Green if downloaded
        }

        if (movement.fecha) {
            const movementDate = new Date(movement.fecha); // UTC date from DB
            // Adjust movement date to local time is handled by JS Date constructor automatically if string includes Z,
            // or if it's ISO string. Supabase returns ISO strings typically (e.g. 2023-10-27T10:00:00+00:00 or Z).
            // Let's assume standard ISO format.
            // If it's just '2023-10-27 10:00:00' without timezone, it might be interpreted as local.
            // However, typical Supabase setup is timestamptz.
            // Requirement: "ajustar la hora ya que esta en utc para que se compare con la hora local"
            // If the string is UTC but lacks 'Z', we might need to append it.
            // But usually the client handles it.
            // We'll compare against current time.

            const now = new Date();
            const diffMs = now.getTime() - movementDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 24) {
                return "bg-red-100 dark:bg-red-900/20"; // Red if older than 24h and not downloaded
            }
        }

        return "";
    };

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
                        <TableRow
                            key={movement.id_movimientos_tecnicos || movement.id}
                            className={cn(getRowClass(movement))}
                        >
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
                                    actions={[
                                        {
                                            label: "Editar",
                                            icon: <Edit className="h-4 w-4" />,
                                            onClick: () => setMovementToEdit({
                                                id_movimientos_tecnicos: movement.id_movimientos_tecnicos,
                                                id_repuesto: movement.id_repuesto,
                                                repuesto_referencia: movement.repuesto_referencia,
                                                repuesto_nombre: movement.repuesto_nombre,
                                                id_tecnico_asignado: movement.id_tecnico_asignado,
                                                tipo: movement.tipo,
                                                concepto: movement.concepto,
                                                cantidad: movement.cantidad,
                                                numero_orden: movement.numero_orden
                                            })
                                        },
                                        {
                                            label: "Descargar",
                                            icon: <Download className="h-4 w-4" />,
                                            onClick: () => setDownloadConfirmId(movement.id_movimientos_tecnicos)
                                        },
                                        {
                                            label: "Ver",
                                            icon: <Eye className="h-4 w-4" />,
                                            onClick: () => {},
                                            disabled: true
                                        }
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <AlertDialog open={!!downloadConfirmId} onOpenChange={(open) => !open && setDownloadConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar descarga</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea realizar la descarga de este repuesto?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDownload}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
