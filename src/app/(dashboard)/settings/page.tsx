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
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { authService } from "@/features/auth/api/auth-service";
import { API_URL } from "@/lib/constants";
import { NEPAL_DISTRICTS } from "@/lib/nepal-districts";
import { AxiosError } from "axios";

export default function SettingsPage() {
    // Use selectors to prevent unnecessary re-renders and ensure stable function references
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const isLoading = useAuthStore((state) => state.isLoading);

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
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

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
                alert('File size must be less than 2MB');
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                alert('Only JPG and PNG files are allowed');
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
            alert("Profile updated successfully!");
            setSelectedFile(null);
        } else {
            alert("Failed to update profile.");
        }
    };

    const handlePasswordChange = async () => {
        // Validate password fields
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
            alert("Please fill in all password fields");
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            alert("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 8) {
            alert("New password must be at least 8 characters");
            return;
        }

        try {
            await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            });
            alert("Password changed successfully!");
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
            alert(errorMsg);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Manage your personal information and security preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation for Settings */}
                <div className="lg:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'profile'
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'security'
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-6">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <>
                            {/* Profile Picture Section */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 text-3xl font-black border-4 border-white shadow-lg overflow-hidden">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                    >
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Profile Photo</h3>
                                    <p className="text-xs text-slate-400 mb-3 max-w-xs">
                                        This will be displayed on your profile and to other players.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUploadClick}
                                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Upload New
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information Form */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <User className="text-emerald-500" size={24} />
                                        Personal Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={18} />
                                                <select
                                                    name="place"
                                                    value={formData.place}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                                    className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900 appearance-none"
                                                >
                                                    <option value="" disabled>Select your district</option>
                                                    {NEPAL_DISTRICTS.map((district) => (
                                                        <option key={district} value={district}>
                                                            {district}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Favorite Game</label>
                                            <div className="relative group">
                                                <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="favoriteGame"
                                                    value={formData.favoriteGame}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100" />

                                {/* Form Actions (Only for Profile) */}
                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <button className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={18} />
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Lock className="text-emerald-500" size={24} />
                                    Security
                                </h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                placeholder="••••••••"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                placeholder="••••••••"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="confirmNewPassword"
                                                placeholder="••••••••"
                                                value={formData.confirmNewPassword}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-500/20 rounded-xl outline-none transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-6">
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                                    >
                                        {isLoading ? "Changing..." : "Change Password"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
