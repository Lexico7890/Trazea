import { useState, useCallback } from 'react';
import type { InventoryFilters } from '../model/types';

export function useInventoryFilters() {
    const [filters, setFilters] = useState<InventoryFilters>({
        search: '',
        estado_stock: 'all',
        descontinuado: 'all',
        page: 1,
        limit: 10,
        orderBy: 'fecha_ingreso_inventario',
        direction: 'desc',
    });

    const updateSearch = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    }, []);

    const updateStockState = useCallback((estado_stock: string) => {
        setFilters(prev => ({ ...prev, estado_stock, page: 1 }));
    }, []);

    const updateDescontinuado = useCallback((descontinuado: string) => {
        console.log(descontinuado);
        setFilters(prev => ({ ...prev, descontinuado, page: 1 }));
    }, []);

    const updatePage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const updateLimit = useCallback((limit: number) => {
        setFilters(prev => ({ ...prev, limit, page: 1 }));
    }, []);

    const updateSort = useCallback((orderBy: string) => {
        setFilters(prev => ({
            ...prev,
            orderBy,
            direction: prev.orderBy === orderBy && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            search: '',
            estado_stock: 'all',
            descontinuado: 'all',
            page: 1,
            limit: 10,
            orderBy: 'fecha_ingreso_inventario',
            direction: 'desc',
        });
    }, []);

    return {
        filters,
        updateSearch,
        updateStockState,
        updateDescontinuado,
        updatePage,
        updateLimit,
        updateSort,
        resetFilters,
    };
}
