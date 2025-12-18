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
}

export interface PaginatedInventoryResponse {
  items: InventoryItem[];
  total_count: number;
  page: number;
  limit: number;
  page_count: number;
}
