/**
 * Tipos de movimientos técnicos disponibles
 */
export type TipoMovimiento = 'ingreso' | 'salida' | 'venta';

/**
 * Conceptos de movimientos disponibles
 */
export type ConceptoMovimiento =
  | 'salida'
  | 'ingreso'
  | 'venta'
  | 'garantia'
  | 'prestamo'
  | 'cotizacion'
  | 'devolucion';

/**
 * Interfaz para el objeto de respuesta de movimientos técnicos
 * Incluye datos relacionados de repuestos, localizaciones, usuarios y técnicos
 */
export interface MovimientoTecnico {
  /** ID único del movimiento técnico */
  id_movimientos_tecnicos: string;

  /** ID de la localización asociada */
  id_localizacion: string;

  /** ID del repuesto involucrado */
  id_repuesto: string;

  /** ID del usuario responsable del movimiento */
  id_usuario_responsable: string;

  /** ID del técnico asignado */
  id_tecnico_asignado: string;

  /** Concepto del movimiento (garantía, venta, préstamo, etc.) */
  concepto: ConceptoMovimiento;

  /** Tipo de movimiento (entrada o salida) */
  tipo: TipoMovimiento;

  /** Cantidad de repuestos en el movimiento */
  cantidad: number;

  /** Fecha y hora del movimiento */
  fecha: string;

  /** Número de orden asociado */
  numero_orden: number;

  /** Indica si el movimiento ha sido descargado */
  descargada: boolean;

  /** Fecha de creación del registro */
  created_at: string;

  /** Fecha de última actualización del registro */
  update_at: string;

  /** Referencia del repuesto */
  referencia: string;

  /** Nombre del repuesto */
  nombre_repuesto: string;

  /** URL de la imagen del repuesto */
  url_imagen: string;

  /** Nombre de la localización */
  nombre_localizacion: string;

  /** Nombre del usuario responsable */
  nombre_responsable: string;

  /** Nombre del técnico asignado */
  nombre_tecnico: string;
}

/**
 * Tipo para el objeto de edición de movimientos
 * Contiene solo los campos necesarios para editar un movimiento
 */
export interface MovimientoEdicion {
  id_movimientos_tecnicos: string;
  id_repuesto: string;
  repuesto_referencia: string;
  repuesto_nombre: string;
  id_tecnico_asignado: string;
  tipo: TipoMovimiento;
  concepto: ConceptoMovimiento;
  cantidad: number;
  numero_orden: number;
}


export interface TechnicalMovement {
  id_localizacion?: string;
  id_repuesto?: string;
  id_usuario_responsable?: string;
  id_tecnico_asignado?: string | null;
  concepto?: string;
  tipo?: string;
  cantidad?: number;
  numero_orden?: string | null;
  descargada?: boolean;
  [key: string]: unknown;
}

export interface MovementFilters {
  page: number;
  pageSize: number;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
  concept?: string;
  downloaded?: string;
}

export interface MovementDetailsModalProps {
  movement: MovimientoTecnico | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
