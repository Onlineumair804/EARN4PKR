/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coins, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';
import { PlatformSettings } from '../types';

interface LoginProps {
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    dbService.getSettings().then(setSettings);
  }, []);

  const websiteName = settings?.websiteName || 'Earn4PKR';
  const logoUrl = settings?.websiteLogoUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.username}!`, 'success');
      if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#0b1326] border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={websiteName}
              className="w-14 h-14 rounded-2xl mx-auto object-contain shadow-lg shadow-amber-500/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Coins className="w-6 h-6 text-navy-950 font-black" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-white">Log in to {websiteName}</h1>
          <p className="text-xs text-slate-400">
            Enter your email and password to access your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 text-xs sm:text-sm disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-navy-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-amber-400 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
