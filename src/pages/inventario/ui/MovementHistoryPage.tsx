import { useParams } from 'react-router-dom';
import { useMovementHistory } from '@/entities/inventario/model/hooks';
import { useRepuestoByReferencia } from '@/entities/repuestos/model/hooks';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { User, Package, MapPin, ClipboardList, ShieldAlert, Wrench, PackageOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserStore } from '@/entities/user';
import type { TimelineEvent } from '@/entities/inventario/model/types';

// Helper components
const StatusBadge = ({ state, type }: { state: string, type: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' }) => {
    const colorMap = {
        'default': 'bg-gray-500/10 text-gray-500',
        'success': 'bg-green-800/20 text-green-400 border-green-800/50',
        'warning': 'bg-yellow-800/20 text-yellow-400 border-yellow-800/50',
        'destructive': 'bg-red-800/20 text-red-400 border-red-800/50',
        'secondary': 'bg-blue-800/20 text-blue-400 border-blue-800/50'
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${colorMap[type] || colorMap.default} border`}>
            {state}
        </span>
    );
};

const BaseEventCard = ({ event, icon: Icon, children }: { event: TimelineEvent, icon: any, children: React.ReactNode }) => {
    return (
        <div className="bg-[#1B1D25] rounded-2xl p-6 mb-4 border border-[#2A2E3B] shadow-lg hover:border-gray-600 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                    <div className="p-3 rounded-full bg-[#252836] text-gray-400 shadow-inner">
                        <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg tracking-tight">{event.titulo}</h3>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mt-0.5">{event.operacion}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#252836] px-3 py-1.5 rounded-full border border-[#2A2E3B]">
                        <span className="text-xs text-gray-400 font-medium">
                            {format(new Date(event.fecha), "EEE, d MMM • h:mm a", { locale: es })}
                        </span>
                    </div>
                    <StatusBadge
                        state={event.estado}
                        type={
                            ['COMPLETADO', 'CUADRADO', 'DISPONIBLE'].includes(event.estado) ? 'success' :
                                ['PENDIENTE', 'EN PROCESO'].includes(event.estado) ? 'warning' :
                                    ['DESCARGADO', 'AGOTADO', 'FALTANTE'].includes(event.estado) ? 'destructive' : 'secondary'
                        }
                    />
                </div>
            </div>

            {event.observaciones && (
                <div className="mb-6 p-3 bg-[#252836]/50 rounded-lg border-l-2 border-gray-600">
                    <p className="text-gray-400 text-sm italic">"{event.observaciones}"</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2 border-t border-[#2A2E3B]/50">
                {children}

                <div className="flex items-center gap-3 justify-self-start md:justify-self-end col-span-1 md:col-span-1 border-t md:border-t-0 border-[#2A2E3B]/50 pt-4 md:pt-0 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                        <p className="text-sm font-bold text-white leading-tight">{event.usuario_responsable}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Responsable</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600 shadow-md">
                        <User className="w-5 h-5 text-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Specific Cards
const ConteoCard = ({ event }: { event: TimelineEvent }) => (
    <BaseEventCard event={event} icon={ClipboardList}>
        <div className="col-span-1 md:col-span-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Información de Auditoría</p>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{event.informacion_adicional || '0'}</span>
                <span className="text-sm text-gray-400">items verificados</span>
            </div>
        </div>
    </BaseEventCard>
);

const GarantiaCard = ({ event }: { event: TimelineEvent }) => (
    <BaseEventCard event={event} icon={ShieldAlert}>
        <div className="col-span-1 md:col-span-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Detalles del Caso</p>
            <p className="text-sm text-gray-300 font-medium">{event.informacion_adicional}</p>
        </div>
    </BaseEventCard>
);

const MovimientoTecnicoCard = ({ event }: { event: TimelineEvent }) => {
    const cantidadMatch = event.informacion_adicional?.match(/Cantidad:\s*(-?\d+)/i);
    const cantidad = cantidadMatch ? parseInt(cantidadMatch[1]) : null;

    return (
        <BaseEventCard event={event} icon={Wrench}>
            <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">CANTIDAD</p>
                <div className="flex items-baseline gap-1">
                    <p className={`text-2xl font-bold ${cantidad && cantidad > 0 ? 'text-green-500' : 'text-pink-500'}`}>
                        {cantidad ? (cantidad > 0 ? `+${cantidad}` : `${cantidad}`) : event.informacion_adicional}
                    </p>
                    <span className="text-sm text-gray-400 font-semibold">Und</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">REFERENCIA / ORDEN</p>
                <p className="text-base text-white font-mono bg-[#252836] px-2 py-1 rounded inline-block border border-[#2A2E3B]">{event.orden || 'N/A'}</p>
            </div>
        </BaseEventCard>
    );
};

const AjusteManualCard = ({ event }: { event: TimelineEvent }) => (
    <BaseEventCard event={event} icon={PackageOpen}>
        <div className="col-span-1 md:col-span-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Cambio de Stock</p>
            <p className="text-sm text-gray-300 font-mono">{event.informacion_adicional}</p>
        </div>
    </BaseEventCard>
);

const DefaultCard = ({ event }: { event: TimelineEvent }) => (
    <BaseEventCard event={event} icon={AlertCircle}>
        <div className="col-span-1 md:col-span-2">
            <p className="text-gray-300 text-sm">{event.informacion_adicional}</p>
        </div>
    </BaseEventCard>
);

function TimelineCard({ event }: { event: TimelineEvent }) {
    switch (event.tipo_evento) {
        case 'CONTEO':
            return <ConteoCard event={event} />;
        case 'GARANTIA':
            return <GarantiaCard event={event} />;
        case 'MOVIMIENTO_TECNICO':
            return <MovimientoTecnicoCard event={event} />;
        case 'AJUSTE_MANUAL':
            return <AjusteManualCard event={event} />;
        default:
            return <DefaultCard event={event} />;
    }
}

export function MovementHistoryPage() {
    const { referencia } = useParams<{ referencia: string }>();
    const { data: repuesto, isLoading: isLoadingRepuesto } = useRepuestoByReferencia(referencia || '');
    const { currentLocation } = useUserStore();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingMovements,
    } = useMovementHistory(repuesto?.id_repuesto || '', currentLocation?.id_localizacion || '');

    const movements = data?.pages.flatMap((page) => page) || [];

    if (isLoadingRepuesto || isLoadingMovements) {
        return <div>Cargando...</div>;
    }

    if (!repuesto) {
        return <div>Repuesto no encontrado</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda - Detalles del Repuesto */}
            <div className="lg:col-span-1 lg:sticky lg:top-8 h-fit">
                <Card className="overflow-hidden border-none shadow-xl bg-card text-card-foreground">
                    <div className="relative">
                        <div className="bg-[#f0f0eb] p-8 flex justify-center items-center h-[300px]">
                            <img
                                src={repuesto.url_imagen || '/placeholder.svg'}
                                alt={repuesto.nombre}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <Badge className="absolute top-4 right-4 bg-pink-600 hover:bg-pink-700 text-white border-none text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-lg">
                            {repuesto.estado_stock?.replace('_', ' ') || 'DISPONIBLE'}
                        </Badge>
                    </div>

                    <CardContent className="p-6 space-y-8 bg-[#1B1D25] text-white">
                        <div>
                            <CardTitle className="text-3xl font-bold mb-2 leading-tight">{repuesto.nombre}</CardTitle>
                            <p className="text-gray-400 text-lg">
                                {repuesto.tipo} {repuesto.marca ? `- ${repuesto.marca}` : ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#252836] p-4 rounded-2xl">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">SKU ID</p>
                                <p className="font-semibold text-base break-all">{repuesto.referencia}</p>
                            </div>
                            <div className="bg-[#252836] p-4 rounded-2xl">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">CATEGORÍA</p>
                                <p className="font-semibold text-base truncate" title={repuesto.tipo}>{repuesto.tipo}</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-4">
                                <div className="p-1">
                                    <Package className="w-6 h-6 text-pink-500" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Stock Actual</p>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-2xl font-bold">{repuesto.stock_actual}</span>
                                        <span className="text-lg font-semibold text-gray-300">unidades</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-1">
                                    <MapPin className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Ubicación</p>
                                    <div className="flex items-baseline justify-between mt-0.5 w-full">
                                        <p className="text-lg font-semibold">{repuesto.posicion || 'Sin asignar'}</p>
                                        {repuesto.nombre_localizacion && (
                                            <span className="text-sm text-gray-400 text-right">{repuesto.nombre_localizacion}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-1">
                                    <ClipboardList className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Veces Contado</p>
                                    <p className="text-lg font-semibold mt-0.5">{repuesto.veces_contado || 0}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Columna Derecha - Historial de Movimientos */}
            <div className="lg:col-span-2">
                <div className="flex flex-col h-full">
                    <div className="mb-6 flex flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Historial de Movimientos</h2>
                            <p className="text-muted-foreground mt-1">Registro detallado de transacciones de stock</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:flex">
                                <span className="mr-2">📅</span> Filtrar por fecha
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {movements.map((mov, index) => (
                            <TimelineCard key={index} event={mov} />
                        ))}
                    </div>

                    {hasNextPage && (
                        <div className="text-center mt-8 pb-8">
                            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="secondary" className="w-full sm:w-auto">
                                {isFetchingNextPage ? 'Cargando...' : 'Cargar más movimientos'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
