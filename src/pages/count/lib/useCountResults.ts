import { useState, useCallback } from 'react';
import { type CountResult } from '../model/types';

export function useCountResults(initialResults: CountResult[]) {
    const [results, setResults] = useState<CountResult[]>(() => {
        return initialResults.map((item, index) => ({
            ...item,
            _id: `item-${index}-${item.ref_excel}`,
            cantidad_pq: item.cantidad_pq || 0,
        }));
    });

    const handlePqChange = useCallback((itemId: string, value: string) => {
        // Permitir valores vacíos
        const numValue = value === '' ? 0 : parseInt(value, 10);
        if (value !== '' && isNaN(numValue)) return;

        setResults((prevResults) => {
            return prevResults.map((item) => {
                if (item._id === itemId) {
                    const newDiferencia = (numValue + item.cantidad_sistema) - item.cant_excel;
                    return {
                        ...item,
                        cantidad_pq: numValue,
                        diferencia: newDiferencia,
                    };
                }
                return item;
            });
        });
    }, []);

    const totalItemsAuditados = results.length;
    const totalDiferenciaEncontrada = results.filter((item) => item.diferencia !== 0).length;
    const totalItemsPq = results.reduce((sum, item) => sum + item.cantidad_pq, 0);

    return {
        results,
        handlePqChange,
        totalItemsAuditados,
        totalDiferenciaEncontrada,
        totalItemsPq,
    };
}
