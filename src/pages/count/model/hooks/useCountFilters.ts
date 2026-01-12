import { useState, useMemo } from 'react';
import { CountResult, CountFilters, DiferenciaFilter, ExistsFilter } from '../types';

export function useCountFilters(results: CountResult[], itemsPerPage: number = 10) {
    const [filters, setFilters] = useState<CountFilters>({
        referencia: '',
        diferencia: 'all',
        existeEnBd: 'all',
        existeEnUbicacion: 'all',
    });

    const [currentPage, setCurrentPage] = useState(1);

    const filteredResults = useMemo(() => {
        return results.filter((item) => {
            if (filters.referencia && !item.referencia.toLowerCase().includes(filters.referencia.toLowerCase())) {
                return false;
            }

            if (filters.diferencia === 'positive' && item.diferencia <= 0) {
                return false;
            }
            if (filters.diferencia === 'negative' && item.diferencia >= 0) {
                return false;
            }

            if (filters.existeEnBd === 'true' && !item.existe_en_bd) {
                return false;
            }
            if (filters.existeEnBd === 'false' && item.existe_en_bd) {
                return false;
            }

            if (filters.existeEnUbicacion === 'true' && !item.existe_en_ubicacion) {
                return false;
            }
            if (filters.existeEnUbicacion === 'false' && item.existe_en_ubicacion) {
                return false;
            }

            return true;
        });
    }, [results, filters]);

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const updateFilter = (key: keyof CountFilters, value: string | DiferenciaFilter | ExistsFilter) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    return {
        filters,
        updateFilter,
        filteredResults,
        paginatedResults,
        currentPage,
        setCurrentPage,
        totalPages,
        startIndex,
        endIndex,
    };
}
