
'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2, Calendar, Hash, Users, Type, MapPin } from 'lucide-react';
import { useCreateGame } from '../hooks/useCreateGame';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { NEPAL_DISTRICTS } from '@/lib/nepal-districts';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';

interface CreateGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: 'ONLINE' | 'OFFLINE';
}

export default function CreateGameModal({ isOpen, onClose, category }: CreateGameModalProps) {
    const { createGame, isLoading } = useCreateGame();
    const router = useRouter();
    const { user } = useAuthStore();

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
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Reset/Init form when opening
    React.useEffect(() => {
        if (isOpen) {
            if (!title && user?.fullName) {
                setTitle(`${user.fullName}'s ${category === 'ONLINE' ? 'Lobby' : 'Game'}`);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user, category]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        // Process tags: ensure at least one tag exists to satisfy backend validation
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagArray.length === 0) {
            formData.append('tags', 'Gaming'); // Default fallback tag
        } else {
            tagArray.forEach(tag => formData.append('tags', tag));
        }

        formData.append('maxPlayers', maxPlayers);
        formData.append('startTime', new Date(startTime).toISOString());
        formData.append('endTime', new Date(endTime).toISOString());
        formData.append('category', category); // Important: backend sets default ONLINE if missing, but we want explicit control
        // Map district selection to locationName to avoid conflict with GeoJSON object
        if (location) formData.append('locationName', location);

        if (image) {
            formData.append('image', image);
        }

        if (category === 'OFFLINE' && latitude && longitude) {
            formData.append('latitude', latitude.toString());
            formData.append('longitude', longitude.toString());
            // locationName is already appended above from the 'location' state
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
            setLatitude(null);
            setLongitude(null);

            // Redirect to game chat/lobby
            if (newGame && newGame._id) {
                router.push(`/games/${category.toLowerCase()}/${newGame._id}`);
            }
        } catch (error: any) {
            console.error('Failed to create game:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to create game lobby';
            const validationErrors = error?.response?.data?.errors;

            if (validationErrors && Array.isArray(validationErrors)) {
                toast.error(`${errorMessage}: ${validationErrors[0].message}`);
            } else {
                toast.error(errorMessage);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Create {category === 'ONLINE' ? 'Online' : 'Offline'} Session
                        </h2>
                        <p className="text-sm font-medium text-gray-400">
                            Set up a new workspace for players to sync.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="relative group">
                        <label className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Cover Image
                        </label>
                        <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-green-400 transition-all cursor-pointer overflow-hidden">
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
                            className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the rules, requirements, etc..."
                            className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium resize-none shadow-sm"
                        />
                    </div>

                    {category === 'OFFLINE' && (
                        <div className="space-y-4">
                            {!latitude ? (
                                <div className="space-y-2 relative">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <MapPin size={14} /> Choose Region
                                    </label>
                                    <select
                                        required
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled>Select a location</option>
                                        {NEPAL_DISTRICTS.map((district) => (
                                            <option key={district} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none mb-1">Precise Location Active</p>
                                            <p className="text-sm font-bold text-gray-700">Coordinates Locked Successfully</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setLatitude(null); setLongitude(null); }}
                                        className="text-[10px] font-bold text-green-600 uppercase hover:underline"
                                    >
                                        Reset
                                    </button>
                                </div>
                            )}

                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFetchingLocation(true);
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setLatitude(pos.coords.latitude);
                                                setLongitude(pos.coords.longitude);
                                                setIsFetchingLocation(false);
                                                toast.success('Coordinates locked');
                                            },
                                            () => {
                                                setIsFetchingLocation(false);
                                                toast.error('Location access denied');
                                            }
                                        );
                                    }}
                                    className={`w-full py-3 rounded-lg border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${latitude
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    {isFetchingLocation ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                                    {latitude ? `Location Synced (${latitude.toFixed(4)}, ${longitude?.toFixed(4)})` : 'Synchronize Precise Location'}
                                </button>
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
                                placeholder="fps, strategy, ranked"
                                className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium"
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
                                className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} /> Start Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium"
                            />
                            <p className="text-[10px] text-gray-400">Launch time.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar size={14} /> End Time
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-5 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all font-medium"
                            />
                            <p className="text-[10px] text-gray-400">Termination time.</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
