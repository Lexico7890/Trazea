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
    telefono: string;
}


export interface RequestsState {
    cartItems: CartItem[];
    destinations: Destination[];
    isLoading: boolean;

    setDestinations: (destinations: Destination[]) => void;
    loadCart: (locationId: string) => Promise<void>;
    addItemToCart: (userId: string, locationId: string, repuestoId: string, quantity?: number) => Promise<void>;
    removeItemFromCart: (cartItemId: string) => Promise<void>;
    clearCartAfterSubmit: (cartItemIds: string[]) => Promise<void>;
}

export interface CreateRequestData {
    id_localizacion_origen: string;
    id_localizacion_destino: string;
    id_usuario_solicitante: string;
    observaciones_generales: string;
    items: Array<{ id_repuesto: string; cantidad: number }>;
}

export interface RequestHistoryItem {
    id_solicitud: string;
    fecha_creacion: string;
    estado: string;
    observaciones_generales: string;
    id_localizacion_destino: number;
    nombre_destino: string;
    id_localizacion_origen: number;
    nombre_origen: string;
    id_usuario_solicitante: string;
    nombre_solicitante: string;
}