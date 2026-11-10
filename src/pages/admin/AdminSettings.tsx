/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Smartphone,
  Mail,
  Shield,
  CheckCircle2,
  Wrench,
  Clock,
  AlertTriangle,
  Power,
  RefreshCw,
} from 'lucide-react';
import { dbService } from '../../services/firebase';
import { PlatformSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AdminSettingsProps {
  onSettingsUpdated?: (settings: PlatformSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onSettingsUpdated }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dbService.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const applyMaintenance = async (active: boolean, durationMinutes?: number) => {
    if (!settings || !currentUser) return;
    const mins = durationMinutes ?? settings.maintenanceDurationMinutes ?? 30;
    const updated: PlatformSettings = {
      ...settings,
      maintenanceMode: active,
      maintenanceDurationMinutes: mins,
      maintenanceUntil: active ? Date.now() + mins * 60 * 1000 : 0,
    };
    setSettings(updated);
    try {
      await dbService.saveSettings(updated, currentUser.uid);
      onSettingsUpdated?.(updated);
      showToast(
        active
          ? `Maintenance Mode enabled for ${mins} minutes! Public users now see the countdown screen.`
          : 'Maintenance Mode turned OFF. Website is now live for all users!',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update maintenance mode.', 'error');
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
        Loading platform settings...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !settings) return;

    setSaving(true);
    try {
      await dbService.saveSettings(settings, currentUser.uid);
      onSettingsUpdated?.(settings);
      showToast('Platform & payment settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
        <p className="text-xs text-slate-400">
          Configure payment gateway details, minimum withdrawal limits, and referral bonuses
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Payment Gateways Section */}
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Mobile Payment Accounts (Deposit Receivers)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-950 border border-red-500/30 space-y-3">
              <p className="font-bold text-red-400">JazzCash Account Details</p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  JazzCash Account Title / Merchant Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.jazzcashAccountName}
                  onChange={(e) =>
                    setSettings({ ...settings, jazzcashAccountName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  JazzCash Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={settings.jazzcashAccountNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, jazzcashAccountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-emerald-500/30 space-y-3">
              <p className="font-bold text-emerald-400">Easypaisa Account Details</p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Easypaisa Account Title / Merchant Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.easypaisaAccountName}
                  onChange={(e) =>
                    setSettings({ ...settings, easypaisaAccountName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Easypaisa Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={settings.easypaisaAccountNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, easypaisaAccountNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Rules & Rewards */}
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Withdrawal &amp; Referral Program Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Minimum Withdrawal (PKR) *
              </label>
              <input
                type="number"
                required
                min={50}
                value={settings.minWithdrawalPKR}
                onChange={(e) =>
                  setSettings({ ...settings, minWithdrawalPKR: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Referral Fixed Bonus (PKR per invite) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={settings.referralRewardFixedPKR}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    referralRewardFixedPKR: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Referral Commission Rate (%) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={settings.referralCommissionPercent ?? 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    referralCommissionPercent: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="enableReferral"
              checked={settings.enableReferralProgram ?? true}
              onChange={(e) =>
                setSettings({ ...settings, enableReferralProgram: e.target.checked })
              }
              className="rounded bg-navy-950 border-navy-700 text-amber-500 focus:ring-0"
            />
            <label htmlFor="enableReferral" className="text-slate-300 font-medium">
              Activate Referral Program (Users can invite friends and earn bonuses)
            </label>
          </div>
        </div>

        {/* Website & Support Contacts */}
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Website Branding &amp; Logo Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Website Brand Name</label>
              <input
                type="text"
                required
                value={settings.websiteName}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Website Logo Image URL (Optional)
              </label>
              <input
                type="url"
                value={settings.websiteLogoUrl || ''}
                onChange={(e) => setSettings({ ...settings, websiteLogoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp Helpline</label>
              <input
                type="text"
                required
                value={settings.contactWhatsapp}
                onChange={(e) => setSettings({ ...settings, contactWhatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* Dedicated Maintenance Mode & System Upgrade Controller */}
        <div className={`p-6 rounded-2xl border transition-all ${
          settings.maintenanceMode
            ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/5'
            : 'bg-[#0a1122] border-navy-800'
        } space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                settings.maintenanceMode ? 'bg-amber-500 text-navy-950' : 'bg-navy-900 text-slate-400 border border-navy-700'
              }`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Platform Maintenance &amp; Downtime Controller</span>
                  {settings.maintenanceMode ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                      ACTIVE (Site in Maintenance)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                      NORMAL (Site Online)
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400">
                  When enabled, regular visitors see a countdown screen. Only logged-in administrators can bypass this screen.
                </p>
              </div>
            </div>

            {/* Quick Toggle Switch */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {settings.maintenanceMode ? (
                <button
                  type="button"
                  onClick={() => applyMaintenance(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Turn Off Maintenance</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => applyMaintenance(true, settings.maintenanceDurationMinutes || 30)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Activate Maintenance</span>
                </button>
              )}
            </div>
          </div>

          {/* Maintenance Duration Presets & Custom Minutes */}
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Maintenance Duration (Minutes):</span>
              </label>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                {settings.maintenanceDurationMinutes || 30} Minutes
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 120, 240].map((mins) => {
                const isSelected = (settings.maintenanceDurationMinutes || 30) === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      const until = settings.maintenanceMode
                        ? Date.now() + mins * 60 * 1000
                        : settings.maintenanceUntil;
                      setSettings({
                        ...settings,
                        maintenanceDurationMinutes: mins,
                        maintenanceUntil: until,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-navy-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-navy-900 border border-navy-700 text-slate-300 hover:text-white hover:border-amber-400/40'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h (${mins}m)` : `${mins} mins`}
                    {mins === 30 && ' (Default)'}
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Input */}
            <div className="pt-1 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Or custom minutes:</span>
              <input
                type="number"
                min={5}
                max={1440}
                value={settings.maintenanceDurationMinutes || 30}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 30;
                  const until = settings.maintenanceMode
                    ? Date.now() + val * 60 * 1000
                    : settings.maintenanceUntil;
                  setSettings({
                    ...settings,
                    maintenanceDurationMinutes: val,
                    maintenanceUntil: until,
                  });
                }}
                className="w-28 px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-amber-400 font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500">minutes (e.g. 30, 45, 90)</span>
            </div>
          </div>

          {/* Maintenance Custom Message & Heading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Maintenance Notice Heading
              </label>
              <input
                type="text"
                value={settings.maintenanceTitle || 'Platform Upgrade & System Maintenance'}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceTitle: e.target.value })
                }
                placeholder="e.g. Platform Upgrade & System Maintenance"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Notice Description for Users
              </label>
              <textarea
                rows={2}
                value={
                  settings.maintenanceMessage ||
                  'Earn4PKR is currently undergoing scheduled platform upgrades and security maintenance. All user balances, deposit records, and earnings are 100% safe. We will be back online shortly.'
                }
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMessage: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
