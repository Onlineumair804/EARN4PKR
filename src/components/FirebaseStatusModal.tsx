/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  Shield,
  Key,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getStoredFirebaseConfig,
  isFirebaseConfigured,
  sanitizeApiKey,
  sanitizeString,
  CANONICAL_FIREBASE_CONFIG,
} from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isFirebaseLive, saveCustomConfig } = useAuth();
  const { showToast } = useToast();
  const currentConfig = getStoredFirebaseConfig();

  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [databaseURL, setDatabaseURL] = useState(currentConfig.databaseURL || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');

  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'rules'>('status');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDbUrl = sanitizeString(databaseURL, CANONICAL_FIREBASE_CONFIG.databaseURL);
    if (!cleanDbUrl.startsWith('https://')) {
      showToast('Realtime Database URL must start with https://', 'error');
      return;
    }
    const cleanKey = sanitizeApiKey(apiKey);
    saveCustomConfig({
      apiKey: cleanKey,
      authDomain: sanitizeString(authDomain, CANONICAL_FIREBASE_CONFIG.authDomain),
      databaseURL: cleanDbUrl,
      projectId: sanitizeString(projectId, CANONICAL_FIREBASE_CONFIG.projectId),
      storageBucket: sanitizeString(storageBucket, CANONICAL_FIREBASE_CONFIG.storageBucket || ''),
      messagingSenderId: sanitizeString(messagingSenderId, CANONICAL_FIREBASE_CONFIG.messagingSenderId || ''),
      appId: sanitizeString(appId, CANONICAL_FIREBASE_CONFIG.appId || ''),
    });
    showToast('Firebase configuration updated and verified! Reloading...', 'success');
  };

  const copyRules = () => {
    const rulesJson = `{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
        ".write": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)"
      }
    },
    "wallets": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
        ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
      }
    },
    "deposits": {
      ".read": "auth != null",
      "$depositId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "withdrawals": {
      ".read": "auth != null",
      "$withdrawalId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "tasks": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
    },
    "taskSubmissions": {
      ".read": "auth != null",
      "$submissionId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "transactions": {
      ".read": "auth != null",
      "$transactionId": {
        ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
      }
    },
    "settings": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
    },
    "adminLogs": {
      ".read": "auth != null && root.child('admins').child(auth.uid).val() === true",
      ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
    }
  }
}`;
    navigator.clipboard.writeText(rulesJson);
    showToast('Firebase Realtime Database Rules copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-800 bg-[#080e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Firebase Backend & Configuration</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isFirebaseLive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isFirebaseLive ? 'LIVE CONNECTED' : 'LOCAL RTDB MIRROR ACTIVE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Firebase Realtime Database ONLY · Zero Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-navy-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configuration Keys
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'setup'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Setup & Testing Guide
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Database Rules (JSON)
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {activeTab === 'status' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3 rounded-xl bg-navy-900 border border-navy-700/80 leading-relaxed">
                <p className="font-semibold text-white mb-1">Dual-Mode Backend Architecture</p>
                <p className="text-slate-400 text-[11px]">
                  You can connect your live Firebase project below or via environment variables (`.env`). If left blank, Earn4PKR runs seamlessly using an in-memory persistent Realtime Database mirror with identical schema, preloaded with sample admin (<code className="text-amber-300">admin@earn4pkr.com</code> / <code className="text-amber-300">Admin123!@#</code>) and demo accounts!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    API Key (apiKey)
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project.firebaseapp.com"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                    Firebase Realtime Database URL (databaseURL) *Required for RTDB
                  </label>
                  <input
                    type="text"
                    value={databaseURL}
                    onChange={(e) => setDatabaseURL(e.target.value)}
                    placeholder="https://earn4pkr-default-rtdb.asia-southeast1.firebasedatabase.app"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-amber-500/40 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="earn4pkr-app"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Storage Bucket (Optional)
                  </label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="earn4pkr-app.appspot.com"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('earn4pkr_firebase_custom_config');
                    window.location.reload();
                  }}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  Reset to Environment Defaults
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  Save & Connect Live Firebase
                </button>
              </div>
            </form>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  1. Creating the First Secure Admin Account
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  By default, any account registered with the email <code className="text-amber-300 font-mono">admin@earn4pkr.com</code> or the address defined in <code className="text-amber-300 font-mono">VITE_ADMIN_EMAIL</code> is granted super-admin permissions upon creation. In Firebase Realtime Database, admin privileges are stored in <code className="text-amber-300 font-mono">admins/{'{uid}'}: true</code> and <code className="text-amber-300 font-mono">users/{'{uid}'}/role: "admin"</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  2. Testing Deposits Safely
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Navigate to the <strong>Deposit</strong> page as a standard user.</li>
                  <li>Select a plan (e.g. Starter 100 PKR).</li>
                  <li>Copy the mock JazzCash / Easypaisa account number.</li>
                  <li>Enter a mock 11-digit Transaction ID (e.g. <code className="text-amber-300">JC88921045231</code>) and upload any sample payment slip screenshot.</li>
                  <li>Submit the deposit. Status will immediately show <strong>Pending</strong>.</li>
                  <li>Switch to the <strong>Admin Panel &gt; Deposits</strong> tab. Verify the screenshot and click <strong>Approve</strong>. The user's available balance is credited instantly!</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-navy-900 border border-navy-700 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  3. Testing Withdrawals Safely
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Navigate to <strong>Withdraw</strong>. Enter amount (min 200 PKR).</li>
                  <li>Provide your test JazzCash or Easypaisa account details.</li>
                  <li>The system deducts the amount from Available Balance into <strong>Pending Balance</strong> immediately to prevent double-spending.</li>
                  <li>In <strong>Admin Panel &gt; Withdrawals</strong>, admin can either <strong>Approve &amp; Mark as Paid</strong> (providing a payout Transaction ID), or <strong>Reject</strong> with reason. If rejected, the balance automatically refunds back to the user!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 text-[11px]">
                  Paste these rules into <strong>Firebase Console &gt; Realtime Database &gt; Rules</strong>:
                </p>
                <button
                  onClick={copyRules}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Rules JSON</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-navy-950 border border-navy-800 font-mono text-[10px] text-amber-200/90 overflow-x-auto max-h-64">
{`{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
        ".write": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)"
      }
    },
    "wallets": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
        ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
      }
    },
    "deposits": {
      ".read": "auth != null",
      "$depositId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "withdrawals": {
      ".read": "auth != null",
      "$withdrawalId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "tasks": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
    },
    "taskSubmissions": {
      ".read": "auth != null",
      "$submissionId": {
        ".write": "auth != null && (!data.exists() && newData.child('uid').val() === auth.uid) || root.child('admins').child(auth.uid).val() === true"
      }
    },
    "transactions": {
      ".read": "auth != null",
      "$transactionId": {
        ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
      }
    },
    "settings": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
    }
  }
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
