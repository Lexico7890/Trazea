export interface PartialCountModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export interface CountItem {
    id_repuesto: string;
    ref_excel: string;
    nombre: string;
    cantidad_sistema?: number;
    real?: number;
}