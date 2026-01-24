// Types for inventory feature
export interface InventoryItem {
    // Inventory specific fields
    id_inventario: string; // Changed to string to support UUID
    id_localizacion: string;
    stock_actual: number;
    posicion: string;

    // Repuesto (spare part) fields
    id_repuesto: string;
    referencia: string;
    nombre: string;
    cantidad_minima: number;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada: string;
    url_imagen: string;
    estado_stock: string;
    fecha_ingreso_inventario: string;
    nuevo_hasta: string | null;
}

export interface InventoryParams {
    page?: number;
    limit?: number;
    order_by?: string;
    direction?: 'asc' | 'desc';
    search?: string;
    estado_stock?: string;
    descontinuado?: boolean;
    is_new?: boolean;
}

export interface PaginatedInventoryResponse {
    items: InventoryItem[];
    total_count: number;
    page: number;
    limit: number;
    page_count: number;
}

export interface AutocompleteInputProps {
    selected?: { id_repuesto: string, referencia: string, nombre: string } | null;
    setSelected: (selection: { id_repuesto: string, referencia: string, nombre: string } | null) => void;
    id_localizacion?: string;
    placeholder?: string;
    searchSource?: 'inventory' | 'spares';
}

// Exporta este tipo para que los componentes padres lo usen
export interface AutocompleteInputRef {
    clear: () => void;
    focus: () => void;
}

export interface TimelineEvent {
    fecha: string;
    tipo_evento: 'CONTEO' | 'GARANTIA' | 'MOVIMIENTO_TECNICO' | 'AJUSTE_MANUAL';
    titulo: string;
    operacion: string;
    estado: string;
    usuario_responsable: string;
    tecnico_asociado: string | null;
    observaciones: string | null;
    informacion_adicional: string | null;
    orden: string | null;
    id_repuesto: string;
    id_localizacion: string;
}

export type MovementHistoryItem = TimelineEvent;
