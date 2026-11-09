/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  X,
  CreditCard,
  Send,
} from 'lucide-react';
import { dbService } from '../../services/firebase';
import { WithdrawalRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminWithdrawals: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Mark Paid Modal
  const [payingWithdrawal, setPayingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [payoutTrxId, setPayoutTrxId] = useState<string>('');

  // Reject Modal
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const all = await dbService.getWithdrawals();
      setWithdrawals(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleConfirmPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingWithdrawal || !currentUser) return;
    if (!payoutTrxId.trim()) {
      showToast('Please enter the payout Transaction ID from your mobile wallet.', 'error');
      return;
    }

    setProcessingId(payingWithdrawal.withdrawalId);
    try {
      await dbService.markWithdrawalPaid(
        payingWithdrawal.withdrawalId,
        currentUser.uid,
        payoutTrxId.trim().toUpperCase()
      );
      showToast(
        `Withdrawal of ${payingWithdrawal.amount} PKR marked as PAID to ${payingWithdrawal.username}!`,
        'success'
      );
      setPayingWithdrawal(null);
      setPayoutTrxId('');
      loadWithdrawals();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark withdrawal as paid.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawal || !currentUser) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejecting this withdrawal.', 'error');
      return;
    }

    setProcessingId(rejectingWithdrawal.withdrawalId);
    try {
      await dbService.rejectWithdrawal(
        rejectingWithdrawal.withdrawalId,
        currentUser.uid,
        rejectionReason.trim()
      );
      showToast(
        `Withdrawal rejected. ${rejectingWithdrawal.amount} PKR has been refunded to ${rejectingWithdrawal.username}'s wallet.`,
        'info'
      );
      setRejectingWithdrawal(null);
      setRejectionReason('');
      loadWithdrawals();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject withdrawal.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = withdrawals.filter((w) => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        w.username.toLowerCase().includes(q) ||
        w.accountNumber.toLowerCase().includes(q) ||
        w.accountHolderName.toLowerCase().includes(q) ||
        (w.payoutTransactionId && w.payoutTransactionId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Withdrawal Payouts</h1>
          <p className="text-xs text-slate-400">
            Process manual bank &amp; mobile wallet payouts, mark payments as paid, or refund
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
          >
            <option value="all">All Withdrawals</option>
            <option value="pending">Pending Queue</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Payout Queue</h2>
          <span className="text-xs text-slate-400 font-mono">{filtered.length} Records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading withdrawal requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No withdrawal requests found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">User Profile</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Account Details</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filtered.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-navy-900/40">
                    <td className="py-3">
                      <p className="font-semibold text-white">{w.username}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{w.userEmail}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-medium text-white">{w.paymentMethod}</span>
                    </td>
                    <td className="py-3">
                      <p className="text-white font-medium">{w.accountHolderName}</p>
                      <p className="text-[11px] font-mono text-amber-300">{w.accountNumber}</p>
                      {w.payoutTransactionId && (
                        <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          Payout TID: {w.payoutTransactionId}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {w.amount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          w.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                            : w.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {w.status === 'pending' || w.status === 'approved' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPayingWithdrawal(w);
                              setPayoutTrxId('');
                            }}
                            disabled={processingId === w.withdrawalId}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-[11px] transition-all disabled:opacity-50"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              setRejectingWithdrawal(w);
                              setRejectionReason('');
                            }}
                            disabled={processingId === w.withdrawalId}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] transition-all disabled:opacity-50"
                          >
                            Reject &amp; Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">
                          {w.status === 'paid' ? 'Completed' : 'Refunded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {payingWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">Confirm Manual Payout</h3>
              <button
                onClick={() => setPayingWithdrawal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPaid} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-white">{payingWithdrawal.accountHolderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Number ({payingWithdrawal.paymentMethod}):</span>
                  <span className="font-mono text-amber-300">{payingWithdrawal.accountNumber}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-navy-800">
                  <span className="text-slate-400">Payout Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {payingWithdrawal.amount.toLocaleString()} PKR
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Enter Payout Transaction ID (From Your {payingWithdrawal.paymentMethod} Transfer) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 03418726543 or JC990182746"
                  value={payoutTrxId}
                  onChange={(e) => setPayoutTrxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingWithdrawal(null)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === payingWithdrawal.withdrawalId}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Confirm Payout Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">Reject &amp; Refund Withdrawal</h3>
              <button
                onClick={() => setRejectingWithdrawal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Rejecting withdrawal of{' '}
                <strong className="text-white">{rejectingWithdrawal.amount} PKR</strong>. The funds will be refunded immediately to{' '}
                <strong className="text-amber-400">{rejectingWithdrawal.username}</strong>'s available wallet balance.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Invalid wallet number, account holder name mismatch, account blocked..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingWithdrawal(null)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingWithdrawal.withdrawalId}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Confirm Rejection &amp; Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
