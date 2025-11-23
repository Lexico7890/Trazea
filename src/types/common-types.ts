export interface InventoryItem {
    id_repuesto: string;
    referencia: string;
    nombre: string;
    cantidad_minima: number;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada: string;
    url_imagen: string;
    created_at: string | null;
    updated_at: string | null;
}