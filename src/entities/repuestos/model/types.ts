export interface Repuesto {
    id_repuesto: string;
    referencia: string;
    nombre: string;
    cantidad_minima: number;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada: string | null;
    url_imagen: string | null;
    created_at: string;
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
    cantidad_minima: number;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada?: string | null;
    url_imagen?: string | null;
}