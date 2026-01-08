export interface InventoryFilters {
    search: string;
    estado_stock: string;
    descontinuado: string; // 'all' | 'active' | 'discontinued'
    page: number;
    limit: number;
    orderBy: string;
    direction: 'asc' | 'desc';
}

export interface InventoryFiltersProps {
    search: string;
    estado_stock: string;
    descontinuado: string;
    onSearchChange: (value: string) => void;
    onEstadoStockChange: (value: string) => void;
    onDescontinuadoChange: (value: string) => void;
    onReset: () => void;
}