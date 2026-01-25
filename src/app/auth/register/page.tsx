"use client"
import React, { useState } from 'react';
import { CheckCircle2, Zap, Globe, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useRouter } from 'next/navigation';

const features = [
  { icon: <Zap size={18} />, title: "Real-time Syncing", desc: "No lag, pure performance." },
  { icon: <Globe size={18} />, title: "Global Access", desc: "Sync from anywhere." },
  { icon: <Shield size={18} />, title: "Enterprise Security", desc: "Your data is encrypted." },
];

export default function EnhancedRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useRegister();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName} ${lastName}`.trim();
    const success = await register({ fullName, email, password, confirmPassword });
    if (success) {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side: Brand & Social Proof */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-500 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-50" />

        <div className="z-10">
          <h2 className="text-white text-4xl font-black mb-6">Start Syncing Your <br />World with Us.</h2>
          <div className="space-y-6 mt-12">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md">
                <div className="p-2 bg-white rounded-xl text-emerald-600">{f.icon}</div>
                <div>
                  <h4 className="text-white font-bold">{f.title}</h4>
                  <p className="text-emerald-50 text-sm opacity-80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10">
          <p className="text-emerald-100 font-medium">© 2026 PLAYSYNC Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sign Up</h1>
            <p className="text-gray-500 mt-2 font-medium">Join 2,000+ users syncing today.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="john@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
              {/* Password Strength Indicator */}
              <div className="flex gap-1 mt-2 px-1">
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                <div className="h-1 flex-1 bg-gray-100 rounded-full" />
                <div className="h-1 flex-1 bg-gray-100 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p className="text-[11px] text-gray-600 leading-tight font-medium">
                By signing up, you agree to our <span className="text-emerald-600 underline">Data Privacy Policy</span> and automated syncing terms.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-500 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Already syncing? <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}