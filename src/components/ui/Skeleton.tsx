/**
 * Loading Skeleton Components
 * Beautiful loading states instead of spinners
 */

'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`bg-slate-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// ===================================
// Specialized Skeleton Loaders
// ===================================

export function GameCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton variant="rounded" height={24} width="60%" className="mb-2" />
          <Skeleton variant="rounded" height={16} width="40%" />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          <Skeleton variant="rounded" height={14} width="40%" className="mb-2" />
          <Skeleton variant="rounded" height={20} width="60%" />
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <Skeleton variant="rounded" height={14} width="40%" className="mb-2" />
          <Skeleton variant="rounded" height={20} width="60%" />
        </div>
      </div>

      {/* Button */}
      <Skeleton variant="rounded" height={40} width="100%" />
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="rounded" height={16} width="60%" className="mb-2" />
        <Skeleton variant="rounded" height={14} width="40%" />
      </div>
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  );
}

export function GameListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PlayerListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <PlayerCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="p-4">
          <Skeleton variant="rounded" height={20} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="p-4 text-left">
                <Skeleton variant="rounded" height={16} width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="rounded" height={36} width="40%" className="mb-2" />
        <Skeleton variant="rounded" height={20} width="60%" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <Skeleton variant="circular" width={48} height={48} className="mb-4" />
            <Skeleton variant="rounded" height={24} width="50%" className="mb-2" />
            <Skeleton variant="rounded" height={32} width="70%" />
          </div>
        ))}
      </div>

      {/* Content */}
      <GameListSkeleton count={6} />
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} max-w-[70%]`}>
            <Skeleton variant="circular" width={40} height={40} />
            <div>
              <Skeleton variant="rounded" height={14} width={100} className="mb-2" />
              <Skeleton
                variant="rounded"
                height={60}
                width={i % 3 === 0 ? 200 : i % 2 === 0 ? 250 : 180}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================================
// Full Page Loader
// ===================================

export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spinning Ring */}
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        
        {/* Inner Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-emerald-600 rounded-full animate-pulse" />
        </div>
      </div>
      
      <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
}

// ===================================
// Inline Loaders
// ===================================

export function InlineSpinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
