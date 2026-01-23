export interface Repuesto {
    id_repuesto: string;
    referencia: string;
    nombre: string;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada: string | null;
    url_imagen: string | null;
    created_at: string;
    marca: string;
    descripcion: string;
    // Fields from vista_repuestos_inventario
    stock_actual?: number;
    posicion?: string;
    veces_contado?: number;
    estado_stock?: string;
    cantidad_minima?: number;
    nuevo_hasta?: string | null;
    nombre_localizacion?: string;
    fecha_creacion_repuesto?: string;
    alerta_minimo?: boolean;
    es_nuevo?: boolean;

}

export interface RepuestosParams {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    descontinuado?: boolean;
    order_by?: keyof Repuesto;
    direction?: 'asc' | 'desc';

}

export interface PaginatedRepuestosResponse {
    items: Repuesto[];
    total_count: number;
    page: number;
    limit: number;
    page_count: number;
}

export interface RepuestoFormData {
    referencia: string;
    nombre: string;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada?: string | null;
    url_imagen?: string | null;
    marca?: string;
    descripcion?: string;
}