/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  Clock,
  History,
  TrendingUp,
  Gift,
  AlertCircle,
  Crown,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../components/StatCard';
import { VIPTierBadge, getVIPTierMeta } from '../components/VIPTierBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';
import { DepositPlan, TaskSubmission, Transaction } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  plans: DepositPlan[];
}

export const UserDashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw,
  plans,
}) => {
  const { currentUser, wallet, refreshWallet } = useAuth();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [showAllTiers, setShowAllTiers] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      dbService.getTransactions(currentUser.uid).then((txs) => setTransactions(txs.slice(0, 5)));
      dbService.getSubmissions(currentUser.uid).then(setSubmissions);
    }
  }, [currentUser]);

  const activePlan = plans.find((p) => p.id === wallet?.activePlanId);
  const tierMeta = getVIPTierMeta(activePlan);
  const TierIcon = tierMeta.icon;
  const completedTasksCount = submissions.filter((s) => s.status === 'approved').length;

  const handleCopyReferral = () => {
    if (!currentUser?.referralCode) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedRef(true);
    showToast('Referral code copied to clipboard!', 'success');
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#3b82f6'],
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Welcome Header with User Avatar & VIP Status Pill */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-b border-navy-800/80 pb-6">
        <div className="flex items-center gap-4">
          {/* Avatar with Metallic Ring */}
          <div className="relative">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 shadow-xl ${
              activePlan ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-600' : 'bg-navy-700'
            }`}>
              <div className="w-full h-full bg-[#0a1122] rounded-[14px] flex items-center justify-center font-black text-lg sm:text-xl text-amber-400 uppercase">
                {currentUser?.username ? currentUser.username.substring(0, 2) : 'EP'}
              </div>
            </div>
            {activePlan && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-navy-950 flex items-center justify-center text-navy-950 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <VIPTierBadge plan={activePlan} size="sm" />
              <span className="text-slate-500 text-xs">·</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-navy-900 border border-navy-700 text-[11px] font-mono text-slate-300">
                <span>Ref:</span>
                <span className="font-bold text-amber-400">{currentUser?.referralCode}</span>
                <button
                  onClick={handleCopyReferral}
                  className="hover:text-white transition-colors ml-0.5"
                  title="Copy Referral Code"
                >
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Welcome back, {currentUser?.username}</span>
            </h1>

            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Member Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentUser?.accountStatus || 'ACTIVE'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenDeposit}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit (JazzCash / Easypaisa)</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-400 text-slate-100 font-semibold text-xs transition-all shadow-sm"
          >
            <ArrowUpCircle className="w-4 h-4 text-amber-400" />
            <span>Withdraw PKR</span>
          </button>
        </div>
      </div>

      {/* Featured Visual VIP Tier Card (Prominent VIP Showcase) */}
      <div
        className={`relative rounded-3xl p-6 sm:p-7 border overflow-hidden transition-all duration-300 shadow-2xl bg-gradient-to-br ${tierMeta.gradientClass} ${tierMeta.borderClass}`}
      >
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left info column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-sm ${tierMeta.bgPillClass}`}>
                {tierMeta.badgeCode}
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{tierMeta.tagline}</span>
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{tierMeta.name}</span>
                {activePlan && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">
                    VERIFIED ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activePlan
                  ? `You are enjoying verified ${activePlan.vipTierBadge} privileges. Complete your daily verified tasks to earn direct PKR into your available balance.`
                  : 'You are currently on the Standard Free Member plan. Upgrade to a VIP Tier to unlock task multipliers, faster withdrawals, and premium reward allocations.'}
              </p>
            </div>

            {/* Perks Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tierMeta.perks.map((perk, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-950/70 border border-navy-800 text-[11px] font-medium text-slate-200"
                >
                  <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Action & Badge Emblem Column */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-between gap-4 p-5 rounded-2xl bg-navy-950/80 border border-navy-800/90 text-center">
            {/* VIP Emblem */}
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  activePlan
                    ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950'
                    : 'bg-navy-900 text-slate-400 border border-navy-700'
                }`}
              >
                <TierIcon className="w-8 h-8" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Current VIP Level</p>
                <p className="text-base font-extrabold text-white">{tierMeta.badgeCode}</p>
                <p className="text-[11px] font-semibold text-amber-400">
                  {activePlan ? `${activePlan.depositAmount.toLocaleString()} PKR Deposit` : 'Free Tier'}
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={onOpenDeposit}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                {activePlan ? 'Upgrade / Renew VIP Tier' : 'Upgrade to VIP Tier'}
              </button>

              <button
                onClick={() => setShowAllTiers(!showAllTiers)}
                className="w-full py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-300 hover:text-white border border-navy-700/80 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{showAllTiers ? 'Hide VIP Tiers' : 'View All 6 VIP Tiers'}</span>
                {showAllTiers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible 6 VIP Tiers Comparison Grid */}
        {showAllTiers && (
          <div className="pt-6 mt-6 border-t border-navy-800/90 animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Earn4PKR VIP Tier Progression</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select any VIP Tier to unlock corresponding daily task quotas and payout speeds
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isCurrent = p.id === activePlan?.id;
                const pMeta = getVIPTierMeta(p);
                const PIcon = pMeta.icon;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-navy-950/70 border-navy-800 hover:border-navy-700'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-navy-950">
                        ACTIVE TIER
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center text-amber-400">
                        <PIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                          {pMeta.badgeCode}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-tight">{p.name}</h4>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mb-3 border-y border-navy-800/80 py-2">
                      <span className="text-base font-extrabold font-mono text-white">
                        {p.depositAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">PKR</span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {p.proposedDailyRatePercent}% / day
                      </span>
                    </div>

                    <ul className="space-y-1 mb-3 text-[11px] text-slate-400">
                      {p.features.slice(0, 3).map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={onOpenDeposit}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-navy-950'
                          : 'bg-navy-900 hover:bg-amber-500 hover:text-navy-950 text-slate-200 border border-navy-700'
                      }`}
                    >
                      {isCurrent ? 'Current Tier' : `Select ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6 Key Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Available Balance"
          value={`${(wallet?.availableBalance ?? 0).toLocaleString()} PKR`}
          subValue="Ready for immediate withdrawal"
          icon={WalletIcon}
          variant="gold"
        />
        <StatCard
          label="Total Deposited"
          value={`${(wallet?.totalDeposited ?? 0).toLocaleString()} PKR`}
          subValue={activePlan ? `Active: ${activePlan.name}` : 'No active VIP plan'}
          icon={ArrowDownCircle}
          variant="navy"
        />
        <StatCard
          label="Pending Withdrawal"
          value={`${(wallet?.pendingBalance ?? 0).toLocaleString()} PKR`}
          subValue="Processing in queue"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          label="Task Rewards Earned"
          value={`${(wallet?.totalEarnedTasks ?? 0).toLocaleString()} PKR`}
          subValue={`${completedTasksCount} tasks verified`}
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Referral Income"
          value={`${(wallet?.totalEarnedReferrals ?? 0).toLocaleString()} PKR`}
          subValue="50 PKR per active referral"
          icon={Users}
          variant="navy"
        />
        <StatCard
          label="Total Lifetime Withdrawn"
          value={`${(wallet?.totalWithdrawn ?? 0).toLocaleString()} PKR`}
          subValue="Transferred to JazzCash/Easypaisa"
          icon={ArrowUpCircle}
          variant="navy"
        />
        <StatCard
          label="VIP Plan Status"
          value={activePlan ? activePlan.name : 'Standard Member'}
          subValue={activePlan ? `${tierMeta.badgeCode} · Verified Active` : 'Upgrade to unlock VIP perks'}
          icon={TierIcon}
          variant="gold"
        />
      </div>

      {/* Recent Activity & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Transactions Table */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Latest financial ledger activity</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All Ledger</span>
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions recorded yet. Complete tasks or deposit to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.transactionId} className="hover:bg-navy-900/40">
                        <td className="py-3 font-mono text-[11px] uppercase text-slate-300">
                          {tx.type.replace('_', ' ')}
                        </td>
                        <td className="py-3 text-slate-300 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td
                          className={`py-3 text-right font-mono font-bold tabular-nums ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount} PKR
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              tx.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Quick Earning Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
            <h2 className="text-base font-bold text-white">Earning Shortcuts</h2>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-800 hover:border-amber-400/50 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Browse Daily Tasks
                  </p>
                  <p className="text-[11px] text-slate-400">Earn 15 - 50 PKR per completion</p>
                </div>
                <span className="text-amber-400 font-bold text-xs">Start &rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('deposit')}
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-800 hover:border-amber-400/50 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Upgrade Deposit Plan
                  </p>
                  <p className="text-[11px] text-slate-400">Unlock VIP multiplier rewards</p>
                </div>
                <span className="text-amber-400 font-bold text-xs">Plans &rarr;</span>
              </button>

              <button
                onClick={() => onNavigate('referral')}
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-800 hover:border-amber-400/50 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Invite Friends (50 PKR)
                  </p>
                  <p className="text-[11px] text-slate-400">Share your link on WhatsApp</p>
                </div>
                <span className="text-amber-400 font-bold text-xs">Share &rarr;</span>
              </button>
            </div>
          </div>

          {/* Account Security Tip */}
          <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-white">Security Reminder:</p>
            <p>
              Earn4PKR never asks for your JazzCash or Easypaisa 4-digit PIN. Only submit Transaction IDs (TID).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
