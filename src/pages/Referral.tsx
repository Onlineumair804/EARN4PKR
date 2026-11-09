/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Share2,
  CheckCircle2,
  Award,
  Smartphone,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';
import { UserProfile } from '../types';

export const Referral: React.FC = () => {
  const { currentUser, wallet } = useAuth();
  const { showToast } = useToast();

  const [referredUsers, setReferredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      dbService
        .getAllUsers()
        .then((users) => {
          const refs = users.filter((u) => u.referredBy === currentUser.uid);
          setReferredUsers(refs);
        })
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const referralCode = currentUser?.referralCode || 'PKRVIP';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Earn verified daily PKR with Earn4PKR! Register using my VIP invitation link to claim a 25 PKR welcome starter bonus: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      `Earn verified daily PKR with Earn4PKR! Register with my VIP invitation code: ${referralCode}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const totalReferralEarnings = wallet?.totalEarnedReferrals ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Refer &amp; Earn 50 PKR
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Invite friends, colleagues, and community members. Earn 50 PKR for every verified registration.
        </p>
      </div>

      {/* Referral Link & Code Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#060a14] border border-amber-500/30 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unique Referral Code */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-semibold">Your Personal Invitation Code:</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950 border border-navy-700">
              <span className="text-xl font-mono font-extrabold text-amber-400 tracking-wider flex-1">
                {referralCode}
              </span>
              <button
                onClick={() => copyToClipboard(referralCode, 'Referral Code')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>
            </div>
          </div>

          {/* Direct Invitation Link */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-semibold">Your Direct Invitation Link:</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950 border border-navy-700">
              <span className="text-xs font-mono text-slate-300 truncate flex-1">
                {referralLink}
              </span>
              <button
                onClick={() => copyToClipboard(referralLink, 'Referral Link')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Social Sharing */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-navy-800">
          <span className="text-xs text-slate-400">Instant Share:</span>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
          <button
            onClick={shareTelegram}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 border border-sky-500/40 text-sky-400 hover:bg-sky-600/30 text-xs font-semibold transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Share on Telegram</span>
          </button>
        </div>
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Total Friends Invited</p>
          <p className="text-2xl font-mono font-bold text-white tabular-nums">
            {referredUsers.length}
          </p>
          <p className="text-[11px] text-slate-500">Registered with your code</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-amber-500/40 space-y-1">
          <p className="text-xs text-slate-400">Total Referral Earnings</p>
          <p className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
            {totalReferralEarnings.toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">Credited directly to wallet</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Bounty Per Member</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            50 PKR
          </p>
          <p className="text-[11px] text-slate-500">Instant registration commission</p>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Referred Team Members</h2>
            <p className="text-xs text-slate-400">List of members who joined using your invitation link</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{referredUsers.length} Users</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
            Loading team referrals...
          </div>
        ) : referredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            You haven't referred any users yet. Share your code on WhatsApp and earn 50 PKR per invite!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Joined Date</th>
                  <th className="pb-3 font-medium text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {referredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-navy-900/40">
                    <td className="py-3 font-semibold text-white">{u.username}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {u.email.replace(/(.{3})(.*)(@.*)/, '$1***$3')}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {u.accountStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
