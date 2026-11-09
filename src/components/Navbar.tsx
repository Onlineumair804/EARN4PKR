/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Coins,
  Menu,
  X,
  Wallet as WalletIcon,
  Shield,
  User,
  LogOut,
  Sparkles,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle,
  Share2,
  Database,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenFirebaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenFirebaseModal,
}) => {
  const { currentUser, wallet, isAdmin, logout, isFirebaseLive } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const navLinks = currentUser
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'deposit', label: 'Deposit' },
        { id: 'withdrawal', label: 'Withdraw' },
        { id: 'wallet', label: 'Wallet' },
        { id: 'referral', label: 'Referral' },
      ]
    : [
        { id: 'home', label: 'Overview' },
        { id: 'plans', label: 'Plans' },
        { id: 'how-it-works', label: 'How It Works' },
        { id: 'security', label: 'Security' },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-800 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with VIP emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav(currentUser ? 'dashboard' : 'home')}
              className="flex items-center gap-2 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Coins className="w-5 h-5 text-navy-950 font-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                  Earn<span className="text-amber-400">4PKR</span>
                </span>
              </div>
            </button>

            {/* Live Database status pill button */}
            <button
              onClick={onOpenFirebaseModal}
              title="Firebase Realtime Database Status & Configuration"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-navy-900 border border-navy-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">
                {isFirebaseLive ? 'RTDB Live' : 'RTDB Simulator'}
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line text links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors relative py-1 focus-visible:outline-none focus-visible:text-amber-400 ${
                  currentView === link.id
                    ? 'text-amber-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {currentView === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                )}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => handleNav('admin-dashboard')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentView.startsWith('admin')
                    ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20'
                    : 'bg-navy-900 text-amber-400 border border-amber-500/30 hover:border-amber-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 primary action or User Wallet / Profile Lockup */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Available Balance Pill */}
                <button
                  onClick={() => handleNav('wallet')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/90 border border-amber-500/30 hover:border-amber-400 text-slate-100 hover:bg-navy-850 transition-all shadow-sm"
                  title="View Wallet Ledger"
                >
                  <WalletIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400 hidden sm:inline">Balance:</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 tabular-nums">
                    {(wallet?.availableBalance ?? 0).toLocaleString()} PKR
                  </span>
                </button>

                {/* Profile menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    aria-label="User Account Menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {currentUser.username.substring(0, 2)}
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0b1326] border border-navy-700 shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-navy-800">
                        <p className="font-semibold text-white truncate">{currentUser.username}</p>
                        <p className="text-slate-400 truncate text-[11px] font-mono">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            Ref: {currentUser.referralCode}
                          </span>
                          {currentUser.role === 'admin' && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleNav('transactions')}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>Transaction Ledger</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNav('admin-dashboard')}
                          className="w-full flex items-center gap-2 px-4 py-2 text-amber-300 hover:bg-navy-800 transition-colors font-medium"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

                      <button
                        onClick={onOpenFirebaseModal}
                        className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>Firebase RTDB Info</span>
                      </button>

                      <div className="border-t border-navy-800 my-1" />

                      <button
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await logout();
                          onNavigate('home');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 text-xs font-bold text-navy-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap active:scale-95"
                >
                  Join VIP
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy-800 bg-[#090f20] px-4 pt-2 pb-6 space-y-2">
          {currentUser && (
            <div className="p-3 mb-3 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Available Balance</p>
                <p className="text-base font-mono font-bold text-amber-400 tabular-nums">
                  {(wallet?.availableBalance ?? 0).toLocaleString()} PKR
                </p>
              </div>
              <button
                onClick={() => handleNav('deposit')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-navy-950 font-bold text-xs"
              >
                + Deposit
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === link.id
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:bg-navy-850'
              }`}
            >
              {link.label}
            </button>
          ))}

          {currentUser && (
            <>
              <button
                onClick={() => handleNav('transactions')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-navy-850"
              >
                Transaction History
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-navy-850"
              >
                Profile & Settings
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNav('admin-dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Control Center</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenFirebaseModal();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Firebase Realtime DB Setup</span>
          </button>

          {currentUser && (
            <button
              onClick={async () => {
                setMobileMenuOpen(false);
                await logout();
                onNavigate('home');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
