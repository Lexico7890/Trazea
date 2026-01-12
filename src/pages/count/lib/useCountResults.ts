import { useState, useCallback } from 'react';
import { type CountResult } from '../model/types';

export function useCountResults(initialResults: CountResult[]) {
    const [results, setResults] = useState<CountResult[]>(
        initialResults.map((item) => ({
            ...item,
            cantidad_pq: item.cantidad_pq || 0,
        }))
    );

    const handlePqChange = useCallback((referencia: string, value: string) => {
        // Permitir valores vacíos
        const numValue = value === '' ? 0 : parseInt(value, 10);
        if (value !== '' && isNaN(numValue)) return;

        setResults((prevResults) =>
            prevResults.map((item) => {
                if (item.referencia === referencia) {
                    const newDiferencia = item.cant_excel + numValue - item.cantidad_sistema;
                    return {
                        ...item,
                        cantidad_pq: numValue,
                        diferencia: newDiferencia,
                    };
                }
                return item;
            })
        );
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
