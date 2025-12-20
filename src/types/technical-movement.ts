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
