export const ESTADOS_STOCK = [
    { value: 'all', label: 'Todos estados de stock' },
    { value: 'BAJO', label: 'Bajo' },
    { value: 'OK', label: 'Ok' },
    { value: 'CRITICO', label: 'Crítico' }
] as const;

export const ESTADOS = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'discontinued', label: 'Descontinuados' },
] as const;
