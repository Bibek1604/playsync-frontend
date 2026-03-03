"use client"
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { ArrowRight, Mail, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { authService } from '@/features/auth/api/auth-service';

function VerifyOtpForm() {
    const searchParams = useSearchParams();
    const emailParam = searchParams?.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [resendSeconds, setResendSeconds] = useState(60);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);

    const isAllFilled = otpValues.every((v) => v !== '');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    // Countdown timer for resend
    useEffect(() => {
        if (resendSeconds <= 0) return;
        const id = setInterval(() => setResendSeconds((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [resendSeconds]);

    // Initialize email from URL params
    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [emailParam]);

    // Auto-focus first OTP input on mount
    useEffect(() => {
        otpRefs.current[0]?.focus();
    }, []);

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle OTP input keydown
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            otpRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste event
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtpValues = pastedData.split('');
        while (newOtpValues.length < 6) newOtpValues.push('');
        setOtpValues(newOtpValues);

        // Focus last filled input or first empty
        const lastFilledIndex = pastedData.length - 1;
        if (lastFilledIndex >= 0 && lastFilledIndex < 6) {
            otpRefs.current[Math.min(lastFilledIndex + 1, 5)]?.focus();
        }
    };

    // Resend OTP via API
    const handleResendOtp = useCallback(async () => {
        if (resendSeconds > 0 || isResending || !email) return;
        setIsResending(true);
        setError(null);
        setResendSuccess(null);
        try {
            await authService.forgotPassword({ email });
            setResendSuccess('A new OTP has been sent to your email.');
            setOtpValues(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
            setResendSeconds(60);
        } catch {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    }, [resendSeconds, isResending, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const otp = otpValues.join('');
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        // Navigate to reset-password — backend validates OTP there
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Verify OTP</h1>
                    <p className="text-gray-500 font-medium text-sm">Enter the 6-digit code sent to your email.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-600" />

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email - Read only display */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="your@email.com"
                                    readOnly
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-green-600" />
                                OTP (6-digit code)
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otpValues.map((value, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { otpRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={value}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        onPaste={index === 0 ? handleOtpPaste : undefined}
                                        className={`w-12 h-14 text-center text-xl font-bold rounded-lg outline-none transition-all font-mono ${
                                            value
                                                ? 'bg-green-50 border-2 border-green-500 text-green-700 shadow-[0_0_0_3px_rgba(22,163,74,0.12)]'
                                                : 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] shadow-sm text-gray-900'
                                        }`}
                                        placeholder="·"
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-bold animate-in shake">
                                <ShieldCheck size={18} />
                                {error}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm font-bold">
                                <ShieldCheck size={18} />
                                {resendSuccess}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isFullWidth
                            size="lg"
                            disabled={!isAllFilled}
                            className="h-12 rounded-lg font-bold text-base tracking-tight shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue to Reset Password
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        {resendSeconds > 0 ? (
                            <p className="text-sm text-gray-400 font-medium">
                                Resend code in{' '}
                                <span className="font-bold tabular-nums text-gray-600">{resendSeconds}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isResending}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                                {isResending ? 'Sending...' : "Didn't receive code? Resend OTP"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        }>
            <VerifyOtpForm />
        </Suspense>
    );
}
