/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Copy,
  CheckCircle2,
  Upload,
  AlertCircle,
  FileImage,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DepositPlan, PaymentMethod, PlatformSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';

interface Props {
  selectedPlan: DepositPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<Props> = ({
  selectedPlan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      dbService.getSettings().then(setSettings);
      setTransactionId('');
      setScreenshotFile(null);
      setScreenshotPreview('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedPlan || !currentUser) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      showToast('Please enter the exact Transaction ID (TID) from your SMS or app.', 'error');
      return;
    }
    if (transactionId.trim().length < 6) {
      showToast('Transaction ID must be at least 6 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedUrl: string | undefined;
      if (screenshotFile) {
        uploadedUrl = await dbService.uploadPaymentScreenshot(screenshotFile);
      }

      await dbService.submitDeposit({
        uid: currentUser.uid,
        username: currentUser.username,
        userEmail: currentUser.email,
        amount: selectedPlan.depositAmount,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        screenshotUrl: uploadedUrl,
      });

      showToast(
        `Deposit request for ${selectedPlan.depositAmount} PKR submitted! Status: Pending Admin Verification.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit deposit request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const targetAccountName =
    paymentMethod === 'JazzCash'
      ? settings?.jazzcashAccountName || 'Earn4PKR Official Merchant'
      : settings?.easypaisaAccountName || 'Earn4PKR Payments';

  const targetAccountNumber =
    paymentMethod === 'JazzCash'
      ? settings?.jazzcashAccountNumber || '0300 1234567'
      : settings?.easypaisaAccountNumber || '0345 7654321';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-800 bg-[#080e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Deposit: {selectedPlan.name} Plan</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-navy-950">
                  {selectedPlan.vipTierBadge}
                </span>
              </h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                Amount: {selectedPlan.depositAmount.toLocaleString()} PKR
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
          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-white mb-1.5">
              Select Payment Method:
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

          {/* Account Details Box */}
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Account Title / Receiver:</span>
              <span className="font-semibold text-white">{targetAccountName}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-900 border border-navy-700">
              <div>
                <p className="text-[10px] text-slate-400">Account Number ({paymentMethod}):</p>
                <p className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                  {targetAccountNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(targetAccountNumber.replace(/\s+/g, ''), 'Account Number')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Instructions:</strong> Open your {paymentMethod} app, send exactly{' '}
              <span className="text-amber-400 font-bold">{selectedPlan.depositAmount} PKR</span> to the account above, and copy the Transaction ID from the confirmation SMS/slip.
            </p>
          </div>

          {/* Transaction ID input */}
          <div>
            <label className="block font-semibold text-white mb-1">
              Transaction ID (TID / Trx ID) *
            </label>
            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 03419827361 or JC8892104523"
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none uppercase"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Duplicate Transaction IDs are automatically blocked by the system.
            </p>
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <label className="block font-semibold text-white mb-1">
              Payment Screenshot (Optional / Recommended)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-navy-950 border border-dashed border-navy-700 hover:border-amber-400 cursor-pointer text-slate-400 hover:text-white transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{screenshotFile ? screenshotFile.name : 'Choose receipt screenshot...'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {screenshotPreview && (
              <div className="mt-2 p-2 rounded-lg bg-navy-900 border border-navy-800 flex items-center gap-2">
                <img
                  src={screenshotPreview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-[11px] text-slate-300 truncate flex-1">
                  Receipt ready for upload
                </span>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Deposits are verified manually by admin before crediting your balance. Never submit fake or reused Transaction IDs.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-xs sm:text-sm"
          >
            {submitting ? 'Submitting Deposit...' : `Submit ${selectedPlan.depositAmount} PKR Deposit`}
          </button>
        </form>
      </div>
    </div>
  );
};
