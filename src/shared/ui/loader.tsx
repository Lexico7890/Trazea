import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const Spinner: React.FC<{ size: string }> = ({ size }) => (
    <div className={`${size} relative`}>
        <div className="absolute inset-0 border-4 border-red-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
    </div>
);

const Dots: React.FC = () => (
    <div className="flex space-x-2">
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
);

const Pulse: React.FC<{ size: string }> = ({ size }) => (
    <div className={`${size} bg-red-600 rounded-full animate-pulse`}></div>
);

const Bars: React.FC = () => (
    <div className="flex space-x-1 items-end h-8">
        <div className="w-2 bg-red-600 rounded-t animate-pulse" style={{ height: '60%', animationDelay: '0ms' }}></div>
        <div className="w-2 bg-red-600 rounded-t animate-pulse" style={{ height: '100%', animationDelay: '150ms' }}></div>
        <div className="w-2 bg-red-600 rounded-t animate-pulse" style={{ height: '80%', animationDelay: '300ms' }}></div>
        <div className="w-2 bg-red-600 rounded-t animate-pulse" style={{ height: '40%', animationDelay: '450ms' }}></div>
    </div>
);

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    variant = 'spinner',
    text,
    fullScreen = false,
    className = '',
}) => {
    const renderLoader = () => {
        switch (variant) {
            case 'spinner':
                return <Spinner size={sizeClasses[size]} />;
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse size={sizeClasses[size]} />;
            case 'bars':
                return <Bars />;
            default:
                return <Spinner size={sizeClasses[size]} />;
        }
    };

    const content = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            {renderLoader()}
            {text && (
                <p className="text-gray-600 font-orbitron text-sm animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
};

// Loader específico para tablas
export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
        ))}
    </div>
);

// Loader para cards
export const CardLoader: React.FC = () => (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
    </div>
);

// Loader para skeleton de página completa
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Cargando...' }) => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
            <div className="mb-6">
                <Spinner size="w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold font-orbitron text-white mb-2 animate-pulse">
                TRAZEA MANAGEMENT SYSTEM
            </h2>
            <p className="text-gray-600 font-orbitron">
                {text}
            </p>
        </div>
    </div>
);

// Loader inline para botones
export const ButtonLoader: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export default Loader;