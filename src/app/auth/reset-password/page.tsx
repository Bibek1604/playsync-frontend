"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { authService } from '@/features/auth/api/auth-service';
import { toast } from '@/lib/toast';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const emailParam = searchParams?.get('email') || '';
    const otpParam = searchParams?.get('otp') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState(otpParam.replace(/\D/g, '').slice(0, 6));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    // Keep email and otp synced if params change
    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
        if (otpParam) {
            setOtp(otpParam.replace(/\D/g, '').slice(0, 6));
        }
    }, [emailParam, otpParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await authService.resetPassword({ email, otp, newPassword, confirmPassword });
            toast.success('Password updated successfully! Please sign in.');
            router.push('/auth/login');
        } catch (err: unknown) {
            const message =
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : null;

            setError(message || 'Failed to reset password. Please check your details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email - Read only display */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
                <div className="relative group">
                    <input
                        type="email"
                        value={email}
                        placeholder="your@email.com"
                        readOnly
                        className="w-full px-4 py-3.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">OTP (6-digit code)</label>
                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm font-mono tracking-widest"
                        placeholder="000000"
                        required
                        maxLength={6}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">New Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={8}
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

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Confirm Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 rounded-lg outline-none transition-all font-medium text-gray-900 shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={8}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                Reset Password
                <ArrowRight size={20} className="ml-2" />
            </Button>
        </form>
    )
}

export default function ResetPasswordPage() {
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Reset Password</h1>
                    <p className="text-gray-500 font-medium text-sm">Enter the OTP sent to your email and your new password.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600" />

                    <Suspense fallback={<div className="text-center text-gray-400 py-4">Loading form...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-green-600 transition-colors">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
