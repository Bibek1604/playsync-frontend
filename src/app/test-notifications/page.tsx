/**
 * Notification Demo Page
 * Test the notification system with sound and animations
 */

'use client';

import { useState } from 'react';
import { ToastContainer } from '@/components/NotificationToast';
import { Notification } from '@/features/notifications/api/notification-service';
import { playNotificationSound, playNotificationBeep } from '@/lib/notification-sound';

export default function NotificationDemoPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [idCounter, setIdCounter] = useState(1);

    const addNotification = (type: Notification['type'], title: string, message: string) => {
        const newNotification: Notification = {
            id: `demo-${idCounter}`,
            _id: `demo-${idCounter}`,
            recipient: 'demo-user',
            type,
            title,
            message,
            data: {
                gameId: '507f1f77bcf86cd799439011',
            },
            read: false,
            createdAt: new Date().toISOString(),
            __v: 0,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 3));
        setIdCounter((prev) => prev + 1);
        
        // Play sound
        playNotificationSound();
    };

    const dismissNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const testSound = () => {
        playNotificationSound();
    };

    const testBeep = () => {
        playNotificationBeep();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Notification System Demo
                    </h1>
                    <p className="text-slate-600">
                        Test notifications with sound and animations. Notifications appear in the bottom-left corner.
                    </p>
                </div>

                {/* Sound Test Section */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                        🔊 Sound Tests
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={testSound}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Play Notification Sound
                        </button>
                        <button
                            onClick={testBeep}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Play Double Beep
                        </button>
                    </div>
                </div>

                {/* Notification Types Section */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Notification Types
                        </h2>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Game Join */}
                        <button
                            onClick={() => addNotification(
                                'game_join',
                                'Player Joined',
                                'JohnDoe joined your game "Trivia Night"'
                            )}
                            className="p-4 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-blue-900">Game Join</div>
                            <div className="text-sm text-blue-700">Player joined notification</div>
                        </button>

                        {/* Game Leave */}
                        <button
                            onClick={() => addNotification(
                                'game_leave',
                                'Player Left Game',
                                'JaneDoe left "Trivia Night"'
                            )}
                            className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-orange-900">Game Leave</div>
                            <div className="text-sm text-orange-700">Player left notification</div>
                        </button>

                        {/* Game Full */}
                        <button
                            onClick={() => addNotification(
                                'game_full',
                                'Game is Full!',
                                'Your game "Movie Marathon" has reached maximum players'
                            )}
                            className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-emerald-900">Game Full</div>
                            <div className="text-sm text-emerald-700">Max players reached</div>
                        </button>

                        {/* Completion Bonus */}
                        <button
                            onClick={() => addNotification(
                                'completion_bonus',
                                'Completion Bonus!',
                                '🎉 You earned +100 points for completing "Quiz Night"!'
                            )}
                            className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-yellow-900">Completion Bonus</div>
                            <div className="text-sm text-yellow-700">Bonus points awarded</div>
                        </button>

                        {/* Game Create */}
                        <button
                            onClick={() => addNotification(
                                'game_create',
                                'New Game Available',
                                'AliceJohnson created "Scavenger Hunt"'
                            )}
                            className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-purple-900">Game Created</div>
                            <div className="text-sm text-purple-700">Follower notification</div>
                        </button>

                        {/* Chat Message */}
                        <button
                            onClick={() => addNotification(
                                'chat_message',
                                'New Message',
                                'BobSmith: "Anyone ready for the next question?"'
                            )}
                            className="p-4 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-purple-900">Chat Message</div>
                            <div className="text-sm text-purple-700">In-game chat</div>
                        </button>

                        {/* Game Start */}
                        <button
                            onClick={() => addNotification(
                                'game_start',
                                'Game Started!',
                                '"Trivia Night" has begun. Good luck!'
                            )}
                            className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-orange-900">Game Start</div>
                            <div className="text-sm text-orange-700">Game beginning</div>
                        </button>

                        {/* Game End */}
                        <button
                            onClick={() => addNotification(
                                'game_end',
                                'Game Ended',
                                '"Movie Marathon" has finished. Check results!'
                            )}
                            className="p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left"
                        >
                            <div className="font-semibold text-red-900">Game End</div>
                            <div className="text-sm text-red-700">Game completed</div>
                        </button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Notifications appear in the <strong>bottom-left corner</strong></li>
                        <li>• Each notification plays a <strong>pleasant sound</strong></li>
                        <li>• Notifications auto-dismiss after 5 seconds</li>
                        <li>• Maximum of 3 notifications shown at once</li>
                        <li>• Click the X button to dismiss manually</li>
                        <li>• Click "View Game →" to navigate to game details</li>
                    </ul>
                </div>

                {/* Current Notifications */}
                {notifications.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">
                            Active Notifications: {notifications.length}
                        </h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            {notifications.map((n) => (
                                <div key={n.id}>
                                    • {n.type}: {n.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Container */}
            <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
        </div>
    );
}
