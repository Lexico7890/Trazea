import { useParams } from 'react-router-dom';
import { useMovementHistory } from '@/entities/inventario/model/hooks';
import { useRepuestoByReferencia } from '@/entities/repuestos/model/hooks';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getConfigMovimiento = (tipo: string) => {
    const configs: { [key: string]: { icono: string; colorClass: string; label: string; badge: string } } = {
        'entrada_transferencia': { icono: '↔️', colorClass: 'bg-blue-500', label: 'Transferencia entre Sedes', badge: 'COMPLETADO' },
        'salida_transferencia': { icono: '↔️', colorClass: 'bg-blue-500', label: 'Transferencia entre Sedes', badge: 'COMPLETADO' },
        'movimiento_tecnico_salida': { icono: '🔧', colorClass: 'bg-red-500', label: 'Salida por Venta', badge: 'EN PROCESO' },
        'ingreso_mercancia': { icono: '📦', colorClass: 'bg-green-500', label: 'Ingreso de Mercancía', badge: 'COMPLETADO' },
        'salida_garantia': { icono: '⚠️', colorClass: 'bg-orange-500', label: 'Salida por Garantía', badge: 'PENDIENTE' },
        'conteo_total': { icono: '📋', colorClass: 'bg-purple-500', label: 'Conteo Total', badge: 'COMPLETADO' },
        'conteo_parcial': { icono: '📝', colorClass: 'bg-purple-500', label: 'Conteo Parcial', badge: 'COMPLETADO' },
    };
    return configs[tipo] || configs['entrada_transferencia'];
};

export function MovementHistoryPage() {
    const { referencia } = useParams<{ referencia: string }>();
    const { data: repuesto, isLoading: isLoadingRepuesto } = useRepuestoByReferencia(referencia || '');
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingMovements,
    } = useMovementHistory(referencia || '');

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
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <img src={repuesto.url_imagen || '/placeholder.svg'} alt={repuesto.nombre} className="w-full h-auto rounded-lg mb-4" />
                        <CardTitle className="text-2xl">{repuesto.nombre}</CardTitle>
                        <p className="text-muted-foreground">{repuesto.descripcion}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-semibold">SKU / Referencia</span>
                            <span>{repuesto.referencia}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Categoría</span>
                            <Badge variant="secondary">{repuesto.tipo}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Stock Actual</span>
                            <span>{movements.length > 0 ? `${movements[0].stock_acumulado} unidades` : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Columna Derecha - Historial de Movimientos */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Historial de Movimientos</CardTitle>
                            <p className="text-muted-foreground">Registro detallado de transacciones de stock</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">Filtrar</Button>
                            <Button variant="outline">Exportar</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {/* Línea de tiempo vertical */}
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>

                            {movements.map((mov, index) => {
                                const config = getConfigMovimiento(mov.tipo_movimiento);
                                const esEntrada = mov.cantidad > 0;

                                return (
                                    <div key={index} className="relative flex items-start gap-4 mb-8">
                                        <div className={`z-10 flex items-center justify-center w-10 h-10 rounded-full ${config.colorClass} text-white`}>
                                            <span>{config.icono}</span>
                                        </div>
                                        <div className="flex-1">
                                            <Card className="w-full">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold">{config.label}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {mov.metadata?.tipo === 'transferencia' ?
                                                                    (esEntrada ? `Desde: ${mov.metadata.localizacion_origen}` : `Hacia: ${mov.metadata.localizacion_destino}`) :
                                                                mov.metadata?.tipo === 'movimiento_tecnico' ? `Técnico: ${mov.metadata.tecnico_asignado}` :
                                                                mov.metadata?.tipo === 'log_inventario' ? `Operación: ${mov.metadata.tipo_operacion}` :
                                                                mov.metadata?.tipo === 'garantia' ? `Técnico: ${mov.metadata.tecnico_asociado}` :
                                                                mov.metadata?.tipo === 'conteo_inventario' ? `Contador: ${mov.metadata.usuario_contador}` :
                                                                `Recibido en ${mov.nombre_localizacion}`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant={config.badge === 'COMPLETADO' ? 'default' : 'secondary'}>{config.badge}</Badge>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {format(new Date(mov.fecha_movimiento), "PPP 'a las' p", { locale: es })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Cantidad</p>
                                                            <p className={`font-bold text-lg ${esEntrada ? 'text-green-500' : 'text-red-500'}`}>
                                                                {esEntrada ? `+${mov.cantidad}` : mov.cantidad} Und
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Referencia</p>
                                                            <p className="font-mono">{mov.metadata?.id_solicitud || mov.metadata?.numero_orden || mov.metadata?.id_log || mov.metadata?.id_garantia || mov.metadata?.id_conteo || 'N/A'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{mov.usuario_responsable}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {mov.metadata?.tipo === 'transferencia' ? (esEntrada ? 'Receptor' : 'Alistador') :
                                                                     mov.metadata?.tipo === 'movimiento_tecnico' ? 'Técnico' :
                                                                     mov.metadata?.tipo === 'log_inventario' ? 'Responsable' :
                                                                     mov.metadata?.tipo === 'garantia' ? 'Técnico Asociado' :
                                                                     mov.metadata?.tipo === 'conteo_inventario' ? 'Contador' :
                                                                     'Responsable'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {hasNextPage && (
                            <div className="text-center mt-8">
                                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                                    {isFetchingNextPage ? 'Cargando...' : 'Cargar más movimientos'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
