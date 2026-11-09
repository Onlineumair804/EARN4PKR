/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { Transaction } from '../types';

interface WalletPageProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const Wallet: React.FC<WalletPageProps> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { currentUser, wallet } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      dbService
        .getTransactions(currentUser.uid)
        .then(setTransactions)
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.transactionId.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalEarnings =
    (wallet?.totalEarnedTasks ?? 0) + (wallet?.totalEarnedReferrals ?? 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Wallet &amp; Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Complete transparency of your verified deposits, payouts, and micro-task rewards.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenDeposit}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 shadow-md transition-all"
          >
            + Deposit
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-400 text-slate-100 font-semibold text-xs transition-all"
          >
            Withdraw Payout
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1b38] to-[#081022] border border-amber-500/40 space-y-1">
          <p className="text-xs text-slate-400">Available Balance</p>
          <p className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
            {(wallet?.availableBalance ?? 0).toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">Unrestricted funds</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Pending Clearances</p>
          <p className="text-2xl font-mono font-bold text-slate-200 tabular-nums">
            {(wallet?.pendingBalance ?? 0).toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">In payout or deposit queue</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Total Task Rewards</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            {(wallet?.totalEarnedTasks ?? 0).toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">Verified task earnings</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Total Referral Income</p>
          <p className="text-2xl font-mono font-bold text-sky-400 tabular-nums">
            {(wallet?.totalEarnedReferrals ?? 0).toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">From verified friends</p>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Full Transaction Ledger</h2>
            <p className="text-xs text-slate-400">Immutable ledger entries with unique transaction IDs</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="task_reward">Task Rewards</option>
              <option value="daily_reward">Daily Bonuses</option>
              <option value="referral_bonus">Referrals</option>
              <option value="admin_adjustment">Admin Adjustments</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading ledger records...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No transaction records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">Tx ID</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.transactionId} className="hover:bg-navy-900/40">
                      <td className="py-3 font-mono text-[10px] text-amber-300">
                        {tx.transactionId}
                      </td>
                      <td className="py-3 font-mono text-[11px] uppercase text-slate-300">
                        {tx.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-slate-300 max-w-sm truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
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
    </div>
  );
};
