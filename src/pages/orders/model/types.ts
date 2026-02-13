export interface ScooterType {
    id: string;
    name: string;
    power: string;
    created_at: string;
}

export interface OrderFollow {
    id: number;
    created_at: string;
    number: number;
    id_scooter_type: string;
    level: number;
    is_finish: boolean;
    updated_at: string | null;
    status?: string;
    phone?: string;
    order_link?: string;
    email?: string;
    call_count?: number;
}

export interface ViewOrderFollow {
    id: number;
    created_at: string;
    number: number;
    nombre_scooter: string;
    potencia: string;
    level: number;
    is_finish: boolean;
    updated_at: string | null;
    id_scooter_type: string;
    status?: string;
    phone?: string;
    order_link?: string;
    email?: string;
    call_count?: number;
}

export interface CreateOrderFollowPayload {
    number: number;
    id_scooter_type: string;
    status: string;
    phone: string;
    order_link: string;
    email: string;
}

export interface CallHistory {
    id: number;
    order_id: number;
    call_date: string;
    answered: boolean;
    comment?: string;
    created_at: string;
}
