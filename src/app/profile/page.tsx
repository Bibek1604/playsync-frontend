"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Globe, Gamepad2, Password,
  Linkedin, Github, Save, ArrowLeft, Camera 
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { profile, fetchProfile, updateProfile, isLoading, error } = useAuthStore();
  const router = useRouter();

  // Local state for the form
  const [formData, setFormData] = useState({
    bio: '',
    avatar: '',
    location: '',
    website: '',
    favoriteGame: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  // Sync local state when profile is fetched from the store
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        location: profile.location || '',
        website: profile.website || '',
        favoriteGame: profile.favoriteGame || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || ''
        }
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      // Optional: Add a "Saved!" toast notification here
      console.log("Profile updated successfully");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Public Profile */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Public Profile</h2>
              <p className="text-sm text-gray-500">This information will be visible to other users.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar Preview & URL */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-green-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=dcfce7&color=166534')}
                      />
                    ) : (
                      <User className="w-10 h-10 text-green-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                    <Camera className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                <div className="flex-1 w-full text-sm">
                  <label className="block font-medium text-gray-700 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                    placeholder="https://images.com/your-photo.jpg"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About You</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                  placeholder="Share a bit about your journey..."
                />
              </div>

              {/* Grid: Location & Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="number"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Social & Gaming */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Connections & Interests</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Password className="w-4 h-4 text-purple-500" /> oldpassword
                </label>
                <input
                  name="oldpassword"
                  value={formData.favoriteGame}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter your old password"
                />
              </div>
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Password className="w-4 h-4 text-purple-500" /> New Password
                </label>
                <input
                  name="newpassword"
                  value={formData.favoriteGame}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="new password"
                />
              </div>


            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/** Helper Component for Social Inputs */
function SocialInput({ icon, label, name, value, onChange }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 flex justify-center">{icon}</div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
        placeholder={`${label} URL`}
      />
    </div>
  );
}