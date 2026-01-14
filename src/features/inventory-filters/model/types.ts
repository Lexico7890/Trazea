export interface InventoryFilters {
    search: string;
    estado_stock: string;
    descontinuado: string; // 'all' | 'active' | 'discontinued'
    page: number;
    limit: number;
    orderBy: string;
    direction: 'asc' | 'desc';
    isNew: boolean;
}

export interface InventoryFiltersProps {
    search: string;
    estado_stock: string;
    descontinuado: string;
    isNew: boolean;
    onSearchChange: (value: string) => void;
    onEstadoStockChange: (value: string) => void;
    onDescontinuadoChange: (value: string) => void;
    onIsNewChange: (value: boolean) => void;
    onReset: () => void;
}