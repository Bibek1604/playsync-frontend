"use client"
import React, { useState } from 'react';
import { ArrowRight, Mail, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { authService } from '@/features/auth/api/auth-service';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.forgotPassword({ email });
            // Redirect to the reset password page and pass the email so user doesn't have to type it again
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white font-poppins">
            {/* Background patterns */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-50/20 rounded-full blur-[120px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-50/10 rounded-full blur-[100px] -ml-64 -mb-64" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Forgot Password</h1>
                    <p className="text-gray-500 font-medium text-sm">Enter your email address to receive an OTP.</p>
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
                            Send OTP
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
