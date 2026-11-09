/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Edit, Plus, CheckCircle2, ShieldCheck, X, Trash2 } from 'lucide-react';
import { dbService } from '../../services/firebase';
import { DepositPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminPlans: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<DepositPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<DepositPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [depositAmount, setDepositAmount] = useState('100');
  const [proposedDailyRatePercent, setProposedDailyRatePercent] = useState('2');
  const [durationDays, setDurationDays] = useState('30');
  const [vipTierBadge, setVipTierBadge] = useState('VIP 1');
  const [featuresText, setFeaturesText] = useState('');
  const [enabled, setEnabled] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const p = await dbService.getPlans();
      setPlans(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreate = () => {
    setIsCreating(true);
    const newId = `plan_${Date.now()}`;
    setEditingPlan({
      id: newId,
      name: '',
      depositAmount: 500,
      proposedDailyRatePercent: 2,
      durationDays: 30,
      features: ['Access to VIP Tasks', 'Daily 2% proposed estimation', 'Standard withdrawal queue'],
      enabled: true,
      vipTierBadge: `VIP ${plans.length + 1}`,
    });
    setName('');
    setDepositAmount('500');
    setProposedDailyRatePercent('2');
    setDurationDays('30');
    setVipTierBadge(`VIP ${plans.length + 1}`);
    setFeaturesText('Access to VIP Tasks\nDaily 2% proposed estimation\nStandard withdrawal queue');
    setEnabled(true);
  };

  const openEdit = (p: DepositPlan) => {
    setIsCreating(false);
    setEditingPlan(p);
    setName(p.name);
    setDepositAmount(String(p.depositAmount));
    setProposedDailyRatePercent(String(p.proposedDailyRatePercent));
    setDurationDays(String(p.durationDays));
    setVipTierBadge(p.vipTierBadge);
    setFeaturesText(p.features.join('\n'));
    setEnabled(p.enabled);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingPlan) return;

    const amt = parseFloat(depositAmount) || 0;
    const rate = parseFloat(proposedDailyRatePercent) || 0;
    const days = parseInt(durationDays, 10) || 30;

    let updated: DepositPlan[];
    if (isCreating) {
      const newPlan: DepositPlan = {
        id: editingPlan.id,
        name: name.trim() || 'New Plan',
        depositAmount: amt,
        proposedDailyRatePercent: rate,
        durationDays: days,
        vipTierBadge: vipTierBadge.trim() || 'VIP',
        features: featuresText.split('\n').filter((f) => f.trim().length > 0),
        enabled,
      };
      updated = [...plans, newPlan];
    } else {
      updated = plans.map((p) => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            name: name.trim(),
            depositAmount: amt,
            proposedDailyRatePercent: rate,
            durationDays: days,
            vipTierBadge: vipTierBadge.trim(),
            features: featuresText.split('\n').filter((f) => f.trim().length > 0),
            enabled,
          };
        }
        return p;
      });
    }

    try {
      await dbService.savePlans(updated, currentUser.uid);
      showToast(`Plan ${name} saved successfully!`, 'success');
      setEditingPlan(null);
      setIsCreating(false);
      setPlans(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan.', 'error');
    }
  };

  const handleDeletePlan = async (plan: DepositPlan) => {
    if (!currentUser) return;
    if (!window.confirm(`Are you sure you want to delete "${plan.name}" plan?`)) return;

    const updated = plans.filter((p) => p.id !== plan.id);
    try {
      await dbService.savePlans(updated, currentUser.uid);
      showToast(`Plan ${plan.name} deleted.`, 'info');
      setPlans(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete plan.', 'error');
    }
  };

  const handleTogglePlan = async (plan: DepositPlan) => {
    if (!currentUser) return;
    const updated = plans.map((p) =>
      p.id === plan.id ? { ...p, enabled: !p.enabled } : p
    );
    try {
      await dbService.savePlans(updated, currentUser.uid);
      showToast(`Plan ${plan.name} is now ${!plan.enabled ? 'Enabled' : 'Disabled'}.`, 'info');
      setPlans(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle plan.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Deposit Plan Configuration</h1>
          <p className="text-xs text-slate-400">
            Create, edit, and toggle VIP deposit plans, tiers, and pricing
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
          Loading deposit plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-[#0a1122] border transition-all flex flex-col justify-between ${
                plan.enabled
                  ? 'border-navy-800 hover:border-amber-500/40'
                  : 'border-navy-800/40 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                    {plan.vipTierBadge}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      plan.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-navy-900'
                    }`}
                  >
                    {plan.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                    {plan.depositAmount.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">PKR</span>
                </div>

                <p className="text-[11px] text-slate-400 font-mono">
                  Proposed Daily Rate: {plan.proposedDailyRatePercent}% (~{Math.round(plan.depositAmount * 0.02)} PKR/day)
                </p>

                <div className="pt-3 border-t border-navy-800 space-y-1 text-xs text-slate-400">
                  {plan.features.map((feat, i) => (
                    <p key={i} className="truncate">• {feat}</p>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex items-center gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 py-2 px-3 rounded-lg bg-navy-900 border border-navy-700 hover:border-amber-400 text-amber-300 font-semibold text-xs transition-colors"
                >
                  Edit Plan
                </button>
                <button
                  onClick={() => handleTogglePlan(plan)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    plan.enabled
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {plan.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeletePlan(plan)}
                  title="Delete Plan"
                  className="p-2 rounded-lg bg-navy-900 border border-navy-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {isCreating ? 'Create New Deposit Plan' : `Edit Deposit Plan: ${editingPlan.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreating(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Gold Tier"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deposit Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">VIP Badge *</label>
                  <input
                    type="text"
                    required
                    value={vipTierBadge}
                    onChange={(e) => setVipTierBadge(e.target.value)}
                    placeholder="e.g. VIP 3"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proposed Daily Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={proposedDailyRatePercent}
                    onChange={(e) => setProposedDailyRatePercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Access to VIP Level 2 tasks&#10;Fast manual processing"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planEnabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded bg-navy-950 border-navy-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="planEnabled" className="text-slate-300 font-medium">
                  Enable this plan for user deposits
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-md"
                >
                  {isCreating ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
