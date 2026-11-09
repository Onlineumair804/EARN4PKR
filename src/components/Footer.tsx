/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Coins, MessageCircle, Mail, HelpCircle, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/firebase';
import { PlatformSettings } from '../types';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenFirebaseModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    dbService.getSettings().then(setSettings);
  }, []);

  const websiteName = settings?.websiteName || 'Earn4PKR';

  return (
    <footer className="mt-auto border-t border-navy-800 bg-[#060a13] text-slate-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-navy-950 font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">
                {websiteName}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Premier Pakistani micro-task reward platform. Transparent JazzCash and Easypaisa manual processing with verified ledger.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-slate-200 font-semibold mb-3">Platform Navigation</p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Micro Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('deposit')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Deposit Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('withdrawal')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Withdrawal System
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('referral')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Refer &amp; Earn
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-slate-200 font-semibold mb-3">Supported Payment Gateways</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-900 border border-navy-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-semibold text-slate-200">JazzCash</span>
                <span className="text-[10px] text-slate-500 ml-auto">Manual Verified</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-900 border border-navy-800">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-200">Easypaisa</span>
                <span className="text-[10px] text-slate-500 ml-auto">Manual Verified</span>
              </div>
            </div>
          </div>

          {/* Customer Support & Help */}
          <div>
            <p className="text-slate-200 font-semibold mb-3">Official Support</p>
            <ul className="space-y-2.5">
              {settings?.contactWhatsapp && (
                <li className="flex items-center gap-2 text-slate-300">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>WhatsApp: {settings.contactWhatsapp}</span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center gap-2 text-slate-300 truncate">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{settings.contactEmail}</span>
                </li>
              )}
              <li className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Manual Verification Queue</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Planning Disclaimer */}
        <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-amber-400">Regulatory Notice:</span> Proposed earning rate of 2% daily is displayed for financial planning and simulation purposes only. {websiteName} does not activate automatic guaranteed deposit-based profits or collect real-money deposits for promised returns without applicable regulatory approvals. Real earnings are derived from genuine verified tasks.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-navy-800/80 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {websiteName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Pakistan Standard Time (PKT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
