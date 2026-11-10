/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  CheckCircle2,
  Copy,
  Lock,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';
import { DepositPlan } from '../types';
import { VIPTierBadge } from '../components/VIPTierBadge';

export const Profile: React.FC = () => {
  const { currentUser, wallet, resetPassword, logout } = useAuth();
  const { showToast } = useToast();

  const [resetting, setResetting] = useState(false);
  const [plans, setPlans] = useState<DepositPlan[]>([]);

  React.useEffect(() => {
    dbService.getPlans().then(setPlans);
  }, []);

  if (!currentUser) return null;

  const handlePasswordReset = async () => {
    setResetting(true);
    try {
      await resetPassword(currentUser.email);
      showToast('Password reset instructions sent to your registered email!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset email.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const copyUid = () => {
    navigator.clipboard.writeText(currentUser.uid);
    showToast('Firebase UID copied to clipboard!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Profile &amp; Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your Earn4PKR account settings and authentication credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-navy-950 flex items-center justify-center font-extrabold text-2xl uppercase shadow-lg shadow-amber-500/20">
            {currentUser.username.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{currentUser.username}</h3>
            <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
          </div>

          <div className="w-full pt-3 border-t border-navy-800 space-y-2 text-xs text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">VIP Tier:</span>
              <VIPTierBadge plan={plans.find((p) => p.id === wallet?.activePlanId)} size="sm" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Role:</span>
              <span className="font-mono font-bold text-amber-400 uppercase">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className="font-mono text-emerald-400 uppercase">
                {currentUser.accountStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Member Since:</span>
              <span className="font-mono text-slate-300">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Security & UID */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-6">
          {/* Identity Information */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Identity Credentials</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Username</label>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-medium">
                  {currentUser.username}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono">
                  {currentUser.email}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Personal Referral Code</label>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-700 text-amber-400 font-mono font-bold">
                  {currentUser.referralCode}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Verification</label>
                <div className="p-2.5 rounded-xl bg-navy-950 border border-navy-700 text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">
                  Firebase Authentication UID
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-navy-950 border border-navy-700 font-mono text-[11px] text-slate-300">
                  <span className="truncate flex-1">{currentUser.uid}</span>
                  <button
                    onClick={copyUid}
                    className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300"
                    title="Copy UID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Password Reset */}
          <div className="border-t border-navy-800 pt-6 space-y-3">
            <h2 className="text-base font-bold text-white">Password &amp; Security</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Need to update your password? Click below to dispatch a secure password reset link to your registered email address.
            </p>
            <button
              onClick={handlePasswordReset}
              disabled={resetting}
              className="px-4 py-2 rounded-xl bg-navy-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {resetting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
