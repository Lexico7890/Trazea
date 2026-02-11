import { useState, useCallback } from 'react';

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

interface UseLoadingReturn {
    isLoading: boolean;
    error: string | null;
    startLoading: () => void;
    stopLoading: () => void;
    setError: (error: string | null) => void;
    resetError: () => void;
    executeAsync: <T>(
        asyncFn: () => Promise<T>,
        options?: {
            onSuccess?: (data: T) => void;
            onError?: (error: Error) => void;
            onFinally?: () => void;
        }
    ) => Promise<T | null>;
}

/**
 * Hook personalizado para manejar estados de carga de manera consistente
 * @returns Objeto con estado de carga y funciones de control
 */
export const useLoading = (initialState: boolean = false): UseLoadingReturn => {
    const [state, setState] = useState<LoadingState>({
        isLoading: initialState,
        error: null,
    });

    const startLoading = useCallback(() => {
        setState({ isLoading: true, error: null });
    }, []);

    const stopLoading = useCallback(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState((prev) => ({ ...prev, error }));
    }, []);

    const resetError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    /**
     * Ejecuta una función asíncrona y maneja automáticamente el estado de carga
     */
    const executeAsync = useCallback(
        async <T,>(
            asyncFn: () => Promise<T>,
            options?: {
                onSuccess?: (data: T) => void;
                onError?: (error: Error) => void;
                onFinally?: () => void;
            }
        ): Promise<T | null> => {
            startLoading();
            try {
                const result = await asyncFn();
                options?.onSuccess?.(result);
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error';
                setError(errorMessage);
                options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
                return null;
            } finally {
                stopLoading();
                options?.onFinally?.();
            }
        },
        [startLoading, stopLoading, setError]
    );

    return {
        isLoading: state.isLoading,
        error: state.error,
        startLoading,
        stopLoading,
        setError,
        resetError,
        executeAsync,
    };
};

/**
 * Hook para manejar múltiples estados de carga de manera independiente
 */
export const useMultipleLoading = () => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const startLoading = useCallback((key: string) => {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
        setErrors((prev) => ({ ...prev, [key]: null }));
    }, []);

    const stopLoading = useCallback((key: string) => {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }, []);

    const setError = useCallback((key: string, error: string | null) => {
        setErrors((prev) => ({ ...prev, [key]: error }));
    }, []);

    const isLoading = useCallback(
        (key: string) => loadingStates[key] ?? false,
        [loadingStates]
    );

    const getError = useCallback(
        (key: string) => errors[key] ?? null,
        [errors]
    );

    const executeAsync = useCallback(
        async <T,>(
            key: string,
            asyncFn: () => Promise<T>,
            options?: {
                onSuccess?: (data: T) => void;
                onError?: (error: Error) => void;
                onFinally?: () => void;
            }
        ): Promise<T | null> => {
            startLoading(key);
            try {
                const result = await asyncFn();
                options?.onSuccess?.(result);
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Ha ocurrido un error';
                setError(key, errorMessage);
                options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
                return null;
            } finally {
                stopLoading(key);
                options?.onFinally?.();
            }
        },
        [startLoading, stopLoading, setError]
    );

    return {
        loadingStates,
        errors,
        startLoading,
        stopLoading,
        setError,
        isLoading,
        getError,
        executeAsync,
    };
};

export default useLoading;