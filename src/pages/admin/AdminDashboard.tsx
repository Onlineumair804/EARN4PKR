/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  ArrowUpCircle,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { dbService } from '../../services/firebase';
import { DepositRequest, TaskSubmission, UserProfile, WithdrawalRequest } from '../../types';

interface Props {
  onSelectAdminTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ onSelectAdminTab }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dbService.getAllUsers(),
      dbService.getDeposits(),
      dbService.getWithdrawals(),
      dbService.getSubmissions(),
    ]).then(([u, d, w, s]) => {
      setUsers(u);
      setDeposits(d);
      setWithdrawals(w);
      setSubmissions(s);
      setLoading(false);
    });
  }, []);

  const activeUsers = users.filter((u) => u.accountStatus === 'active').length;
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const approvedDeposits = deposits.filter((d) => d.status === 'approved');
  const totalDepositPKR = approvedDeposits.reduce((acc, d) => acc + d.amount, 0);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const paidWithdrawals = withdrawals.filter((w) => w.status === 'paid' || w.status === 'approved');
  const totalWithdrawnPKR = paidWithdrawals.reduce((acc, w) => acc + w.amount, 0);

  const approvedSubmissions = submissions.filter((s) => s.status === 'approved');
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const totalTaskRewardsPKR = approvedSubmissions.reduce((acc, s) => acc + s.reward, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Overview</h1>
        <p className="text-xs text-slate-400">
          Real-time metrics, financial volume, and action queues
        </p>
      </div>

      {/* Action Alerts if pending items */}
      {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0 || pendingSubmissions.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Attention: Pending Items Require Verification</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {pendingDeposits.length > 0 && (
              <button
                onClick={() => onSelectAdminTab('deposits')}
                className="px-3 py-1.5 rounded-lg bg-navy-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-mono transition-colors"
              >
                {pendingDeposits.length} Pending Deposits &rarr;
              </button>
            )}
            {pendingWithdrawals.length > 0 && (
              <button
                onClick={() => onSelectAdminTab('withdrawals')}
                className="px-3 py-1.5 rounded-lg bg-navy-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-mono transition-colors"
              >
                {pendingWithdrawals.length} Pending Withdrawals &rarr;
              </button>
            )}
            {pendingSubmissions.length > 0 && (
              <button
                onClick={() => onSelectAdminTab('tasks')}
                className="px-3 py-1.5 rounded-lg bg-navy-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-mono transition-colors"
              >
                {pendingSubmissions.length} Pending Task Submissions &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Users"
          value={users.length}
          subValue={`${activeUsers} active accounts`}
          icon={Users}
          variant="gold"
        />
        <StatCard
          label="Total Approved Deposits"
          value={`${totalDepositPKR.toLocaleString()} PKR`}
          subValue={`${approvedDeposits.length} approved transactions`}
          icon={CreditCard}
          variant="emerald"
        />
        <StatCard
          label="Total Paid Withdrawals"
          value={`${totalWithdrawnPKR.toLocaleString()} PKR`}
          subValue={`${paidWithdrawals.length} paid payouts`}
          icon={ArrowUpCircle}
          variant="navy"
        />
        <StatCard
          label="Total Task Rewards Disbursed"
          value={`${totalTaskRewardsPKR.toLocaleString()} PKR`}
          subValue={`${approvedSubmissions.length} verified tasks`}
          icon={Coins}
          variant="amber"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending Deposits Queue"
          value={pendingDeposits.length}
          subValue="Awaiting manual TID verification"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          label="Pending Withdrawals Queue"
          value={pendingWithdrawals.length}
          subValue="Awaiting manual payment transfer"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          label="Pending Task Submissions"
          value={pendingSubmissions.length}
          subValue="Requires proof verification"
          icon={CheckCircle2}
          variant="navy"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-3">
          <h3 className="font-bold text-white text-sm">Deposit Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verify transaction IDs against your JazzCash and Easypaisa merchant accounts. Approve or reject with reasons.
          </p>
          <button
            onClick={() => onSelectAdminTab('deposits')}
            className="w-full py-2 px-3 rounded-lg bg-navy-900 border border-navy-700 hover:border-amber-400 text-xs font-semibold text-amber-300 transition-colors"
          >
            Review Deposits &rarr;
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-3">
          <h3 className="font-bold text-white text-sm">Payout Management</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Process pending member withdrawals. Mark as Paid with payout transaction ID or reject with automatic wallet refund.
          </p>
          <button
            onClick={() => onSelectAdminTab('withdrawals')}
            className="w-full py-2 px-3 rounded-lg bg-navy-900 border border-navy-700 hover:border-amber-400 text-xs font-semibold text-amber-300 transition-colors"
          >
            Process Payouts &rarr;
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-3">
          <h3 className="font-bold text-white text-sm">Task &amp; Plan Configuration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create new sponsor tasks, modify deposit tiers, and configure minimum withdrawal limits.
          </p>
          <button
            onClick={() => onSelectAdminTab('tasks')}
            className="w-full py-2 px-3 rounded-lg bg-navy-900 border border-navy-700 hover:border-amber-400 text-xs font-semibold text-amber-300 transition-colors"
          >
            Manage Tasks &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
