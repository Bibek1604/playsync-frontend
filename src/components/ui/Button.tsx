'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { InlineSpinner } from './Skeleton';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-[0.98]',
  secondary: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100',
  outline: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900',
  danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
};

const sizes: Record<string, string> = {
  xs: 'px-3 py-1.5 text-[10px] rounded-lg gap-1.5 uppercase tracking-widest',
  sm: 'px-4 py-2 text-xs rounded-lg gap-1.5 font-bold',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2 font-bold',
  lg: 'px-7 py-3.5 text-base rounded-lg gap-2 font-black tracking-tight',
  xl: 'px-9 py-4.5 text-lg rounded-lg gap-2.5 font-black tracking-tight',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const iconSizes = { xs: 12, sm: 13, md: 16, lg: 18, xl: 22 };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 select-none
        focus:outline-none focus:ring-4 focus:ring-green-100
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${isFullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <InlineSpinner size={iconSizes[size]} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon size={iconSizes[size]} />}
          {children}
          {RightIcon && <RightIcon size={iconSizes[size]} />}
        </>
      )}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  label?: string;
}

export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  label,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-lg',
    lg: 'w-12 h-12 rounded-xl',
  };

  const iconSizes = { xs: 13, sm: 15, md: 18, lg: 22 };

  return (
    <button
      className={`
        inline-flex items-center justify-center 
        transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-100
        disabled:opacity-40 disabled:cursor-not-allowed 
        active:scale-[0.95]
        ${variants[variant]}
        ${sizeClasses[size]} 
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-label={label}
      {...props}
    >
      {isLoading ? <InlineSpinner size={iconSizes[size]} /> : <Icon size={iconSizes[size]} />}
    </button>
  );
}
