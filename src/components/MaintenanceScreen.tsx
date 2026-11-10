/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Mail,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { PlatformSettings } from '../types';

interface MaintenanceScreenProps {
  settings: PlatformSettings | null;
  onAdminAccess: () => void;
  onRefresh?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  settings,
  onAdminAccess,
  onRefresh,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const websiteName = settings?.websiteName || 'Earn4PKR';
  const targetTime = settings?.maintenanceUntil || (now + 30 * 60 * 1000);
  const diffMs = Math.max(0, targetTime - now);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const isCompleted = diffMs === 0;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500/20 selection:text-amber-300">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto text-center space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-2xl shadow-amber-500/20">
            <div className="w-full h-full bg-[#0a1122] rounded-[22px] flex items-center justify-center">
              <Wrench className="w-9 h-9 text-amber-400 animate-pulse" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
        </div>

        {/* Brand & Status Pill */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Scheduled System Maintenance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {settings?.maintenanceTitle || 'Platform Upgrade in Progress'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {settings?.maintenanceMessage ||
              `${websiteName} is currently undergoing high-speed database optimization and security maintenance. Normal operations will resume shortly.`}
          </p>
        </div>

        {/* Live Countdown Clock */}
        <div className="p-6 rounded-3xl bg-[#0b1328]/90 border border-amber-500/30 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest">
            <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Estimated Service Resumption</span>
          </div>

          {!isCompleted ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xs mx-auto">
              {/* Hours */}
              <div className="p-3 sm:p-4 rounded-2xl bg-navy-950/90 border border-navy-800 text-center">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="p-3 sm:p-4 rounded-2xl bg-navy-950/90 border border-amber-500/40 text-center shadow-inner">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tabular-nums">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="block text-[10px] font-semibold text-amber-400 uppercase tracking-wider mt-1">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="p-3 sm:p-4 rounded-2xl bg-navy-950/90 border border-navy-800 text-center">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  Seconds
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Finalizing updates!</span>
              </p>
              <p className="text-xs text-slate-400">
                Click refresh to verify if normal platform access has been restored.
              </p>
            </div>
          )}

          {/* Refresh Action */}
          <div className="pt-1">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-400 transition-all text-xs shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Platform Status...' : 'Check Status / Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Security & Fund Safety Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3 rounded-xl bg-[#0a1122] border border-navy-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-white">Balances Protected</p>
              <p className="text-slate-400 text-[10px]">Zero funds affected</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1122] border border-navy-800 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-white">Encrypted Ledger</p>
              <p className="text-slate-400 text-[10px]">Safe realtime DB</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1122] border border-navy-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-white">Fast Reopening</p>
              <p className="text-slate-400 text-[10px]">Automated resume</p>
            </div>
          </div>
        </div>

        {/* Support Helpdesk */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
          {settings?.contactWhatsapp && (
            <a
              href={`https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Support</span>
            </a>
          )}
          {settings?.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.contactEmail}</span>
            </a>
          )}
        </div>

        {/* Hidden / Discreet Admin Access Link */}
        <div className="pt-4 border-t border-navy-900/60">
          <button
            onClick={onAdminAccess}
            className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors font-mono"
            title="Administrator Override & Panel Login"
          >
            🔒 Authorized Staff Gateway
          </button>
        </div>
      </div>
    </div>
  );
};
