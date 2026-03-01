import React from 'react';

/**
 * Enhanced Light-theme Card component
 */

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
    glow?: boolean;
    variant?: 'default' | 'glass' | 'white' | 'elevated' | 'subtle';
}

const variants: Record<string, string> = {
    default: 'bg-white border-gray-100 shadow-sm',
    glass: 'bg-white/70 backdrop-blur-md border-white/20 shadow-sm',
    white: 'bg-white border-gray-100',
    elevated: 'bg-white border-gray-100 shadow-md',
    subtle: 'bg-gray-50/50 border-gray-100 shadow-none',
};

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    hover = true,
    glow = false,
    variant = 'default',
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                rounded-xl p-6 transition-all duration-300 ease-out border
                ${variants[variant]}
                ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
                ${hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
                ${glow ? 'shadow-lg shadow-green-100/50' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
