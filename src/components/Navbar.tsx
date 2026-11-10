/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Menu,
  X,
  Wallet as WalletIcon,
  Shield,
  User,
  LogOut,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { DepositPlan, PlatformSettings } from '../types';
import { VIPTierBadge } from './VIPTierBadge';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenFirebaseModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const { currentUser, wallet, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [plans, setPlans] = useState<DepositPlan[]>([]);

  useEffect(() => {
    dbService.getSettings().then(setSettings);
    dbService.getPlans().then(setPlans);
  }, []);

  const websiteName = settings?.websiteName || 'Earn4PKR';
  const logoUrl = settings?.websiteLogoUrl;

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
        { id: 'home', label: 'Home' },
        { id: 'plans', label: 'VIP Plans' },
        { id: 'how-it-works', label: 'How It Works' },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-800 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav(currentUser ? 'dashboard' : 'home')}
              className="flex items-center gap-2.5 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={websiteName}
                  className="w-9 h-9 rounded-xl object-contain shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Coins className="w-5 h-5 text-navy-950 font-black" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                  {websiteName}
                </span>
              </div>
            </button>
          </div>

          {/* Navigation links (Clean - No Admin link shown on user panel) */}
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
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentView.startsWith('admin')
                    ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>👑 Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Action Zone: User Wallet / Profile or Sign Up / Login */}
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

                {/* VIP Tier Pill (desktop) */}
                <div className="hidden lg:block">
                  <VIPTierBadge plan={plans.find((p) => p.id === wallet?.activePlanId)} size="sm" />
                </div>

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
                      <div className="px-4 py-2 border-b border-navy-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white truncate">{currentUser.username}</p>
                          <VIPTierBadge plan={plans.find((p) => p.id === wallet?.activePlanId)} size="sm" />
                        </div>
                        <p className="text-slate-400 truncate text-[11px] font-mono">{currentUser.email}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            Ref: {currentUser.referralCode}
                          </span>
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

                      {/* Only show Admin Control Center inside dropdown if user is actually authenticated as Admin */}
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('admin-dashboard')}
                          className="w-full flex items-center gap-2 px-4 py-2 text-amber-300 hover:bg-navy-800 transition-colors font-medium border-t border-navy-800/80"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

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
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold text-xs sm:text-sm hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-navy-900 border border-navy-700 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-800 bg-[#090f1e] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === link.id
                  ? 'bg-amber-500/15 text-amber-400 font-bold'
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
                Profile &amp; Settings
              </button>

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
            </>
          )}
        </div>
      )}
    </header>
  );
};
