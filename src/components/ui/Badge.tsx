import React from 'react';

/**
 * Enhanced Design Token-aware Badge component
 */

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    style?: React.CSSProperties;
    dot?: boolean;
}

const variants: Record<string, string> = {
    primary: 'bg-green-50 text-green-700 border-green-100',
    secondary: 'bg-green-50 text-green-600 border-green-100',
    neutral: 'bg-gray-100 text-gray-500 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
    info: 'bg-gray-50 text-gray-600 border-gray-200',
};

const dotColors: Record<string, string> = {
    primary: 'bg-green-500',
    secondary: 'bg-green-400',
    neutral: 'bg-gray-400',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-gray-400',
};

const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[9px] gap-1',
    md: 'px-2.5 py-1 text-[10px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    style,
    dot = false,
}) => {
    return (
        <span
            className={`
                inline-flex items-center font-black uppercase tracking-widest border rounded-full shadow-sm shadow-black/[0.02]
                ${variants[variant]} 
                ${sizes[size]} 
                ${className}
            `}
            style={style}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shadow-inner`} />
            )}
            {children}
        </span>
    );
};
