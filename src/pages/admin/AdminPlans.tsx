/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Edit, Plus, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { dbService } from '../../services/firebase';
import { DepositPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminPlans: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<DepositPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<DepositPlan | null>(null);
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

  const openEdit = (p: DepositPlan) => {
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

    const amt = parseFloat(depositAmount);
    const rate = parseFloat(proposedDailyRatePercent);
    const days = parseInt(durationDays, 10);

    const updated = plans.map((p) => {
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

    try {
      await dbService.savePlans(updated, currentUser.uid);
      showToast(`Plan ${name} updated successfully!`, 'success');
      setEditingPlan(null);
      setPlans(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan.', 'error');
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
      <div>
        <h1 className="text-2xl font-extrabold text-white">Deposit Plan Configuration</h1>
        <p className="text-xs text-slate-400">
          Manage tier deposit thresholds, feature lists, and proposed earning projections
        </p>
      </div>

      {/* Regulatory policy reminder */}
      <div className="p-4 rounded-xl bg-navy-900 border border-amber-500/30 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-300">Compliance &amp; Simulation Protocol</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Per platform specifications: Proposed rates (default 2% daily) remain for financial simulation and tier qualification only. Guaranteed automatic deposit returns are not disbursed without regulatory approval.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
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
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Deposit Plan: {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deposit Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">VIP Badge</label>
                  <input
                    type="text"
                    required
                    value={vipTierBadge}
                    onChange={(e) => setVipTierBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
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
                  onClick={() => setEditingPlan(null)}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-md"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
