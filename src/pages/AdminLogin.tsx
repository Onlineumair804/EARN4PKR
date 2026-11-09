/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Props {
  onNavigate: (view: string) => void;
}

export const AdminLogin: React.FC<Props> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter admin email and password.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        showToast('Access denied: This account lacks administrative privileges.', 'error');
        return;
      }
      showToast('Authorized! Loading control center...', 'success');
      onNavigate('admin-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#090f20] border border-amber-500/40 rounded-3xl p-8 shadow-2xl shadow-black/80 space-y-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Website</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Sign In</h1>
          <p className="text-xs text-slate-400">
            Enter administrator credentials to access the management panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
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
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-lg shadow-amber-500/20 text-xs disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
