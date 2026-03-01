import React, { useState } from 'react';
import { API_URL } from '@/lib/constants';

interface AvatarProps {
    src?: string;
    alt?: string;
    fallback: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    fallback,
    size = 'md',
    className = ''
}) => {
    const [imgError, setImgError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-xl',
        xl: 'w-20 h-20 text-3xl',
        '2xl': 'w-28 h-28 text-4xl',
    };

    const getInitials = (name: string) => {
        return (name || 'U')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // If src starts with /uploads, it needs the backend API URL
    const imageSrc = src?.startsWith('/uploads') ? `${API_URL}${src}` : src;
    const showImage = imageSrc && !imgError;

    return (
        <div
            className={`relative flex shrink-0 overflow-hidden rounded-xl ${sizeClasses[size]} ${className}`}
            style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                border: '1px solid rgba(22,163,74,0.2)',
            }}
        >
            {showImage ? (
                <img
                    src={imageSrc}
                    alt={alt || fallback}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div
                    className="flex h-full w-full items-center justify-center font-black"
                    style={{ color: 'rgba(255,255,255,0.95)' }}
                >
                    {getInitials(fallback)}
                </div>
            )}
        </div>
    );
};
