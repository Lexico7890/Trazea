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
    id_localizacion: string | undefined;
    placeholder?: string;
}

// Exporta este tipo para que los componentes padres lo usen
export interface AutocompleteInputRef {
    clear: () => void;
    focus: () => void;
}

export interface MovementHistoryItem {
    id_repuesto: string;
    id_localizacion: string;
    id_localizacion_destino: string | null;
    tipo_movimiento: string;
    cantidad: number;
    id_usuario_responsable: string;
    estado: string;
    fecha_movimiento: string;
    created_at: string;
    metadata: Record<string, any>;
    referencia: string;
    nombre_repuesto: string;
    marca: string;
    url_imagen: string;
    descontinuado: boolean;
    nombre_localizacion: string;
    usuario_responsable: string;
    email_usuario: string;
    stock_acumulado: number;
}
