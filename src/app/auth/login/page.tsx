"use client"
import React, { useState } from 'react';
import { Chrome, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useLogin();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white font-poppins">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-200 h-200 bg-green-50/20 rounded-full blur-[120px] -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-green-50/10 rounded-full blur-[100px] -ml-64 -mb-64" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>

      <div className="w-full max-w-110 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-100 transition-transform group-hover:scale-105">
              <Zap size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-gray-900">
              Play<span className="text-green-600">Sync</span>
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Elevate your gaming workspace.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-600" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-green-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-bold animate-in shake">
                <ShieldCheck size={18} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              isFullWidth
              size="lg"
              className="h-12 rounded-lg font-bold text-base tracking-tight shadow-sm"
            >
              Sign In to PlaySync
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              <span className="px-4 bg-white">Trusted Access</span>
            </div>
          </div>

          {/* Social login */}
          <button className="w-full py-3.5 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-green-200 hover:text-green-600 transition-all active:scale-[0.98] group/social">
            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 group-hover/social:border-green-100 transition-colors">
              <Chrome size={16} className="text-gray-400 group-hover/social:text-green-600" />
            </div>
            Sign in with Google Master Key
          </button>
        </div>

        {/* Footer link */}
        <p className="text-center mt-10 text-gray-500 font-medium">
          New to the arena?{' '}
          <Link href="/auth/register" className="text-green-600 font-bold hover:underline underline-offset-4 decoration-2">Create Account</Link>
        </p>
      </div >
    </div >
  );
}