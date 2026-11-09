/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowUpCircle,
  CheckSquare,
  Layers,
  Settings,
  ClipboardList,
  Shield,
  ArrowLeft,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentAdminTab: string;
  onSelectAdminTab: (tab: string) => void;
  onExitAdmin: () => void;
  onOpenFirebaseModal: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminTab,
  onSelectAdminTab,
  onExitAdmin,
  onOpenFirebaseModal,
  children,
}) => {
  const { currentUser, isFirebaseLive } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: CreditCard },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
    { id: 'tasks', label: 'Tasks & Reviews', icon: CheckSquare },
    { id: 'plans', label: 'Deposit Plans', icon: Layers },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
    { id: 'logs', label: 'Audit Activity Logs', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a1122] border-r border-navy-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-navy-950 flex items-center justify-center font-black">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Earn4PKR</p>
              <p className="text-[10px] font-mono text-amber-400">CONTROL CENTER</p>
            </div>
          </div>
          <button
            onClick={onExitAdmin}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
            title="Exit Admin to User Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 text-xs font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectAdminTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-500 text-navy-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Database status footer in sidebar */}
        <div className="p-4 border-t border-navy-800 bg-[#080d1a] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Backend:</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isFirebaseLive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-300'
              }`}
            >
              {isFirebaseLive ? 'RTDB LIVE' : 'RTDB MIRROR'}
            </span>
          </div>

          <button
            onClick={onOpenFirebaseModal}
            className="w-full py-1.5 px-2 rounded-lg bg-navy-900 border border-navy-700 text-slate-300 hover:text-amber-300 hover:border-amber-400 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>RTDB Setup &amp; Rules</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070b14]">
        {/* Admin Top Bar */}
        <header className="h-16 border-b border-navy-800 px-6 flex items-center justify-between bg-[#080e1c]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">ADMIN /</span>
            <span className="text-white font-semibold capitalize">
              {currentAdminTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Super Admin: <strong className="text-white">{currentUser?.email}</strong>
            </span>
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 hover:border-amber-400 text-xs text-slate-200 transition-colors"
            >
              Back to App
            </button>
          </div>
        </header>

        {/* Dynamic Admin Body */}
        <div className="p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
