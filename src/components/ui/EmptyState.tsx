/**
 * Empty State Components
 * Professional empty states for better UX
 */

'use client';

import React, { ReactNode } from 'react';
import { LucideIcon, Gamepad2, Plus, History, Users, Search, AlertCircle, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 ${className}`}>
      {/* Icon */}
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 animate-in zoom-in-95 duration-500">
          <Icon className="text-slate-400" size={32} />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 max-w-md mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 delay-300"
        >
          {action.icon && <action.icon size={18} />}
          {action.label}
        </button>
      )}

      {/* Custom Children */}
      {children && (
        <div className="mt-4 animate-in fade-in duration-500 delay-400">
          {children}
        </div>
      )}
    </div>
  );
}

// ===================================
// Specialized Empty States
// ===================================

export function NoGamesEmptyState({ onCreateGame }: { onCreateGame: () => void }) {
  return (
    <EmptyState
      icon={Gamepad2}
      title="No Games Available"
      description="Be the first to create a game and invite your friends to join!"
      action={{
        label: 'Create Game',
        onClick: onCreateGame,
        icon: Plus,
      }}
    />
  );
}

export function NoHistoryEmptyState() {
  return (
    <EmptyState
      icon={History}
      title="No Game History"
      description="Your game history will appear here once you start playing."
    />
  );
}

export function NoPlayersEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No Players Yet"
      description="Waiting for players to join the game..."
    />
  );
}

export function SearchEmptyState({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try a different search term.`
          : 'Try adjusting your search or filters.'
      }
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Something Went Wrong"
      description="We couldn't load the data. Please try again."
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
              icon: RefreshCw,
            }
          : undefined
      }
    />
  );
}
