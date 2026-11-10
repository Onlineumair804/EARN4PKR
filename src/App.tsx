/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { UserDashboard } from './pages/UserDashboard';
import { Tasks } from './pages/Tasks';
import { Deposit } from './pages/Deposit';
import { Withdrawal } from './pages/Withdrawal';
import { Wallet } from './pages/Wallet';
import { Referral } from './pages/Referral';
import { Profile } from './pages/Profile';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDeposits } from './pages/admin/AdminDeposits';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';
import { AdminTasks } from './pages/admin/AdminTasks';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLogs } from './pages/admin/AdminLogs';
import { DepositPlan, PlatformSettings } from './types';
import { dbService } from './services/firebase';
import { INITIAL_DEPOSIT_PLANS } from './constants/initialData';

function MainApp() {
  const { currentUser, isAdmin, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const [plans, setPlans] = useState<DepositPlan[]>(INITIAL_DEPOSIT_PLANS);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [appReady, setAppReady] = useState(false);

  // Global modals
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPlanForDeposit, setSelectedPlanForDeposit] = useState<DepositPlan | null>(null);

  // Failsafe timer: Ensure app never stays stuck on loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    dbService.getPlans().then(setPlans);
    dbService.getSettings().then(setSettings);
  }, []);

  // Check URL path, hash, or search params for secret admin access (/admin, #admin, ?admin)
  const checkAdminUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    let isAdminQuery = false;
    try {
      const params = new URLSearchParams(window.location.search);
      isAdminQuery = params.has('admin') || params.get('view') === 'admin' || params.get('role') === 'admin';
    } catch {
      // ignore
    }

    const isAdminRoute =
      path === '/admin' ||
      path === '/admin/' ||
      path === '/admin-login' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      hash.startsWith('#admin') ||
      isAdminQuery;

    if (isAdminRoute) {
      if (isAdmin) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('admin-login');
      }
    }
  }, [isAdmin]);

  // Listen to URL changes and keyboard shortcut (Ctrl+Shift+A) for admin entrance
  useEffect(() => {
    checkAdminUrl();

    const handleLocationChange = () => {
      checkAdminUrl();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkAdminUrl, isAdmin]);

  // When user logs in or out, automatically route logically
  useEffect(() => {
    if (!loading) {
      if (currentUser && currentView === 'login') {
        setCurrentView(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      } else if (currentUser && currentUser.role === 'admin' && currentView === 'admin-login') {
        setCurrentView('admin-dashboard');
      } else if (!currentUser && currentView.startsWith('admin')) {
        // preserve admin-login
        if (currentView !== 'admin-login') {
          setCurrentView('admin-login');
        }
      }
    }
  }, [currentUser, loading, currentView]);

  const handleNavigate = (view: string) => {
    // Check auth guards
    const protectedViews = [
      'dashboard',
      'tasks',
      'deposit',
      'withdrawal',
      'wallet',
      'referral',
      'profile',
      'transactions',
    ];

    if (protectedViews.includes(view) && !currentUser) {
      setCurrentView('login');
      return;
    }

    if (view.startsWith('admin') && view !== 'admin-login' && !isAdmin) {
      setCurrentView('admin-login');
      return;
    }

    // Keep URL synced with #admin for direct bookmarking and reload
    if (view.startsWith('admin')) {
      if (window.location.hash !== '#admin') {
        try {
          window.history.pushState(null, '', '#admin');
        } catch {
          // ignore
        }
      }
    } else {
      if (window.location.hash === '#admin') {
        try {
          window.history.pushState(null, '', window.location.pathname);
        } catch {
          // ignore
        }
      }
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: DepositPlan) => {
    if (!currentUser) {
      setCurrentView('register');
      return;
    }
    setSelectedPlanForDeposit(plan);
    setIsDepositModalOpen(true);
  };

  if (loading && !appReady) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-pulse flex items-center justify-center font-black text-navy-950 text-xl">
          E4P
        </div>
        <p className="text-xs font-mono text-amber-400">Loading Earn4PKR Platform...</p>
      </div>
    );
  }

  // --- MAINTENANCE MODE ENFORCEMENT ---
  const isUnderMaintenance = Boolean(
    settings?.maintenanceMode &&
    settings.maintenanceUntil &&
    settings.maintenanceUntil > 0 &&
    Date.now() < settings.maintenanceUntil
  );

  // If maintenance is ON and the user is NOT an admin:
  if (isUnderMaintenance && !isAdmin) {
    // Allow the admin login view so administrators can sign in to turn off maintenance
    if (currentView === 'admin-login') {
      return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-300">
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-2.5 text-center flex items-center justify-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Platform Maintenance Mode is currently ACTIVE. Staff credentials required to proceed.</span>
          </div>
          <main className="flex-1 flex items-center justify-center p-4">
            <AdminLogin onNavigate={handleNavigate} />
          </main>
          <Footer onNavigate={handleNavigate} />
        </div>
      );
    }

    // Block all public views and render Maintenance Countdown Screen
    return (
      <MaintenanceScreen
        settings={settings}
        onAdminAccess={() => handleNavigate('admin-login')}
        onRefresh={() => dbService.getSettings().then(setSettings)}
      />
    );
  }

  // Admin Section view router
  if (currentView.startsWith('admin') && currentView !== 'admin-login' && isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14]">
        {/* If Maintenance is on, show notice banner to Admin */}
        {isUnderMaintenance && (
          <div className="bg-amber-500 text-navy-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-navy-950" />
              <span>
                Maintenance Mode is currently ACTIVE on the website. Regular visitors see the countdown screen ({settings?.maintenanceDurationMinutes || 30}m timer).
              </span>
            </div>
            <button
              onClick={() => {
                setAdminTab('settings');
              }}
              className="px-2.5 py-1 rounded bg-navy-950 text-amber-400 font-bold hover:bg-navy-900 transition-colors text-[11px]"
            >
              Configure / Turn Off in Settings
            </button>
          </div>
        )}

        <AdminLayout
          currentAdminTab={adminTab}
          onSelectAdminTab={setAdminTab}
          onExitAdmin={() => handleNavigate('dashboard')}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        >
          {adminTab === 'dashboard' && <AdminDashboard onSelectAdminTab={setAdminTab} />}
          {adminTab === 'users' && <AdminUsers />}
          {adminTab === 'deposits' && <AdminDeposits />}
          {adminTab === 'withdrawals' && <AdminWithdrawals />}
          {adminTab === 'tasks' && <AdminTasks />}
          {adminTab === 'plans' && <AdminPlans />}
          {adminTab === 'settings' && <AdminSettings onSettingsUpdated={setSettings} />}
          {adminTab === 'logs' && <AdminLogs />}

          <FirebaseStatusModal
            isOpen={isFirebaseModalOpen}
            onClose={() => setIsFirebaseModalOpen(false)}
          />
        </AdminLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-300">
      {/* Sticky Maintenance Notice for Admin when browsing public user pages */}
      {isUnderMaintenance && isAdmin && (
        <div className="bg-amber-500 text-navy-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-navy-950" />
            <span>
              Warning: Maintenance Mode is ON. Public users are blocked. (You can view this site because you are logged in as Admin).
            </span>
          </div>
          <button
            onClick={() => handleNavigate('admin-dashboard')}
            className="px-2.5 py-1 rounded bg-navy-950 text-amber-400 font-bold hover:bg-navy-900 transition-colors text-[11px]"
          >
            Admin Panel →
          </button>
        </div>
      )}

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onNavigate={handleNavigate}
            plans={plans}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {currentView === 'login' && <Login onNavigate={handleNavigate} />}

        {currentView === 'register' && <Register onNavigate={handleNavigate} />}

        {currentView === 'forgot-password' && (
          <ForgotPassword onNavigate={handleNavigate} />
        )}

        {currentView === 'admin-login' && (
          <AdminLogin onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard' && (
          <UserDashboard
            onNavigate={handleNavigate}
            onOpenDeposit={() => {
              setSelectedPlanForDeposit(plans[0] || null);
              setIsDepositModalOpen(true);
            }}
            onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
            plans={plans}
          />
        )}

        {currentView === 'tasks' && <Tasks onNavigate={handleNavigate} />}

        {currentView === 'deposit' && <Deposit plans={plans} />}

        {currentView === 'withdrawal' && (
          <Withdrawal onOpenWithdraw={() => setIsWithdrawModalOpen(true)} />
        )}

        {currentView === 'wallet' && (
          <Wallet
            onOpenDeposit={() => {
              setSelectedPlanForDeposit(plans[0] || null);
              setIsDepositModalOpen(true);
            }}
            onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
          />
        )}

        {currentView === 'referral' && <Referral />}

        {currentView === 'profile' && <Profile />}

        {currentView === 'transactions' && (
          <Wallet
            onOpenDeposit={() => {
              setSelectedPlanForDeposit(plans[0] || null);
              setIsDepositModalOpen(true);
            }}
            onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
          />
        )}

        {currentView === 'plans' && (
          <Deposit plans={plans} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Global Modals */}

      <DepositModal
        selectedPlan={selectedPlanForDeposit}
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedPlanForDeposit(null);
        }}
        onSuccess={() => {
          dbService.getPlans().then(setPlans);
        }}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
