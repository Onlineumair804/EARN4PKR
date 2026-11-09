/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpCircle,
  AlertCircle,
  ShieldAlert,
  Wallet as WalletIcon,
  CheckCircle2,
} from 'lucide-react';
import { PaymentMethod, PlatformSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, wallet, refreshWallet } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [amount, setAmount] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      dbService.getSettings().then(setSettings);
      setAmount('');
      setAccountHolderName('');
      setAccountNumber('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const minWithdrawal = settings?.minWithdrawalPKR || 200;
  const availableBal = wallet?.availableBalance ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }
    if (numAmount < minWithdrawal) {
      showToast(`Minimum withdrawal amount is ${minWithdrawal} PKR.`, 'error');
      return;
    }
    if (numAmount > availableBal) {
      showToast(`Insufficient balance. You only have ${availableBal} PKR available.`, 'error');
      return;
    }
    if (!accountHolderName.trim()) {
      showToast('Please enter the registered Account Holder Name.', 'error');
      return;
    }
    if (accountNumber.trim().length < 10) {
      showToast('Please enter a valid 11-digit mobile wallet number (e.g. 03001234567).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await dbService.requestWithdrawal({
        uid: currentUser.uid,
        username: currentUser.username,
        userEmail: currentUser.email,
        amount: numAmount,
        paymentMethod,
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
      });

      await refreshWallet();
      showToast(
        `Withdrawal request for ${numAmount} PKR placed successfully! It is now Pending admin review.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit withdrawal request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-800 bg-[#080e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Withdraw Funds</h3>
              <p className="text-xs text-slate-400">
                Direct to your JazzCash or Easypaisa account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Balance summary */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Available Balance:</span>
            </div>
            <span className="text-base font-mono font-bold text-amber-400 tabular-nums">
              {availableBal.toLocaleString()} PKR
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Withdrawal Method:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('JazzCash')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'JazzCash'
                    ? 'border-amber-400 bg-amber-500/10 text-white shadow-sm'
                    : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>JazzCash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Easypaisa')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'Easypaisa'
                    ? 'border-amber-400 bg-amber-500/10 text-white shadow-sm'
                    : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Easypaisa</span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-white">Withdrawal Amount (PKR) *</label>
              <span className="text-[10px] text-slate-400">
                Min: {minWithdrawal} PKR
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                required
                min={minWithdrawal}
                max={availableBal}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${minWithdrawal}`}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAmount(String(availableBal))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold hover:bg-amber-500/30"
              >
                Max
              </button>
            </div>
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block font-semibold text-white mb-1">
              Account Holder Full Name (as on {paymentMethod}) *
            </label>
            <input
              type="text"
              required
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="e.g. Muhammad Ali"
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block font-semibold text-white mb-1">
              {paymentMethod} Mobile Number *
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="03001234567"
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Manual payout policy notice */}
          <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Payout Processing Policy:</p>
            <p>
              • Withdrawals are processed manually via authorized JazzCash and Easypaisa agents within 1 to 24 hours.
            </p>
            <p>
              • Zero hidden charges. Minimum withdrawal limit is {minWithdrawal} PKR.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || availableBal < minWithdrawal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-xs sm:text-sm"
          >
            {submitting ? 'Placing Request...' : 'Confirm Withdrawal Request'}
          </button>
        </form>
      </div>
    </div>
  );
};
