export interface CartItem {
  id_item_carrito: string;
  id_usuario: string;
  id_localizacion: string;
  cantidad: number;
  created_at: string;
  nombre_solicitante: string;
  rol_solicitante: string;
  id_repuesto: string;
  referencia: string;
  nombre_repuesto: string;
  url_imagen: string | null;
  stock_actual_en_taller: number;
}

export interface Destination {
  id_localizacion: string;
  nombre: string;
}
