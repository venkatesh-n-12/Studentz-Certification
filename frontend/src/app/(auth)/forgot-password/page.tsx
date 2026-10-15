'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: New Password, 3: Success
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Verify email
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResetToken(data.resetToken || '');
        setStep(2);
      } else {
        setError(data.message || 'No account found with this email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to connect to the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword,
          resetToken
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Password updated successfully!');
        setStep(3);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-block mb-4 group" title="Back to Home">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-[#060713] p-1 shadow-lg shadow-indigo-500/10 group-hover:border-indigo-500/50 group-hover:scale-105 transition-all">
              <Image
                src="/logo-icon.png"
                alt="Studentz Certification Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </Link>

          {step !== 3 ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-zinc-400 text-sm">
                {step === 1 
                  ? 'Enter your email to verify your account' 
                  : 'Enter your new credentials below'}
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Password Changed!</h1>
              <p className="text-zinc-400 text-sm">Your password has been successfully updated.</p>
            </>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm text-center">
            <p>{error}</p>
            {error.toLowerCase().includes('no account') && (
              <div className="mt-2 pt-2 border-t border-rose-500/20 text-xs">
                Don't have an account yet?{' '}
                <Link href="/signup" className="text-white underline font-semibold hover:text-indigo-300">
                  Create one here
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
                Registered Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="you@student.edu"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>
        )}

        {/* Step 2: New Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
              <span className="truncate">Resetting for: <strong className="text-white">{email}</strong></span>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium ml-2 shrink-0"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="At least 6 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Re-enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-zinc-300 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
              {successMsg || 'Your password has been updated. You can now use your new password to access your Studentz Certification account.'}
            </p>
            <Link
              href="/signin"
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center shadow-lg hover:scale-[1.02] active:scale-95"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <Link href="/signin" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
          <Link href="/signup" className="text-zinc-400 hover:text-white transition-colors font-medium">
            Create New Account
          </Link>
        </div>

      </div>
    </div>
  );
}
