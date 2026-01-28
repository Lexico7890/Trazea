import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { getCountDetails, getCountDetailItems } from '../api';
import { Skeleton } from '@/shared/ui/skeleton';
import {
    AlertTriangle,
    CheckCircle2,
    Calendar,
    User,
    FileText,
    Package,
    TrendingDown,
    AlertCircle,
    ListChecks
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/shared/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";

interface ConteoDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    idConteo: string | null;
}

export function ConteoDetailModal({ isOpen, onClose, idConteo }: ConteoDetailModalProps) {
    const { data: details, isLoading, isError, error } = useQuery({
        queryKey: ['countDetails', idConteo],
        queryFn: () => getCountDetails(idConteo!),
        enabled: !!idConteo && isOpen,
    });

    const { data: detailItems, isLoading: isLoadingItems } = useQuery({
        queryKey: ['countDetailItems', idConteo],
        queryFn: () => getCountDetailItems(idConteo!),
        enabled: !!idConteo && isOpen,
    });

    const hasDifferences = details && details.total_diferencia_encontrada > 0;

    const getRowClassName = (estado: string) => {
        switch (estado) {
            case 'FALTANTE':
                return 'bg-red-500/10 hover:bg-red-500/20';
            case 'SOBRANTE':
                return 'bg-blue-500/10 hover:bg-blue-500/20';
            default:
                return '';
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'FALTANTE':
                return <Badge variant="destructive" className="bg-red-500/80 text-xs">{estado}</Badge>;
            case 'SOBRANTE':
                return <Badge className="bg-blue-500/80 text-white text-xs">{estado}</Badge>;
            default:
                return <Badge variant="secondary" className="text-xs">{estado}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] p-0 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : isError ? (
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle>Error al cargar detalles</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error?.message || 'Error desconocido'}</p>
                        </div>
                    </div>
                ) : details ? (
                    <>
                        {/* Header with status indicator */}
                        <div
                            className={`p-6 relative overflow-hidden ${hasDifferences
                                    ? 'bg-gradient-to-br from-amber-500/20 to-red-500/20 border-b-4 border-amber-500'
                                    : 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-b-4 border-emerald-500'
                                }`}
                        >
                            {/* Decorative background pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)`
                                }} />
                            </div>

                            <div className="relative z-10">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                        {hasDifferences ? (
                                            <>
                                                <div className="p-2 bg-amber-500 rounded-lg animate-pulse">
                                                    <AlertTriangle className="h-6 w-6 text-white" />
                                                </div>
                                                <span>Diferencias Detectadas</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-2 bg-emerald-500 rounded-lg">
                                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                                </div>
                                                <span>Conteo Exitoso</span>
                                            </>
                                        )}
                                    </DialogTitle>
                                </DialogHeader>

                                {/* Status message */}
                                <div className="mt-3">
                                    {hasDifferences ? (
                                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-amber-500">
                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                                ⚠️ Se encontraron <span className="font-bold text-lg">{details.total_diferencia_encontrada}</span> diferencia(s) en este conteo
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border-l-4 border-emerald-500">
                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                ✓ Todos los items coinciden con el sistema
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content - Scrollable area */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Calendar className="h-4 w-4" />
                                        <span>Fecha del Conteo</span>
                                    </div>
                                    <p className="font-semibold">
                                        {format(new Date(details.fecha_conteo), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(details.fecha_conteo), 'HH:mm:ss')}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <User className="h-4 w-4" />
                                        <span>Usuario Responsable</span>
                                    </div>
                                    <p className="font-semibold">{details.usuario_responsable}</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <FileText className="h-4 w-4" />
                                        <span>Tipo de Conteo</span>
                                    </div>
                                    <Badge variant="outline" className="font-semibold">
                                        {details.tipo_conteo.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ListChecks className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Items Auditados</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {details.total_items_auditados}
                                    </p>
                                </div>

                                <div className={`rounded-lg p-4 border ${hasDifferences
                                        ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800'
                                        : 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className={`h-4 w-4 ${hasDifferences
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                            }`} />
                                        <span className={`text-xs font-medium ${hasDifferences
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                            Diferencias
                                        </span>
                                    </div>
                                    <p className={`text-2xl font-bold ${hasDifferences
                                            ? 'text-amber-700 dark:text-amber-300'
                                            : 'text-emerald-700 dark:text-emerald-300'
                                        }`}>
                                        {details.total_diferencia_encontrada}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Items PQ</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {details.total_items_pq}
                                    </p>
                                </div>
                            </div>

                            {/* Observations */}
                            {details.observaciones && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Observaciones
                                    </h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {details.observaciones}
                                    </p>
                                </div>
                            )}

                            {/* Items Table */}
                            <div className="mt-4">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Repuestos Contados
                                </h4>
                                {isLoadingItems ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : detailItems && detailItems.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="w-12 text-center">#</TableHead>
                                                    <TableHead>Referencia</TableHead>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead className="text-center">Sistema</TableHead>
                                                    <TableHead className="text-center">CSA</TableHead>
                                                    <TableHead className="text-center">PQ</TableHead>
                                                    <TableHead className="text-center">Diferencia</TableHead>
                                                    <TableHead className="text-center">Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {detailItems.map((item, index) => (
                                                    <TableRow
                                                        key={item.id_detalle_conteo}
                                                        className={getRowClassName(item.estado_diferencia)}
                                                    >
                                                        <TableCell className="text-center font-medium text-muted-foreground">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {item.referencia}
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate" title={item.nombre_repuesto}>
                                                            {item.nombre_repuesto}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.cantidad_sistema}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.cantidad_csa}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.cantidad_pq}
                                                        </TableCell>
                                                        <TableCell className="text-center font-semibold">
                                                            {item.diferencia > 0 ? '+' : ''}{item.diferencia}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {getEstadoBadge(item.estado_diferencia)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg">
                                        No hay repuestos registrados en este conteo
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
