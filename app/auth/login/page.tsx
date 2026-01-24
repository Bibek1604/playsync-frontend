"use client"
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

export default function EnhancedLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled in the store
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[100px] -z-10 opacity-40" />

      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 backdrop-blur-sm bg-white/80">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 ring-1 ring-emerald-100">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome to <span className="text-emerald-500">PLAYSYNC</span></h1>
            <p className="text-gray-500 mt-2 font-medium">Please enter your credentials to continue</p>
          </div>

          <div className="space-y-6">
            <button className="w-full py-3 px-4 border border-gray-200 rounded-2xl font-semibold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98]">
              <Chrome size={20} className="text-emerald-500" />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 text-gray-300">
              <div className="h-[1px] bg-gray-100 flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">or use email</span>
              <div className="h-[1px] bg-gray-100 flex-1" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all peer"
                  placeholder=" "
                  required
                />
                <label className="absolute left-5 top-4 text-gray-400 pointer-events-none transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:bg-emerald-500 peer-focus:text-white peer-focus:px-2 peer-focus:rounded-md peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-emerald-500 peer-[:not(:placeholder-shown)]:text-white peer-[:not(:placeholder-shown)]:px-2">
                  Email Address
                </label>
              </div>

              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all peer"
                  placeholder=" "
                  required
                />
                <label className="absolute left-5 top-4 text-gray-400 pointer-events-none transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:bg-emerald-500 peer-focus:text-white peer-focus:px-2 peer-focus:rounded-md peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-emerald-500 peer-[:not(:placeholder-shown)]:text-white peer-[:not(:placeholder-shown)]:px-2">
                  Password
                </label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group transition-all"
              >
                {isLoading ? 'Logging in...' : 'Login to Dashboard'}
                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          New here? <Link href="/auth/register" className="text-emerald-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}