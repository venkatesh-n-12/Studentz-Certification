'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: formData.role.toUpperCase() 
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (formData.role === 'Admin') {
          alert('Registration successful! Your account is pending owner approval. You will be able to log in once approved.');
        } else {
          alert('Registration successful! Please sign in to continue.');
        }
        window.location.href = '/signin';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-zinc-400">Join Studentz Certification today</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm text-center">
            <p>{error}</p>
            {error.toLowerCase().includes('already') && (
              <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 flex items-center justify-center gap-3 text-xs">
                <Link href="/signin" className="text-white underline font-semibold hover:text-indigo-300 transition-colors">
                  Sign In instead
                </Link>
                <span className="text-rose-400/50">•</span>
                <Link href="/forgot-password" className="text-indigo-300 underline font-semibold hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="you@student.edu"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5" htmlFor="role">
              Account Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
            >
              <option value="Student">Student (Job Seeker / Participant)</option>
              <option value="Admin">Admin (Organization / Host)</option>
            </select>
          </div>

          {formData.role === 'Admin' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2 flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mr-3 mt-0.5" />
              <p className="text-xs text-amber-400">
                <strong>Notice:</strong> Admin access requires platform owner approval. Your account will be limited until verification is complete.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center mt-6 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-400 mt-8 space-y-2">
          <p>
            Already have an account?{' '}
            <Link href="/signin" className="text-white font-semibold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-xs">
            Forgot your password?{' '}
            <Link href="/forgot-password" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors underline">
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
