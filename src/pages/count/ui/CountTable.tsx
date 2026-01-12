import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CountResult, CountTableProps } from '../model/types';

function getRowClass(result: CountResult): string {
    if (!result.existe_en_bd) {
        return 'bg-red-500/20 hover:bg-red-500/30';
    }
    if (!result.existe_en_ubicacion) {
        return 'bg-orange-500/20 hover:bg-orange-500/30';
    }
    if (result.diferencia !== 0) {
        return 'bg-yellow-500/20 hover:bg-yellow-500/30';
    }
    return '';
}

export function CountTable({
    paginatedResults,
    startIndex,
    currentPage,
    totalPages,
    filteredCount,
    endIndex,
    onPqChange,
    onPageChange,
}: CountTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalles del Conteo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>CSA</TableHead>
                                <TableHead>MIS</TableHead>
                                <TableHead className="w-24">PQ</TableHead>
                                <TableHead>Diferencia</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedResults.length > 0 ? (
                                paginatedResults.map((item, index) => (
                                    <TableRow key={item.referencia} className={getRowClass(item)}>
                                        <TableCell>{startIndex + index + 1}</TableCell>
                                        <TableCell>{item.referencia}</TableCell>
                                        <TableCell>{item.nombre}</TableCell>
                                        <TableCell>{item.cantidad_csa}</TableCell>
                                        <TableCell>{item.cantidad_sistema}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.cantidad_pq}
                                                onChange={(e) => onPqChange(item.referencia, e.target.value)}
                                                className="w-20 h-8"
                                            />
                                        </TableCell>
                                        <TableCell>{item.diferencia}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No hay resultados para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {filteredCount > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCount)} de {filteredCount} resultados
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="text-sm">
                                Página {currentPage} de {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
