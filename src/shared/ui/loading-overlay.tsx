import React from 'react';
import Loader from './loader';

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
    blur?: boolean;
    opacity?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
    children: React.ReactNode;
}

/**
 * Overlay de carga que se superpone al contenido
 * Útil para mostrar estado de carga sin desmontar el contenido existente
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    text,
    blur = true,
    opacity = 80,
    size = 'lg',
    variant = 'spinner',
    children,
}) => {
    return (
        <div className="relative">
            {children}

            {isLoading && (
                <div
                    className={`absolute inset-0 bg-white flex items-center justify-center z-10 transition-opacity duration-200 ${blur ? 'backdrop-blur-sm' : ''
                        }`}
                    style={{ opacity: opacity / 100 }}
                >
                    <Loader size={size} variant={variant} text={text} />
                </div>
            )}
        </div>
    );
};

/**
 * Overlay de carga para contenedores de página completa
 */
export const PageLoadingOverlay: React.FC<{
    isLoading: boolean;
    text?: string;
}> = ({ isLoading, text = 'Cargando...' }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <Loader size="xl" variant="spinner" />
                <p className="mt-4 text-gray-600 font-orbitron animate-pulse">
                    {text}
                </p>
            </div>
        </div>
    );
};

/**
 * Overlay con barra de progreso
 */
export const ProgressOverlay: React.FC<{
    isLoading: boolean;
    progress: number;
    text?: string;
    children: React.ReactNode;
}> = ({ isLoading, progress, text, children }) => {
    return (
        <div className="relative">
            {children}

            {isLoading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="w-full max-w-md px-8">
                        <div className="mb-4">
                            <Loader size="lg" variant="spinner" />
                        </div>

                        {text && (
                            <p className="text-center text-gray-600 font-orbitron mb-4">
                                {text}
                            </p>
                        )}

                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>

                        <p className="text-center text-sm text-gray-500 font-orbitron mt-2">
                            {Math.round(progress)}%
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Overlay con mensaje personalizado y acciones
 */
export const CustomLoadingOverlay: React.FC<{
    isLoading: boolean;
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
}> = ({ isLoading, title, message, icon, actions, children }) => {
    return (
        <div className="relative">
            {children}

            {isLoading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center max-w-md px-8">
                        {icon ? (
                            <div className="mb-4 flex justify-center">
                                {icon}
                            </div>
                        ) : (
                            <div className="mb-4">
                                <Loader size="xl" variant="spinner" />
                            </div>
                        )}

                        {title && (
                            <h3 className="text-xl font-orbitron font-bold text-gray-800 mb-2">
                                {title}
                            </h3>
                        )}

                        {message && (
                            <p className="text-gray-600 mb-4">
                                {message}
                            </p>
                        )}

                        {actions && (
                            <div className="mt-6">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingOverlay;