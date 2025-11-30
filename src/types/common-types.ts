export interface InventoryItem {
    id_repuesto: string;
    referencia: string;
    nombre: string;
    cantidad_minima: number;
    descontinuado: boolean;
    tipo: string;
    fecha_estimada: string;
    url_imagen: string;
    fecha_ingreso_inventario: string | null;
    updated_at: string | null;
}

export interface UserLocation {
  id_localizacion: number;
  nombre: string;
}