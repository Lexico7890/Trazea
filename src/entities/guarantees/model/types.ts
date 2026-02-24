export interface Guarantee {
    id_garantia: string;
    fecha_reporte: string;
    nombre_repuesto: string;
    referencia_repuesto: string;
    taller_origen: string;
    estado: string;
    solicitante: string;
    orden: string;
    reportado_por: string;
    tecnico_responsable: string | null;
    motivo_falla: string;
    url_evidencia_foto: string | null;
    comentarios_resolucion: string | null;
    kilometraje?: number;
    cantidad: number;
    id_repuesto: string;
    id_tecnico_asociado: string;
}