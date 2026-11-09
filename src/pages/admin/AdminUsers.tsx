/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Edit,
  DollarSign,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  CreditCard,
  ArrowUpCircle,
} from 'lucide-react';
import { dbService } from '../../services/firebase';
import { UserProfile, Wallet, DepositRequest, WithdrawalRequest, TaskSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // User details modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDeposits, setUserDeposits] = useState<DepositRequest[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<TaskSubmission[]>([]);

  // Adjust balance modal
  const [adjustingUser, setAdjustingUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await dbService.getAllUsers();
      setUsers(allUsers);

      const walletMap: Record<string, Wallet> = {};
      for (const u of allUsers) {
        walletMap[u.uid] = await dbService.getWallet(u.uid);
      }
      setWallets(walletMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    if (!currentUser) return;
    const newStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    try {
      await dbService.updateUserStatus(user.uid, newStatus, currentUser.uid);
      showToast(`User ${user.username} account marked as ${newStatus}.`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  const handleOpenDetails = async (user: UserProfile) => {
    setSelectedUser(user);
    const [deps, wdrs, subs] = await Promise.all([
      dbService.getDeposits(user.uid),
      dbService.getWithdrawals(user.uid),
      dbService.getSubmissions(user.uid),
    ]);
    setUserDeposits(deps);
    setUserWithdrawals(wdrs);
    setUserSubmissions(subs);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !currentUser) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      showToast('Please enter a valid non-zero adjustment amount (e.g. 50 or -50).', 'error');
      return;
    }
    if (!adjustReason.trim()) {
      showToast('Please specify a reason for this financial adjustment.', 'error');
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      await dbService.adminAdjustWallet(currentUser.uid, adjustingUser.uid, amountNum, adjustReason.trim());
      showToast(`Adjusted balance for ${adjustingUser.username} by ${amountNum} PKR.`, 'success');
      setAdjustingUser(null);
      setAdjustAmount('');
      setAdjustReason('');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust balance.', 'error');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.referralCode.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Management</h1>
          <p className="text-xs text-slate-400">
            View profiles, suspend/activate accounts, and adjust balances
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user, email, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Registered Members</h2>
          <span className="text-xs text-slate-400 font-mono">{filteredUsers.length} Users</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading member profiles...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">User Profile</th>
                  <th className="pb-3 font-medium">Referral Code</th>
                  <th className="pb-3 font-medium text-right">Available Bal</th>
                  <th className="pb-3 font-medium text-right">Total Deposited</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredUsers.map((u) => {
                  const w = wallets[u.uid];
                  return (
                    <tr key={u.uid} className="hover:bg-navy-900/40">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-xs text-amber-400 uppercase">
                            {u.username.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {u.role === 'admin' && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                                  ADMIN
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-amber-400">
                        {u.referralCode}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                        {(w?.availableBalance ?? 0).toLocaleString()} PKR
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300 tabular-nums">
                        {(w?.totalDeposited ?? 0).toLocaleString()} PKR
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.accountStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(u)}
                          className="px-2.5 py-1 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300 text-[11px] font-medium transition-colors"
                          title="View user details & history"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingUser(u);
                            setAdjustAmount('');
                            setAdjustReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors"
                          title="Adjust balance"
                        >
                          Adjust Bal
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                              u.accountStatus === 'active'
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details & History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-navy-800 bg-[#080e1c]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>User Details: {selectedUser.username}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    UID: {selectedUser.uid}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-center">
                <div>
                  <p className="text-[11px] text-slate-400">Available Balance</p>
                  <p className="text-base font-mono font-bold text-amber-400 tabular-nums">
                    {(wallets[selectedUser.uid]?.availableBalance ?? 0).toLocaleString()} PKR
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Total Deposited</p>
                  <p className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                    {(wallets[selectedUser.uid]?.totalDeposited ?? 0).toLocaleString()} PKR
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Total Withdrawn</p>
                  <p className="text-base font-mono font-bold text-white tabular-nums">
                    {(wallets[selectedUser.uid]?.totalWithdrawn ?? 0).toLocaleString()} PKR
                  </p>
                </div>
              </div>

              {/* Deposit History */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Deposit History ({userDeposits.length})</span>
                </h4>
                {userDeposits.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No deposits submitted by this user.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {userDeposits.map((d) => (
                      <div
                        key={d.depositId}
                        className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 flex justify-between items-center text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-white">{d.amount} PKR</span> via{' '}
                          <span className="text-slate-300">{d.paymentMethod}</span>
                          <span className="text-slate-500 font-mono ml-2">(TID: {d.transactionId})</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            d.status === 'approved'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Withdrawal History */}
              <div className="space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                  <span>Withdrawal History ({userWithdrawals.length})</span>
                </h4>
                {userWithdrawals.length === 0 ? (
                  <p className="text-slate-500 text-[11px]">No withdrawals requested by this user.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {userWithdrawals.map((w) => (
                      <div
                        key={w.withdrawalId}
                        className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 flex justify-between items-center text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-white">{w.amount} PKR</span> to{' '}
                          <span className="text-slate-300">
                            {w.paymentMethod} ({w.accountNumber})
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            w.status === 'paid'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-slate-400">User: {adjustingUser.username}</p>
              </div>
              <button
                onClick={() => setAdjustingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adjustment Amount in PKR (positive to credit, negative to debit) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 100 or -50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adjustment Reason (Logged to Admin Activity Audit) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Special promotion bonus or correction"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmittingAdjust ? 'Processing...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
