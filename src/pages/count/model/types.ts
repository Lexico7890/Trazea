export interface FileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

export interface CountResult {
    ref_excel: string;
    nombre: string;
    cant_excel: number;
    cantidad_sistema: number;
    diferencia: number;
    existe_en_bd: boolean;
    existe_en_ubicacion: boolean;
    cantidad_pq: number;
    _id?: string;
}

export type DiferenciaFilter = 'all' | 'positive' | 'negative';
export type ExistsFilter = 'all' | 'true' | 'false';

export interface CountFilters {
    referencia: string;
    diferencia: DiferenciaFilter;
    existeEnBd: ExistsFilter;
    existeEnUbicacion: ExistsFilter;
}

export interface CountTableProps {
    paginatedResults: CountResult[];
    startIndex: number;
    currentPage: number;
    totalPages: number;
    filteredCount: number;
    endIndex: number;
    onPqChange: (itemId: string, value: string) => void;
    onPageChange: (page: number) => void;
}

export interface RegistrarConteoParams {
    id_localizacion: string;
    id_usuario: string;
    tipo: string;
    total_items_auditados: number;
    total_diferencia_encontrada: number;
    total_items_pq: number;
    observaciones?: string;
    items: any[];
}

export interface CountDetail {
    id_conteo: string;
    fecha_conteo: string;
    tipo_conteo: string;
    usuario_responsable: string;
    total_items_auditados: number;
    total_diferencia_encontrada: number;
    total_items_pq: number;
    observaciones: string | null;
}