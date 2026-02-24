import type { Guarantee } from "@/entities/guarantees";


export interface GuaranteeGroup {
    orden: string;
    items: Guarantee[];
    fecha_reporte: string;
    tecnico_responsable: string | null;
    reportado_por: string | null;
    solicitante: string;
    estado: string;
    taller_origen: string;
    motivo_falla: string;
    kilometraje?: number;
    url_evidencia_foto: string | null;
    repuestosCount: number;
}

export interface GuaranteesFilters {
    searchTerm: string;
    statusFilter: string;
    dateFrom: string;
    dateTo: string;
}
