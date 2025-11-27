// Types for inventory feature
export interface InventoryItem {
  // Inventory specific fields
  id_inventario: number;
  id_localizacion: number;
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
}

export interface InventoryParams {
  page?: number;
  limit?: number;
  order_by?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  tipo?: string;
  descontinuado?: boolean;
}

export interface PaginatedInventoryResponse {
  items: InventoryItem[];
  total_count: number;
  page: number;
  limit: number;
  page_count: number;
}
