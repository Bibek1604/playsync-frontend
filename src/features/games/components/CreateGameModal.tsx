
'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2, Calendar, Hash, Users, Type, MapPin } from 'lucide-react';
import { useCreateGame } from '../hooks/useCreateGame';
import { NEPAL_DISTRICTS } from '@/lib/nepal-districts';
import { useRouter } from 'next/navigation';

interface CreateGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: 'ONLINE' | 'OFFLINE';
}

export default function CreateGameModal({ isOpen, onClose, category }: CreateGameModalProps) {
    const { createGame, isLoading } = useCreateGame();
    const router = useRouter(); // Add router

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('10');
    // Default start time: now
    const [startTime, setStartTime] = useState(() => new Date().toISOString().slice(0, 16));
    // Default end time: 1 hour from now
    const [endTime, setEndTime] = useState(() => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        return date.toISOString().slice(0, 16);
    });
    const [image, setImage] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        // Process tags: split by comma if string
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        tagArray.forEach(tag => formData.append('tags[]', tag));

        formData.append('maxPlayers', maxPlayers);
        formData.append('startTime', new Date(startTime).toISOString());
        formData.append('endTime', new Date(endTime).toISOString());
        formData.append('category', category); // Important: backend sets default ONLINE if missing, but we want explicit control
        if (location) formData.append('location', location);

        if (image) {
            formData.append('image', image);
        }

        try {
            const newGame = await createGame(formData);
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setLocation('');
            setTags('');
            setStartTime(new Date().toISOString().slice(0, 16));
            setImage(null);

            // Redirect to game chat/lobby
            if (newGame && newGame._id) {
                router.push(`/games/${category.toLowerCase()}/${newGame._id}`);
            }
        } catch (error) {
            console.error('Failed to create game:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            Create {category === 'ONLINE' ? 'Online' : 'Offline'} Game
                        </h2>
                        <p className="text-sm font-medium text-gray-500">
                            Set up a new game lobby for players to join.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="relative group">
                        <label className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Game Cover Image
                        </label>
                        <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 hover:border-emerald-400 transition-all cursor-pointer overflow-hidden">
                            {image ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-medium">Click to change</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                                    <Upload className="w-8 h-8 mb-3 text-gray-300" />
                                    <p className="text-sm font-medium">Click to upload cover image</p>
                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (MAX. 5MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImage(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <Type size={14} /> Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Counter Strike Tournament"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the game rules, requirements, etc..."
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    {/* Location (Offline Only) */}
                    {category === 'OFFLINE' && (
                        <div className="space-y-2 relative">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <MapPin size={14} /> Location
                            </label>
                            <select
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium appearance-none"
                            >
                                <option value="" disabled>Select a location</option>
                                {NEPAL_DISTRICTS.map((district) => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Hash size={14} /> Tags
                            </label>
                            <input
                                type="text"
                                required
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="fps, strategy, ranked (comma separated)"
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Max Players */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Users size={14} /> Max Players
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="1000"
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} /> Start Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                            />
                            <p className="text-xs text-gray-400">Event starts at.</p>
                        </div>

                        {/* End Time */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} /> End Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                            />
                            <p className="text-xs text-gray-400">Event ends at.</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Game'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
