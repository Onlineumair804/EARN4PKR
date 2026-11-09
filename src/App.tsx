/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
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

  // Global modals
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPlanForDeposit, setSelectedPlanForDeposit] = useState<DepositPlan | null>(null);

  useEffect(() => {
    dbService.getPlans().then(setPlans);
    dbService.getSettings().then(setSettings);
  }, []);

  // When user logs in or out, automatically route logically
  useEffect(() => {
    if (!loading) {
      if (currentUser && currentView === 'login') {
        setCurrentView(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 animate-pulse flex items-center justify-center font-black text-navy-950 text-xl">
          E4P
        </div>
        <p className="text-xs font-mono text-amber-400">Loading Earn4PKR Platform...</p>
      </div>
    );
  }

  // Admin Section view router
  if (currentView.startsWith('admin') && currentView !== 'admin-login' && isAdmin) {
    return (
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
        {adminTab === 'settings' && <AdminSettings />}
        {adminTab === 'logs' && <AdminLogs />}

        <FirebaseStatusModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
        />
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-300">
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

      <Footer
        onNavigate={handleNavigate}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      {/* Global Modals */}
      <FirebaseStatusModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

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
