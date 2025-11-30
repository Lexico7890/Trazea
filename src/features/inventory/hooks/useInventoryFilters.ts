import { useState, useCallback } from 'react';

export interface InventoryFilters {
  search: string;
  tipo: string;
  descontinuado: string; // 'all' | 'active' | 'discontinued'
  page: number;
  limit: number;
  orderBy: string;
  direction: 'asc' | 'desc';
}

export function useInventoryFilters() {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    tipo: 'all',
    descontinuado: 'all',
    page: 1,
    limit: 10,
    orderBy: 'fecha_ingreso_inventario',
    direction: 'desc',
  });

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const updateTipo = useCallback((tipo: string) => {
    setFilters(prev => ({ ...prev, tipo, page: 1 }));
  }, []);

  const updateDescontinuado = useCallback((descontinuado: string) => {
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
      tipo: 'all',
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
    updateTipo,
    updateDescontinuado,
    updatePage,
    updateLimit,
    updateSort,
    resetFilters,
  };
}
