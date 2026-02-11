import React from 'react';

interface SkeletonMincaProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    animation?: 'pulse' | 'wave' | 'none';
    width?: string | number;
    height?: string | number;
}

export const SkeletonMinca: React.FC<SkeletonMincaProps> = ({
    className = '',
    variant = 'text',
    animation = 'wave',
    width,
    height,
}) => {
    const baseClasses = 'bg-gray-200';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
};

// SkeletonMinca para lista de items
export const SkeletonMincaList: React.FC<{ items?: number; itemHeight?: string }> = ({
    items = 5,
    itemHeight = 'h-16'
}) => (
    <div className="space-y-3">
        {Array.from({ length: items }).map((_, i) => (
            <SkeletonMinca key={i} className={itemHeight} variant="rectangular" />
        ))}
    </div>
);

// SkeletonMinca para tabla
export const SkeletonMincaTable: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 4
}) => (
    <div className="w-full">
        {/* Header */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
                <SkeletonMinca key={`header-${i}`} height="2rem" variant="rectangular" />
            ))}
        </div>
        {/* Rows */}
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <SkeletonMinca key={`cell-${rowIndex}-${colIndex}`} height="3rem" variant="rectangular" />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// SkeletonMinca para card de producto
export const SkeletonMincaProductCard: React.FC = () => (
    <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
                <SkeletonMinca width="60%" height="1.5rem" />
                <SkeletonMinca width="40%" height="1rem" />
            </div>
            <SkeletonMinca variant="circular" width="3rem" height="3rem" />
        </div>
        <div className="space-y-2">
            <SkeletonMinca height="1rem" />
            <SkeletonMinca width="80%" height="1rem" />
        </div>
        <div className="flex gap-2">
            <SkeletonMinca width="5rem" height="2.5rem" variant="rectangular" />
            <SkeletonMinca width="5rem" height="2.5rem" variant="rectangular" />
        </div>
    </div>
);

// SkeletonMinca para detalles de repuesto
export const SkeletonMincaRepuestoDetail: React.FC = () => (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6">
            <SkeletonMinca variant="rectangular" width="10rem" height="10rem" />
            <div className="flex-1 space-y-3">
                <SkeletonMinca width="70%" height="2rem" />
                <SkeletonMinca width="40%" height="1.5rem" />
                <SkeletonMinca width="90%" height="1rem" />
                <SkeletonMinca width="80%" height="1rem" />
            </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                    <SkeletonMinca width="50%" height="1rem" />
                    <SkeletonMinca width="70%" height="1.5rem" />
                </div>
            ))}
        </div>

        {/* Table */}
        <SkeletonMincaTable rows={3} columns={4} />
    </div>
);

// SkeletonMinca para formulario
export const SkeletonMincaForm: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
    <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
                <SkeletonMinca width="30%" height="1rem" />
                <SkeletonMinca height="2.5rem" variant="rectangular" />
            </div>
        ))}
        <div className="flex gap-3 pt-4">
            <SkeletonMinca width="8rem" height="2.5rem" variant="rectangular" />
            <SkeletonMinca width="8rem" height="2.5rem" variant="rectangular" />
        </div>
    </div>
);

// SkeletonMinca para dashboard stats
export const SkeletonMincaStats: React.FC<{ items?: number }> = ({ items = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: items }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-3">
                <div className="flex items-center justify-between">
                    <SkeletonMinca width="60%" height="1rem" />
                    <SkeletonMinca variant="circular" width="2.5rem" height="2.5rem" />
                </div>
                <SkeletonMinca width="50%" height="2rem" />
                <SkeletonMinca width="70%" height="0.875rem" />
            </div>
        ))}
    </div>
);

export default SkeletonMinca;