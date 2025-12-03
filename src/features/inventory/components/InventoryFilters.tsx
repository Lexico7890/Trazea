import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface InventoryFiltersProps {
    search: string;
    estado_stock: string;
    descontinuado: string;
    onSearchChange: (value: string) => void;
    onEstadoStockChange: (value: string) => void;
    onDescontinuadoChange: (value: string) => void;
    onReset: () => void;
}

const ESTADOS_STOCK = [
    { value: 'all', label: 'Todos estados de stock' },
    { value: 'BAJO', label: 'Bajo' },
    { value: 'OK', label: 'Ok' },
    { value: 'CRITICO', label: 'Crítico' }
];

const ESTADOS = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'discontinued', label: 'Descontinuados' },
];

export function InventoryFilters({
    search,
    estado_stock,
    descontinuado,
    onSearchChange,
    onEstadoStockChange,
    onDescontinuadoChange,
    onReset,
}: InventoryFiltersProps) {
    const hasActiveFilters = search !== '' || estado_stock !== 'all' || descontinuado !== 'all';

    const selectedEstadoStock = ESTADOS_STOCK.find(t => t.value === estado_stock)?.label || 'Estados de Stock';
    const selectedEstado = ESTADOS.find(e => e.value === descontinuado)?.label || 'Todos los estados';

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o referencia..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Estado Stock Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-between min-w-[180px]">
                            {selectedEstadoStock}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        {ESTADOS_STOCK.map((t) => (
                            <DropdownMenuItem
                                key={t.value}
                                onClick={() => onEstadoStockChange(t.value)}
                                className={estado_stock === t.value ? 'bg-accent' : ''}
                            >
                                {t.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Estado Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-between min-w-[180px]">
                            {selectedEstado}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[180px]">
                        {ESTADOS.map((e) => (
                            <DropdownMenuItem
                                key={e.value}
                                onClick={() => onDescontinuadoChange(e.value)}
                                className={descontinuado === e.value ? 'bg-accent' : ''}
                            >
                                {e.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}
