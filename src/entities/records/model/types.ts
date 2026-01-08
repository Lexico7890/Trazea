// Define the shape of the data needed for editing
// Based on the view structure provided
export interface MovementToEdit {
    id_movimientos_tecnicos: string;
    id_repuesto: string;
    repuesto_referencia: string;
    repuesto_nombre: string;
    id_tecnico_asignado: string;
    tipo: 'salida' | 'ingreso' | 'venta';
    concepto: string; // 'garantia', 'prestamo', etc.
    cantidad: number;
    numero_orden: string;
}

export interface RecordsStore {
    movementToEdit: MovementToEdit | null;
    setMovementToEdit: (movement: MovementToEdit | null) => void;
}