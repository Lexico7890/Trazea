import type { ReactNode } from "react";

export interface ActionItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string; // For styling specific actions (e.g., destructive)
}

export interface Destination {
    id_localizacion: string;
    nombre: string;
    telefono: string;
}

export interface SparePart {
    id_repuesto: string;
    referencia: string;
    nombre: string;
    cantidad?: number;
}

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars';
export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export const LOADER_SIZES = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
} as const;

export const LOADER_TEXTS = {
    loading: 'Cargando...',
    saving: 'Guardando...',
    updating: 'Actualizando...',
    deleting: 'Eliminando...',
    processing: 'Procesando...',
    uploading: 'Subiendo archivo...',
    downloading: 'Descargando...',
    searching: 'Buscando...',

    // Específicos de Workshop
    loadingInventory: 'Cargando inventario...',
    loadingWarranties: 'Cargando garantías...',
    loadingRequests: 'Cargando solicitudes...',
    loadingParts: 'Cargando repuestos...',
    loadingLocations: 'Cargando localizaciones...',
    loadingUsers: 'Cargando usuarios...',

    savingInventory: 'Guardando inventario...',
    savingWarranty: 'Guardando garantía...',
    savingRequest: 'Guardando solicitud...',

    processingCount: 'Procesando conteo...',
    processingRequest: 'Procesando solicitud...',
} as const;