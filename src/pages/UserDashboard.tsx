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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatCard } from '../components/StatCard';
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
  useEffect(() => {
    if (currentUser) {
      dbService.getTransactions(currentUser.uid).then((txs) => setTransactions(txs.slice(0, 5)));
      dbService.getSubmissions(currentUser.uid).then(setSubmissions);
    }
  }, [currentUser]);

  const activePlan = plans.find((p) => p.id === wallet?.activePlanId);
  const completedTasksCount = submissions.filter((s) => s.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>VIP MEMBER</span>
            <span>·</span>
            <span>Ref: {currentUser?.referralCode}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser?.username}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Account Status: <span className="text-emerald-400 font-semibold uppercase">{currentUser?.accountStatus}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenDeposit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-400 text-slate-100 font-semibold text-xs transition-all"
          >
            <ArrowUpCircle className="w-4 h-4 text-amber-400" />
            <span>Withdraw</span>
          </button>
        </div>
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
          value={activePlan ? activePlan.name : 'Standard'}
          subValue={activePlan ? `${activePlan.vipTierBadge} Active` : 'Upgrade to unlock VIP'}
          icon={Award}
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
