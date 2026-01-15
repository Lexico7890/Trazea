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