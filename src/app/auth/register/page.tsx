"use client"
import React, { useState } from 'react';
import { ArrowRight, Zap, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error } = useRegister();
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white font-poppins">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-green-50/20 rounded-full blur-[120px] -ml-96 -mt-96" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-50/10 rounded-full blur-[100px] -mr-64 -mb-64" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center mb-8 group">
            <img
              src="/image.png"
              alt="PlaySync"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Join the Arena</h1>
          <p className="text-gray-500 font-medium text-lg">Start your professional gaming journey today.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-green-600" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={16} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px] font-bold animate-in shake">
                <ShieldCheck size={18} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              isFullWidth
              size="lg"
              className="h-12 rounded-lg font-bold text-base tracking-tight"
            >
              Create Master Account
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed font-medium italic">
            By joining, you agree to our <span className="text-green-600 font-bold cursor-pointer">Terms of Service</span> and <span className="text-green-600 font-bold cursor-pointer">Privacy Policy</span>. We track progress, not people.
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center mt-10 text-gray-500 font-medium">
          Already a legend?{' '}
          <Link href="/auth/login" className="text-green-600 font-bold hover:underline underline-offset-4 decoration-2">Login Now</Link>
        </p>
      </div>
    </div>
  );
}