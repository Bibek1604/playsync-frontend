/**
 * Centralized Toast Notification System
 * Uses react-hot-toast for non-blocking, beautiful toast notifications
 */

'use client';

import { Toaster, toast as hotToast } from 'react-hot-toast';
import { soundManager } from './sound';


/**
 * Toast Configuration Component
 * Add this to your root layout
 */
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            containerClassName="mt-4 mr-4"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#FFFFFF',
                    color: '#1F2937',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    maxWidth: '450px',
                    border: '1px solid #E5E7EB',
                },
                success: {
                    iconTheme: {
                        primary: '#16A34A',
                        secondary: '#FFFFFF',
                    },
                    style: {
                        borderLeft: '4px solid #16A34A',
                    }
                },
                error: {
                    iconTheme: {
                        primary: '#DC2626',
                        secondary: '#FFFFFF',
                    },
                    style: {
                        borderLeft: '4px solid #DC2626',
                    }
                },
                loading: {
                    style: {
                        borderBottom: '2px solid #16A34A',
                    },
                },
            }}
        />
    );
}


/**
 * Toast API - Use these functions throughout your app
 */
export const toast = {
    /**
     * Show success message
     */
    success: (message: string) => {
        soundManager.success();
        hotToast.success(message);
    },

    /**
     * Show error message
     */
    error: (message: string) => {
        soundManager.error();
        hotToast.error(message);
    },

    /**
     * Show info message
     */
    info: (message: string) => {
        soundManager.info();
        hotToast(message, {
            icon: 'ℹ️',
            style: {
                background: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                borderLeft: '4px solid #3B82F6',
            },
        });
    },

    /**
     * Show warning message
     */
    warning: (message: string) => {
        soundManager.warning();
        hotToast(message, {
            icon: '⚠️',
            style: {
                background: '#FFFBEB',
                color: '#92400E',
                border: '1px solid #FDE68A',
                borderLeft: '4px solid #F59E0B',
            },
        });
    },

    /**
     * Show loading message (returns toast ID for dismissal)
     */
    loading: (message: string) => {
        return hotToast.loading(message);
    },

    /**
     * Dismiss a specific toast
     */
    dismiss: (toastId: string) => {
        hotToast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
        hotToast.dismiss();
    },

    /**
     * Show confirmation dialog with promise
     * Returns a promise that resolves to true/false
     */
    confirm: async (message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> => {
        return new Promise((resolve) => {
            hotToast.custom(
                (t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex flex-col overflow-hidden border border-slate-200`}
                    >
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-6 w-6 text-amber-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-semibold text-slate-900">{message}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-200">
                            <button
                                onClick={() => {
                                    hotToast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    hotToast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: 'top-center',
                }
            );
        });
    },

    /**
     * Show prompt dialog with input
     * Returns a promise that resolves to the input value or null if cancelled
     */
    prompt: async (
        message: string,
        defaultValue = '',
        placeholder = '',
        confirmText = 'Submit',
        cancelText = 'Cancel'
    ): Promise<string | null> => {
        return new Promise((resolve) => {
            let inputValue = defaultValue;

            hotToast.custom(
                (t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex flex-col overflow-hidden border border-slate-200`}
                    >
                        <div className="p-4">
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-slate-900 mb-2">{message}</p>
                                <input
                                    type="text"
                                    defaultValue={defaultValue}
                                    placeholder={placeholder}
                                    onChange={(e) => {
                                        inputValue = e.target.value;
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            hotToast.dismiss(t.id);
                                            resolve(inputValue || null);
                                        }
                                        if (e.key === 'Escape') {
                                            hotToast.dismiss(t.id);
                                            resolve(null);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-200">
                            <button
                                onClick={() => {
                                    hotToast.dismiss(t.id);
                                    resolve(null);
                                }}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    hotToast.dismiss(t.id);
                                    resolve(inputValue || null);
                                }}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                ),
                {
                    duration: Infinity,
                    position: 'top-center',
                }
            );
        });
    },

    /**
     * Promise-based toast (for async operations)
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((err: unknown) => string);
        }
    ) => {
        return hotToast.promise(promise, messages);
    },
};

/**
 * Example Usage:
 * 
 * import { toast } from '@/lib/toast';
 * 
 * // Simple messages
 * toast.success('Profile updated!');
 * toast.error('Failed to save changes');
 * toast.warning('Please fill all fields');
 * toast.info('New version available');
 * 
 * // Loading state
 * const loadingToast = toast.loading('Uploading...');
 * // ... after upload
 * toast.dismiss(loadingToast);
 * toast.success('Upload complete!');
 * 
 * // Confirmation
 * const confirmed = await toast.confirm('Delete this item?');
 * if (confirmed) {
 *   // delete item
 * }
 * 
 * // Prompt
 * const name = await toast.prompt('Enter your name:', '', 'Name');
 * if (name) {
 *   // use name
 * }
 * 
 * // Promise
 * await toast.promise(
 *   fetchData(),
 *   {
 *     loading: 'Loading data...',
 *     success: 'Data loaded!',
 *     error: 'Failed to load data'
 *   }
 * );
 */
