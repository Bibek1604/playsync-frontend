"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  User, MapPin, Globe, Gamepad2,
  Save, ArrowLeft, Loader2, Camera, FileText
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { useRouter } from 'next/navigation';
import { Card, Button, Avatar } from '@/components/ui';
import { toast } from '@/lib/toast';
import { getImageUrl } from '@/lib/constants';

export default function ProfilePage() {
  const { profile, fetchProfile, updateProfile, isLoading, error } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    avatar: '',
    bio: '',
    place: '',
    phone: '',
    favoriteGame: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        avatar: profile.avatar || profile.profilePicture || '',
        bio: profile.bio || '',
        place: profile.place || '',
        phone: profile.phone || '',
        favoriteGame: profile.favoriteGame || '',
      });
      
      const avatarUrl = profile.avatar || profile.profilePicture;
      if (avatarUrl) {
        setPreviewUrl(getImageUrl(avatarUrl) || '');
      } else {
        setPreviewUrl('');
      }
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File size should be less than 2MB");
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Only JPEG, PNG, and WEBP images are allowed");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    if (formData.bio) formDataToSend.append('bio', formData.bio);
    if (formData.place) formDataToSend.append('place', formData.place);
    if (formData.phone) formDataToSend.append('phone', formData.phone);
    if (formData.favoriteGame) formDataToSend.append('favoriteGame', formData.favoriteGame);
    if (selectedFile) formDataToSend.append('avatar', selectedFile);

    const success = await updateProfile(formDataToSend);
    if (success) {
      toast.success("Profile updated successfully");
      setSelectedFile(null);
      // Refresh profile data to reflect changes
      await fetchProfile();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Profile Settings</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-10">
              <div className="relative">
                <Avatar
                  src={previewUrl}
                  fallback={formData.fullName || 'P'}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-colors"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Favorite Game</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="favoriteGame"
                    value={formData.favoriteGame}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                    placeholder="What do you love to play?"
                  />
                </div>
              </div>
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              variant="primary"
              size="lg"
              leftIcon={Save}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}