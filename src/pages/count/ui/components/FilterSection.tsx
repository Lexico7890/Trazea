import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { CountFilters, DiferenciaFilter, ExistsFilter } from '../../model/types';

interface FilterSectionProps {
    filters: CountFilters;
    onFilterChange: (key: keyof CountFilters, value: string | DiferenciaFilter | ExistsFilter) => void;
}

export function FilterSection({ filters, onFilterChange }: FilterSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Referencia</label>
                        <Input
                            placeholder="Buscar por referencia..."
                            value={filters.referencia}
                            onChange={(e) => onFilterChange('referencia', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Diferencia</label>
                        <Select
                            value={filters.diferencia}
                            onValueChange={(value) => onFilterChange('diferencia', value as DiferenciaFilter)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="positive">Positiva</SelectItem>
                                <SelectItem value="negative">Negativa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Existe en BD</label>
                        <Select
                            value={filters.existeEnBd}
                            onValueChange={(value) => onFilterChange('existeEnBd', value as ExistsFilter)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Existe en Ubicación</label>
                        <Select
                            value={filters.existeEnUbicacion}
                            onValueChange={(value) => onFilterChange('existeEnUbicacion', value as ExistsFilter)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
