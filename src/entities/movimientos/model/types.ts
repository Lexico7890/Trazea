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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movement: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
