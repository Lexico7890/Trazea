export const ActionButtonGroup = {
    SALIDA: "salida",
    INGRESO: "ingreso",
    VENTA: "venta",
} as const;

export const TIPY_CONCEPT = {
    GARANTIA: "garantia",
    PRESTAMO: "prestamo",
    VENTA: "venta",
    COTIZACION: "cotizacion",
    DEVOLUCION: "devolucion",
} as const;

export type TIPY_CONCEPT = typeof TIPY_CONCEPT[keyof typeof TIPY_CONCEPT];

export type ActionButtonGroup = typeof ActionButtonGroup[keyof typeof ActionButtonGroup];
