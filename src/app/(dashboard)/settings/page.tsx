"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    User,
    MapPin,
    Gamepad2,
    Phone,
    Lock,
    Camera,
    Save,
    Award,
    Trophy,
    Gift,
    Sun,
    Moon,
    Monitor,
    History,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useTheme } from "next-themes";
import { RecentGamesList } from "@/features/history/components/RecentGamesList";
import { soundManager } from "@/lib/sound";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { authService } from "@/features/auth/api/auth-service";
import { API_URL } from "@/lib/constants";
import { NEPAL_DISTRICTS } from "@/lib/nepal-districts";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { scorecardService } from "@/features/scorecard/api/scorecard-service";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
    // Use selectors to prevent unnecessary re-renders and ensure stable function references
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const isLoading = useAuthStore((state) => state.isLoading);

    const { data: myScorecard } = useQuery({
        queryKey: ['myScorecard'],
        queryFn: scorecardService.getMyScorecard,
        enabled: !!user
    });

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        place: "",
        favoriteGame: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    // Add file state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active Tab State
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'points' | 'appearance' | 'history'>('profile');
    const { theme, setTheme } = useTheme();

    // Sound Settings
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Load sound preference from localStorage
    useEffect(() => {
        const savedSoundPref = localStorage.getItem('playsync-sound-enabled');
        if (savedSoundPref !== null) {
            const enabled = savedSoundPref === 'true';
            setSoundEnabled(enabled);
            soundManager.setEnabled(enabled);
        }
    }, []);

    // Toggle sound and save to localStorage
    const toggleSound = () => {
        const newValue = !soundEnabled;
        setSoundEnabled(newValue);
        soundManager.setEnabled(newValue);
        localStorage.setItem('playsync-sound-enabled', String(newValue));
        toast.success(newValue ? 'Notification sounds enabled 🔊' : 'Notification sounds disabled 🔇');
    };

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Update form when profile/user data is available
    useEffect(() => {
        if (user || profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => ({
                ...prev,
                fullName: profile?.fullName || user?.fullName || "",
                phone: profile?.phone || "",
                place: profile?.place || "",
                favoriteGame: profile?.favoriteGame || "",
            }));

            // Set profile picture preview if available
            const profilePicUrl = profile?.profilePicture;
            if (profilePicUrl) {
                // Construct full URL if it's a relative path
                const fullUrl = profilePicUrl.startsWith('http')
                    ? profilePicUrl
                    : `${API_URL}${profilePicUrl}`;
                setPreviewUrl(fullUrl);
            }
        }
    }, [user, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast.error('Only JPG and PNG files are allowed');
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        // Create FormData object
        const data = new FormData();

        // Append text fields with correct backend field names
        data.append('fullName', formData.fullName);
        if (formData.phone) data.append('phone', formData.phone);
        if (formData.place) data.append('place', formData.place);
        if (formData.favoriteGame) data.append('favoriteGame', formData.favoriteGame);

        // Append file if selected (backend expects 'profilePicture')
        if (selectedFile) {
            data.append('profilePicture', selectedFile);
        }

        // Call update action
        const success = await updateProfile(data);
        if (success) {
            toast.success("Profile updated successfully!");
            setSelectedFile(null);
        } else {
            toast.error("Failed to update profile.");
        }
    };

    const handlePasswordChange = async () => {
        // Validate password fields
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }

        try {
            await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            });
            toast.success("Password changed successfully!");
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            }));
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const errorMsg = err.response?.data?.message || "Failed to change password";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-10 font-sans min-h-screen max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">Account Protocol</h1>
                <p className="text-gray-500 font-medium text-sm tracking-wide">
                    Manage your synchronization identity and security modules.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation for Settings */}
                <div className="lg:col-span-3 space-y-1.5">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'profile'
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <User size={16} /> Profile
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'security'
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Lock size={16} /> Security
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('points')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'points'
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Award size={16} /> Rewards
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'appearance'
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Monitor size={16} /> Interface
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center justify-between px-5 py-3.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${activeTab === 'history'
                            ? "bg-green-600 text-white shadow-lg shadow-green-100"
                            : "text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <History size={16} /> Records
                        </div>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <>
                            {/* Profile Picture Section */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center text-green-600 text-3xl font-extrabold border-4 border-gray-50 shadow-inner overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent pointer-events-none" />
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="relative z-10">{formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white border-4 border-white shadow-lg hover:scale-110 active:scale-90 transition-all cursor-pointer z-20 group-hover:rotate-12"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight mb-1">Neural Avatar</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-xs mb-4">
                                        Your primary identification module within the synchronization sector.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUploadClick}
                                            className="px-5 py-2.5 bg-gray-900 text-white hover:bg-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                        >
                                            Update Module
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="px-5 py-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            Shutdown
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information Form */}
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none transition-transform group-hover:scale-110" />
                                <div>
                                    <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                                        <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
                                            <User size={20} />
                                        </div>
                                        Genetic Protocol
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Callsign / Identity</label>
                                            <div className="relative group/field">
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Neural Frequency (Phone)</label>
                                            <div className="relative group/field">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                                    placeholder="+977-98..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Geospatial Sector</label>
                                            <div className="relative group/field">
                                                <select
                                                    name="place"
                                                    value={formData.place}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 appearance-none shadow-sm"
                                                >
                                                    <option value="" disabled>Select Sector</option>
                                                    {NEPAL_DISTRICTS.map((district) => (
                                                        <option key={district} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Favorite Combat Module</label>
                                            <div className="relative group/field">
                                                <input
                                                    type="text"
                                                    name="favoriteGame"
                                                    value={formData.favoriteGame}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                                    placeholder="Valorant / FIFA / CS2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-100" />

                                {/* Form Actions (Only for Profile) */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button className="px-6 py-3 text-gray-400 hover:text-gray-900 font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 rounded-lg transition-all active:scale-95">
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="px-10 py-3.5 bg-green-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {isLoading ? "Synchronizing..." : "Update Protocol"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
                                        <Lock size={20} />
                                    </div>
                                    Security Protocol
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 max-w-lg leading-relaxed">
                                    Ensure your synchronization channel is encrypted with a high-entropy passphrase.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Current Passphrase</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            placeholder="••••••••"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">New Passphrase</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="••••••••"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Passphrase</label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            placeholder="••••••••"
                                            value={formData.confirmNewPassword}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-50/50 rounded-lg outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-6">
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={isLoading}
                                        className="px-10 py-3.5 bg-gray-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? "Updating..." : "Recalibrate Passphrase"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Points Tab */}
                    {activeTab === 'points' && (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-10 animate-fade-in relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/30 rounded-full -translate-y-32 translate-x-32 pointer-events-none transition-transform group-hover:scale-110" />

                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-10 flex items-center gap-3 uppercase tracking-tight">
                                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
                                        <Award size={20} />
                                    </div>
                                    Reward Matrix
                                </h2>

                                <div className="bg-gray-900 rounded-xl p-10 text-white shadow-2xl relative overflow-hidden mb-12">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent pointer-events-none" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-[0.3em] mb-4">Total Accumulated Points</p>
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-6xl font-black tracking-tighter">{myScorecard?.points || (myScorecard as any)?.totalPoints || 0}</h3>
                                            <Award size={48} className="text-green-500 animate-pulse" />
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium mt-6 max-w-sm leading-relaxed">
                                            Your quantitative value within the global PlaySync ecosystem. Redeemable for exclusive access.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.25em]">Acquisition Channels</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-5 hover:bg-white hover:border-green-100 transition-all group/item shadow-sm">
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 text-green-600 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                                                <Gamepad2 size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Sync Active</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">+50 Index / Game</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-5 hover:bg-white hover:border-green-100 transition-all group/item shadow-sm">
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 text-green-600 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                                                <Trophy size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Apex Win</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">+500 Index / Tourney</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-gray-100">
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.25em] mb-8">Redemption Hub</h3>
                                    <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                                        <Gift className="mx-auto mb-4 text-gray-300" size={40} />
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Marketplace Initialization: <span className="text-green-600">Pending...</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interface Tab */}
                    {activeTab === 'appearance' && (
                        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-10 animate-fade-in group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-10 flex items-center gap-3 uppercase tracking-tight">
                                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
                                        <Monitor size={20} />
                                    </div>
                                    Interface Protocol
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-5 rounded-xl border-2 transition-all flex flex-col gap-4 text-left ${theme === 'light'
                                            ? 'border-green-600 bg-white shadow-xl shadow-green-50'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="bg-white rounded-lg aspect-[16/10] flex items-center justify-center border border-gray-100 shadow-inner">
                                            <Sun className={theme === 'light' ? 'text-green-600' : 'text-gray-300'} size={32} />
                                        </div>
                                        <div className="px-1">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-green-600' : 'text-gray-500'}`}>Static Light</span>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">High visibility</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-5 rounded-xl border-2 transition-all flex flex-col gap-4 text-left ${theme === 'dark'
                                            ? 'border-green-600 bg-white shadow-xl shadow-green-50'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="bg-gray-900 rounded-lg aspect-[16/10] flex items-center justify-center border border-gray-800 shadow-inner">
                                            <Moon className={theme === 'dark' ? 'text-green-600' : 'text-gray-600'} size={32} />
                                        </div>
                                        <div className="px-1">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-green-600' : 'text-gray-500'}`}>Encrypted Dark</span>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Tactical mode</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`p-5 rounded-xl border-2 transition-all flex flex-col gap-4 text-left ${theme === 'system'
                                            ? 'border-green-600 bg-white shadow-xl shadow-green-50'
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="bg-gradient-to-br from-white to-gray-900 rounded-lg aspect-[16/10] flex items-center justify-center border border-gray-100 shadow-inner">
                                            <Monitor className={theme === 'system' ? 'text-green-600' : 'text-gray-400'} size={32} />
                                        </div>
                                        <div className="px-1">
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'system' ? 'text-green-600' : 'text-gray-500'}`}>Cloud Sync</span>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">OS adaptive</p>
                                        </div>
                                    </button>
                                </div>

                                {/* Sound Settings */}
                                <div className="mt-12 pt-12 border-t border-gray-100">
                                    <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.25em] mb-8">Auditory Feedback</h3>
                                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100 group/btn hover:bg-white hover:border-green-100 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center transition-all ${soundEnabled ? 'text-green-600 shadow-md shadow-green-50' : 'text-gray-300'}`}>
                                                {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">Audio Synchronization</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Tactical sound alerts</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleSound}
                                            className={`relative w-14 h-7 rounded-full transition-all active:scale-95 ${soundEnabled ? 'bg-green-600 shadow-lg shadow-green-100' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-md shadow-sm transition-transform ${soundEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Records Tab */}
                    {activeTab === 'history' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                                <h2 className="text-xl font-extrabold text-gray-900 mb-2 flex items-center gap-3 uppercase tracking-tight">
                                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
                                        <History size={20} />
                                    </div>
                                    Sync Records
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Historical ledger of all global combat synchronization events.
                                </p>
                            </div>
                            <RecentGamesList />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
