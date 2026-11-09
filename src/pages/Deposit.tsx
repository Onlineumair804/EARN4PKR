/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Plus,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { DepositPlan, DepositRequest, PlatformSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';
import { DepositModal } from '../components/DepositModal';

interface DepositPageProps {
  plans: DepositPlan[];
}

export const Deposit: React.FC<DepositPageProps> = ({ plans }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [selectedPlanForDeposit, setSelectedPlanForDeposit] = useState<DepositPlan | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await dbService.getSettings();
      setSettings(s);
      if (currentUser) {
        const userDeposits = await dbService.getDeposits(currentUser.uid);
        setDeposits(userDeposits);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Deposit &amp; VIP Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Select an official deposit plan. Pay directly via verified JazzCash or Easypaisa channels.
        </p>
      </div>

      {/* Official Payment Accounts Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JazzCash Account */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#12111d] to-[#0a1122] border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                JC
              </div>
              <div>
                <p className="text-sm font-bold text-white">JazzCash Official Account</p>
                <p className="text-[11px] text-slate-400">Direct mobile wallet transfer</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              Active Channel
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Account Title:</span>
              <span className="font-semibold text-white">
                {settings?.jazzcashAccountName || 'Earn4PKR Official Merchant'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-navy-800/80">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {settings?.jazzcashAccountNumber || '0300 1234567'}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      (settings?.jazzcashAccountNumber || '03001234567').replace(/\s+/g, ''),
                      'JazzCash Number'
                    )
                  }
                  className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300"
                  title="Copy number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Easypaisa Account */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1822] to-[#0a1122] border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                EP
              </div>
              <div>
                <p className="text-sm font-bold text-white">Easypaisa Official Account</p>
                <p className="text-[11px] text-slate-400">Direct mobile wallet transfer</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Channel
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Account Title:</span>
              <span className="font-semibold text-white">
                {settings?.easypaisaAccountName || 'Earn4PKR Payments'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-navy-800/80">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {settings?.easypaisaAccountNumber || '0345 7654321'}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      (settings?.easypaisaAccountNumber || '03457654321').replace(/\s+/g, ''),
                      'Easypaisa Number'
                    )
                  }
                  className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300"
                  title="Copy number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Choose a Deposit Plan</h2>
          <span className="text-xs text-slate-400">Instant manual verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-[#0a1122] border transition-all flex flex-col justify-between ${
                plan.popular
                  ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'border-navy-800 hover:border-amber-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                    {plan.vipTierBadge}
                  </span>
                  <span className="text-xs text-slate-400">{plan.durationDays} Days</span>
                </div>

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                    {plan.depositAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">PKR</span>
                </div>

                <div className="pt-3 border-t border-navy-800 space-y-1.5 text-xs text-slate-400">
                  {plan.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setSelectedPlanForDeposit(plan)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
                >
                  Deposit {plan.depositAmount} PKR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit History Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">My Deposit History</h2>
            <p className="text-xs text-slate-400">Track all submitted transaction IDs and approval statuses</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{deposits.length} Records</span>
        </div>

        {deposits.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No deposits made yet. Select a plan above to initiate your first deposit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">Plan / Method</th>
                  <th className="pb-3 font-medium">Transaction ID</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {deposits.map((dep) => (
                  <tr key={dep.depositId} className="hover:bg-navy-900/40">
                    <td className="py-3">
                      <p className="font-semibold text-white">{dep.planName || 'Plan Deposit'}</p>
                      <p className="text-[11px] text-slate-400">{dep.paymentMethod}</p>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-amber-300">
                      {dep.transactionId}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {dep.amount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 text-right">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <DepositModal
        selectedPlan={selectedPlanForDeposit}
        isOpen={Boolean(selectedPlanForDeposit)}
        onClose={() => setSelectedPlanForDeposit(null)}
        onSuccess={loadData}
      />
    </div>
  );
};
