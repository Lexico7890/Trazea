import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table"
import { Loader2, Edit, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
} from "@/shared/ui/alert-dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { useUserStore } from "@/entities/user";
import { MovementDetailsModal, useSearchMovements, type MovimientoTecnico } from "@/entities/movimientos";
import { useRecordsStore } from "@/entities/records";
import { useMarkMovementAsDownloaded } from "../lib/useMarkMovementAsDownloaded";
import { cn } from "@/shared/lib";
import { ActionMenu } from "@/shared/ui/ActionMenu";


export default function ListMovements() {
    const { sessionData, hasRole, checkMenuPermission } = useUserStore();

    // Determine if we need to filter by technician
    const isTechnician = hasRole('tecnico');
    const technicianId = isTechnician ? sessionData?.user.id : undefined;

    // Filter State
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [concept, setConcept] = useState("");
    const [downloaded, setDownloaded] = useState("all");

    const pageSize = 10;

    const { data: queryData, isLoading, isError, error } = useSearchMovements({
        page,
        pageSize,
        technicianId,
        startDate,
        endDate,
        orderNumber,
        concept,
        downloaded
    });

    const movements = queryData?.data || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const { setMovementToEdit } = useRecordsStore();
    const markAsDownloaded = useMarkMovementAsDownloaded();
    const [downloadConfirmId, setDownloadConfirmId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [viewMovement, setViewMovement] = useState<any | null>(null);

    const handleDownload = () => {
        if (downloadConfirmId) {
            markAsDownloaded.mutate(downloadConfirmId);
            setDownloadConfirmId(null);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getRowClass = (movement: any) => {
        if (movement.descargada === true) {
            return "bg-green-400/50"; // User requested bg-green-400
        }

        if (movement.fecha) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const movementDate = new Date(movement.fecha as any);
            const now = new Date();
            const diffMs = now.getTime() - movementDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 24) {
                return "bg-red-100 dark:bg-red-400/50"; // Red if older than 24h and not downloaded
            }
        }

        return "";
    };

    // Concepts list based on typical usage + enum
    const concepts = [
        { value: "salida", label: "Salida" },
        { value: "ingreso", label: "Ingreso" },
        { value: "venta", label: "Venta" },
        { value: "garantia", label: "Garantia" },
        { value: "prestamo", label: "Prestamo" },
        { value: "cotizacion", label: "Cotizacion" },
        { value: "devolucion", label: "Devolucion" },
    ];

    const canEdit = checkMenuPermission("registros", "edit_register");

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

    return (
        <div className="space-y-4 h-full w-full">
            {/* Filters Section */}
            <div className="bg-card p-4 border rounded-lg grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <div className="flex flex-col gap-2">
                    <Label>Fecha Inicio</Label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Fecha Fin</Label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Orden</Label>
                    <Input
                        placeholder="Buscar orden..."
                        value={orderNumber}
                        onChange={(e) => { setOrderNumber(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Concepto</Label>
                    <Select value={concept} onValueChange={(val) => { setConcept(val); setPage(1); }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {concepts.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label>Estado Descarga</Label>
                    <Select value={downloaded} onValueChange={(val) => { setDownloaded(val); setPage(1); }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="true">Descargados</SelectItem>
                            <SelectItem value="false">Pendientes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card p-4 flex flex-col justify-between border rounded-lg h-full w-full">
                {movements.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-muted-foreground">No hay movimientos coinciden con los filtros</p>
                    </div>
                ) : (
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
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {movements.map((movement: MovimientoTecnico) => (
                                <TableRow
                                    key={movement.id_movimientos_tecnicos || movement.id_repuesto}
                                    className={cn(getRowClass(movement))}
                                >
                                    <TableCell className="font-medium">
                                        {typeof movement.id_movimientos_tecnicos === 'string' && movement.id_movimientos_tecnicos.startsWith('temp-')
                                            ? <span className="text-muted-foreground italic">Guardando...</span>
                                            : movement.referencia
                                        }
                                    </TableCell>
                                    <TableCell>{movement.numero_orden || '-'}</TableCell>
                                    <TableCell>{movement.nombre_tecnico || '-'}</TableCell>
                                    <TableCell>{movement.concepto || '-'}</TableCell>
                                    <TableCell className="text-right">{movement.cantidad || '-'}</TableCell>
                                    <TableCell>
                                        <ActionMenu
                                            actions={[
                                                {
                                                    label: "Editar",
                                                    icon: <Edit className="h-4 w-4" />,
                                                    disabled: !canEdit,
                                                    onClick: () => setMovementToEdit({
                                                        id_movimientos_tecnicos: movement.id_movimientos_tecnicos,
                                                        id_repuesto: movement.id_repuesto,
                                                        repuesto_referencia: movement.referencia,
                                                        repuesto_nombre: movement.nombre_repuesto,
                                                        id_tecnico_asignado: movement.id_tecnico_asignado,
                                                        tipo: movement.tipo,
                                                        concepto: movement.concepto,
                                                        cantidad: movement.cantidad,
                                                        numero_orden: String(movement.numero_orden)
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
                                                    onClick: () => setViewMovement(movement),
                                                }
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Página {page} de {totalPages || 1} ({totalCount} registros)
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(old => Math.max(old - 1, 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(old => (totalPages && old < totalPages ? old + 1 : old))}
                            disabled={!totalPages || page === totalPages}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

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

            <MovementDetailsModal
                open={!!viewMovement}
                onOpenChange={(open) => !open && setViewMovement(null)}
                movement={viewMovement}
            />
        </div>
    );
}
