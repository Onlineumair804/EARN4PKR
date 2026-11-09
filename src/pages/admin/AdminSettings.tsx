/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../services/firebase';
import { PlatformSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
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

  if (loading || !settings) {
    return (
      <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
        Loading platform settings...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      await dbService.saveSettings(settings, currentUser.uid);
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

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="rounded bg-navy-950 border-navy-700 text-amber-500 focus:ring-0"
              />
              <label htmlFor="maintenance" className="text-slate-300 font-medium">
                Enable Maintenance Mode
              </label>
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
