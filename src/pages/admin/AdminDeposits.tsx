/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Image,
  X,
  AlertTriangle,
} from 'lucide-react';
import { dbService } from '../../services/firebase';
import { DepositRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminDeposits: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const all = await dbService.getDeposits();
      setDeposits(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleApprove = async (dep: DepositRequest) => {
    if (!currentUser) return;
    setProcessingId(dep.depositId);
    try {
      await dbService.approveDeposit(dep.depositId, currentUser.uid);
      showToast(
        `Deposit of ${dep.amount} PKR for ${dep.username} approved! Wallet credited automatically.`,
        'success'
      );
      loadDeposits();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve deposit.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDeposit || !currentUser) return;
    if (!rejectionReason.trim()) {
      showToast('Please state a clear rejection reason.', 'error');
      return;
    }

    setProcessingId(rejectingDeposit.depositId);
    try {
      await dbService.rejectDeposit(
        rejectingDeposit.depositId,
        currentUser.uid,
        rejectionReason.trim()
      );
      showToast(`Deposit marked as rejected. Reason recorded.`, 'info');
      setRejectingDeposit(null);
      setRejectionReason('');
      loadDeposits();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject deposit.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.transactionId.toLowerCase().includes(q) ||
        d.username.toLowerCase().includes(q) ||
        d.userEmail.toLowerCase().includes(q) ||
        (d.planName && d.planName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Deposit Verification</h1>
          <p className="text-xs text-slate-400">
            Verify transaction IDs against JazzCash &amp; Easypaisa merchant accounts
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search TID, user..."
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
            <option value="all">All Deposits</option>
            <option value="pending">Pending Queue</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Deposit Requests</h2>
          <span className="text-xs text-slate-400 font-mono">
            {filteredDeposits.length} Records
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading deposit records...
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No deposits found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Method / Plan</th>
                  <th className="pb-3 font-medium">Transaction ID</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-center">Receipt</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredDeposits.map((dep) => (
                  <tr key={dep.depositId} className="hover:bg-navy-900/40">
                    <td className="py-3">
                      <p className="font-semibold text-white">{dep.username}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{dep.userEmail}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-white font-medium">{dep.paymentMethod}</p>
                      <p className="text-[11px] text-slate-400">{dep.planName || 'Plan Deposit'}</p>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-amber-300 font-bold">
                      {dep.transactionId}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {dep.amount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 text-center">
                      {dep.screenshotUrl ? (
                        <button
                          onClick={() => setPreviewScreenshot(dep.screenshotUrl!)}
                          className="px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-amber-400 text-[10px] font-mono flex items-center gap-1 mx-auto"
                        >
                          <Image className="w-3 h-3" />
                          <span>View Slip</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          dep.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : dep.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {dep.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {dep.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(dep)}
                            disabled={processingId === dep.depositId}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-[11px] transition-all disabled:opacity-50"
                          >
                            Approve &amp; Credit
                          </button>
                          <button
                            onClick={() => {
                              setRejectingDeposit(dep);
                              setRejectionReason('');
                            }}
                            disabled={processingId === dep.depositId}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">
                          {dep.status === 'approved' ? 'Credited' : 'Rejected'}
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

      {/* Screenshot Preview Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-navy-700 rounded-2xl max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-white text-xs">Payment Receipt Slip</h3>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-navy-950 p-2 flex justify-center">
              <img
                src={previewScreenshot}
                alt="Deposit Slip"
                className="max-h-[65vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">Reject Deposit Request</h3>
              <button
                onClick={() => setRejectingDeposit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Rejecting deposit of{' '}
                <strong className="text-white">{rejectingDeposit.amount} PKR</strong> for user{' '}
                <strong className="text-amber-400">{rejectingDeposit.username}</strong> (TID:{' '}
                {rejectingDeposit.transactionId}).
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Invalid Transaction ID, funds not received in account, duplicate slip..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingDeposit(null)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingDeposit.depositId}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
