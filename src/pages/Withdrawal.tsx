/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet as WalletIcon,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { WithdrawalRequest, PlatformSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { WithdrawModal } from '../components/WithdrawModal';

interface WithdrawalPageProps {
  onOpenWithdraw: () => void;
}

export const Withdrawal: React.FC<WithdrawalPageProps> = () => {
  const { currentUser, wallet, refreshWallet } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await dbService.getSettings();
      setSettings(s);
      if (currentUser) {
        const userWithdrawals = await dbService.getWithdrawals(currentUser.uid);
        setWithdrawals(userWithdrawals);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const availableBal = wallet?.availableBalance ?? 0;
  const pendingBal = wallet?.pendingBalance ?? 0;
  const minWithdrawal = settings?.minWithdrawalPKR || 200;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Withdrawals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Request manual payouts directly to your JazzCash or Easypaisa wallet.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={availableBal < minWithdrawal}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0a1122] border border-amber-500/40 space-y-1">
          <p className="text-xs text-slate-400">Available For Withdrawal</p>
          <p className="text-2xl font-mono font-bold text-amber-400 tabular-nums">
            {availableBal.toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">Minimum limit: {minWithdrawal} PKR</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Pending Review</p>
          <p className="text-2xl font-mono font-bold text-white tabular-nums">
            {pendingBal.toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">In verification queue</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-1">
          <p className="text-xs text-slate-400">Total Lifetime Withdrawn</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            {(wallet?.totalWithdrawn ?? 0).toLocaleString()} PKR
          </p>
          <p className="text-[11px] text-slate-500">Successfully paid</p>
        </div>
      </div>

      {/* Payout Security Notice */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Manual Verification &amp; Security Protocol</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All withdrawal requests are processed manually by our verified financial operators via JazzCash and Easypaisa. Payouts are usually completed within 1 to 24 hours. Once paid, the payout transaction ID will be listed in the table below.
          </p>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Withdrawal History</h2>
            <p className="text-xs text-slate-400">All submitted payout requests and statuses</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{withdrawals.length} Records</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No withdrawal requests made yet. Complete tasks and reach {minWithdrawal} PKR to withdraw.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">Method / Account</th>
                  <th className="pb-3 font-medium">Holder Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {withdrawals.map((w) => (
                  <tr key={w.withdrawalId} className="hover:bg-navy-900/40">
                    <td className="py-3">
                      <p className="font-semibold text-white">{w.paymentMethod}</p>
                      <p className="text-[11px] font-mono text-amber-300">{w.accountNumber}</p>
                      {w.payoutTransactionId && (
                        <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          Payout Trx: {w.payoutTransactionId}
                        </p>
                      )}
                      {w.rejectionReason && (
                        <p className="text-[10px] text-rose-400 mt-0.5">
                          Reason: {w.rejectionReason} (Refunded to wallet)
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-slate-300">{w.accountHolderName}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {w.amount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          w.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                            : w.status === 'approved'
                            ? 'bg-sky-500/10 text-sky-400'
                            : w.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WithdrawModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
