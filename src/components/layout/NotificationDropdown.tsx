import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

export default function NotificationDropdown() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleNotificationClick = (id: string, link?: string) => {
        markAsRead(id);
        if (link) {
            // Navigate to link if provided
            // router.push(link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all border border-transparent hover:border-slate-100"
            >
                <Bell size={22} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-slate-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <Bell size={20} />
                                </div>
                                <p className="text-sm font-medium text-slate-400">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification._id, notification.link)}
                                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.read ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notification.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
