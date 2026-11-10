/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getDatabase,
  Database,
  ref,
  set,
  get,
  update,
  onValue,
  DatabaseReference,
  DataSnapshot,
} from 'firebase/database';
import {
  getStorage,
  FirebaseStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  AdminLog,
  DepositPlan,
  DepositRequest,
  PlatformSettings,
  TaskItem,
  TaskSubmission,
  Transaction,
  UserProfile,
  Wallet,
  WithdrawalRequest,
} from '../types';
import {
  INITIAL_DEPOSIT_PLANS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_TASKS,
} from '../constants/initialData';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY_CONFIG = 'earn4pkr_firebase_custom_config';
const STORAGE_KEY_USERS = 'earn4pkr_db_users';
const STORAGE_KEY_WALLETS = 'earn4pkr_db_wallets';
const STORAGE_KEY_DEPOSITS = 'earn4pkr_db_deposits';
const STORAGE_KEY_WITHDRAWALS = 'earn4pkr_db_withdrawals';
const STORAGE_KEY_TASKS = 'earn4pkr_db_tasks';
const STORAGE_KEY_SUBMISSIONS = 'earn4pkr_db_submissions';
const STORAGE_KEY_TRANSACTIONS = 'earn4pkr_db_transactions';
const STORAGE_KEY_SETTINGS = 'earn4pkr_db_settings';
const STORAGE_KEY_PLANS = 'earn4pkr_db_plans';
const STORAGE_KEY_ADMIN_LOGS = 'earn4pkr_db_admin_logs';
const STORAGE_KEY_SESSION_USER = 'earn4pkr_session_user';

// Authoritative Canonical Firebase Configuration
export const CANONICAL_FIREBASE_CONFIG: FirebaseConfigParams = {
  apiKey: 'AIzaSyB7gXkvPCRuDfvKkfvkaCcaXb1PH0fUZ98',
  authDomain: 'earn4pkr.firebaseapp.com',
  databaseURL: 'https://earn4pkr-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'earn4pkr',
  storageBucket: 'earn4pkr.firebasestorage.app',
  messagingSenderId: '179213291780',
  appId: '1:179213291780:web:0af687f4b9ff2fd26e0051',
};

// Sanitizer for API Key to strictly remove surrounding quotes, whitespace, or invalid characters
export function sanitizeApiKey(rawKey?: unknown): string {
  if (!rawKey || typeof rawKey !== 'string') return CANONICAL_FIREBASE_CONFIG.apiKey;
  const cleaned = rawKey
    .trim()
    .replace(/^["'`\\]+|["'`\\,;]+$/g, '')
    .replace(/\\"/g, '')
    .trim();
  // Valid Google API keys always start with AIzaSy
  if (!cleaned || !cleaned.startsWith('AIzaSy')) {
    return CANONICAL_FIREBASE_CONFIG.apiKey;
  }
  return cleaned;
}

export function sanitizeString(raw: unknown, fallback = ''): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const cleaned = raw
    .trim()
    .replace(/^["'`\\]+|["'`\\,;]+$/g, '')
    .trim();
  return cleaned || fallback;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigParams = {
  apiKey: sanitizeApiKey(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeString(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, CANONICAL_FIREBASE_CONFIG.authDomain),
  databaseURL: sanitizeString(import.meta.env.VITE_FIREBASE_DATABASE_URL, CANONICAL_FIREBASE_CONFIG.databaseURL),
  projectId: sanitizeString(import.meta.env.VITE_FIREBASE_PROJECT_ID, CANONICAL_FIREBASE_CONFIG.projectId),
  storageBucket: sanitizeString(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, CANONICAL_FIREBASE_CONFIG.storageBucket || ''),
  messagingSenderId: sanitizeString(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, CANONICAL_FIREBASE_CONFIG.messagingSenderId || ''),
  appId: sanitizeString(import.meta.env.VITE_FIREBASE_APP_ID, CANONICAL_FIREBASE_CONFIG.appId || ''),
};

// Export user's web app Firebase configuration
export const firebaseConfig = DEFAULT_FIREBASE_CONFIG;

// Determine if we have valid Firebase keys with self-healing local storage
export function getStoredFirebaseConfig(): FirebaseConfigParams {
  if (typeof window === 'undefined') return DEFAULT_FIREBASE_CONFIG;

  const local = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      const cleanKey = sanitizeApiKey(parsed.apiKey);
      const cleanDbUrl = sanitizeString(parsed.databaseURL, DEFAULT_FIREBASE_CONFIG.databaseURL);
      const cleanAuthDomain = sanitizeString(parsed.authDomain, DEFAULT_FIREBASE_CONFIG.authDomain);
      const cleanProjectId = sanitizeString(parsed.projectId, DEFAULT_FIREBASE_CONFIG.projectId);

      // Auto-migrate any cached us-central1 URL to exact asia-southeast1 region
      const finalDbUrl = cleanDbUrl.includes('earn4pkr-default-rtdb.firebaseio.com')
        ? 'https://earn4pkr-default-rtdb.asia-southeast1.firebasedatabase.app'
        : cleanDbUrl;

      const sanitized: FirebaseConfigParams = {
        apiKey: cleanKey,
        authDomain: cleanAuthDomain,
        databaseURL: finalDbUrl,
        projectId: cleanProjectId,
        storageBucket: sanitizeString(parsed.storageBucket, DEFAULT_FIREBASE_CONFIG.storageBucket || ''),
        messagingSenderId: sanitizeString(parsed.messagingSenderId, DEFAULT_FIREBASE_CONFIG.messagingSenderId || ''),
        appId: sanitizeString(parsed.appId, DEFAULT_FIREBASE_CONFIG.appId || ''),
      };

      // Always persist the healed sanitized version
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(sanitized));
      return sanitized;
    } catch {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function isFirebaseConfigured(): boolean {
  const cfg = getStoredFirebaseConfig();
  return Boolean(
    cfg.apiKey &&
    cfg.apiKey.startsWith('AIzaSy') &&
    cfg.databaseURL &&
    !cfg.apiKey.includes('YourApiKeyHere')
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let rtdb: Database | null = null;
let storage: FirebaseStorage | null = null;

try {
  const config = getStoredFirebaseConfig();
  if (config.apiKey && config.apiKey.startsWith('AIzaSy')) {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      const existing = getApp();
      // Ensure the existing app uses the clean API key
      if (existing.options.apiKey !== config.apiKey) {
        deleteApp(existing).catch(() => {});
        app = initializeApp(config);
      } else {
        app = existing;
      }
    }

    auth = getAuth(app);
    if (config.databaseURL) {
      rtdb = getDatabase(app);
    }
    if (config.storageBucket) {
      storage = getStorage(app);
    }
  }
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export { app, auth, rtdb, storage };

// --- Local Database Engine (Exact RTDB Schema Mirror) ---
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Seed initial state
export function initSeedDataIfEmpty(): void {
  if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
    setLocalItem(STORAGE_KEY_SETTINGS, INITIAL_PLATFORM_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEY_PLANS)) {
    setLocalItem(STORAGE_KEY_PLANS, INITIAL_DEPOSIT_PLANS);
  }
  if (!localStorage.getItem(STORAGE_KEY_TASKS)) {
    const tasksMap: Record<string, TaskItem> = {};
    INITIAL_TASKS.forEach((t) => {
      tasksMap[t.taskId] = t;
    });
    setLocalItem(STORAGE_KEY_TASKS, tasksMap);
  }
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    // Seed default admin and user
    const usersMap: Record<string, UserProfile & { passwordHash?: string }> = {
      'i9ajhjk1xFYNGOL6mFsEyZOL5GY2': {
        uid: 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2',
        username: 'Syed Humyiar (Owner)',
        email: 'syedhumyiar@gmail.com',
        referralCode: 'HUMYIARVIP',
        accountStatus: 'active',
        role: 'admin',
        createdAt: Date.now() - 86400000 * 30,
        emailVerified: true,
        passwordHash: 'Admin123!@#',
      },
      'admin-uid-101': {
        uid: 'admin-uid-101',
        username: 'Earn4PKR Admin',
        email: 'admin@earn4pkr.com',
        referralCode: 'ADMINVIP',
        accountStatus: 'active',
        role: 'admin',
        createdAt: Date.now() - 86400000 * 30,
        emailVerified: true,
        passwordHash: 'Admin123!@#',
      },
      'demo-user-202': {
        uid: 'demo-user-202',
        username: 'Shahzaib Khan',
        email: 'demo@earn4pkr.com',
        referralCode: 'PKR777',
        accountStatus: 'active',
        role: 'user',
        createdAt: Date.now() - 86400000 * 10,
        emailVerified: true,
        passwordHash: 'User123!@#',
      },
    };
    setLocalItem(STORAGE_KEY_USERS, usersMap);

    const walletsMap: Record<string, Wallet> = {
      'i9ajhjk1xFYNGOL6mFsEyZOL5GY2': {
        uid: 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2',
        availableBalance: 10000,
        pendingBalance: 0,
        totalDeposited: 10000,
        totalWithdrawn: 0,
        totalEarnedTasks: 500,
        totalEarnedReferrals: 1200,
        activePlanId: 'premium',
        updatedAt: Date.now(),
      },
      'demo-user-202': {
        uid: 'demo-user-202',
        availableBalance: 450,
        pendingBalance: 200,
        totalDeposited: 1000,
        totalWithdrawn: 300,
        totalEarnedTasks: 150,
        totalEarnedReferrals: 100,
        activePlanId: 'gold',
        lastDailyClaimDate: '',
        updatedAt: Date.now(),
      },
      'admin-uid-101': {
        uid: 'admin-uid-101',
        availableBalance: 0,
        pendingBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarnedTasks: 0,
        totalEarnedReferrals: 0,
        updatedAt: Date.now(),
      },
    };
    setLocalItem(STORAGE_KEY_WALLETS, walletsMap);

    // Seed sample transactions
    const txMap: Record<string, Transaction> = {
      'tx-1001': {
        transactionId: 'tx-1001',
        uid: 'demo-user-202',
        type: 'deposit',
        amount: 1000,
        status: 'completed',
        description: 'Gold VIP Plan Deposit via JazzCash (Verified)',
        createdAt: Date.now() - 86400000 * 5,
      },
      'tx-1002': {
        transactionId: 'tx-1002',
        uid: 'demo-user-202',
        type: 'task_reward',
        amount: 25,
        status: 'completed',
        description: 'Completed Digital Security Tutorial Task',
        createdAt: Date.now() - 86400000 * 2,
      },
      'tx-1003': {
        transactionId: 'tx-1003',
        uid: 'demo-user-202',
        type: 'withdrawal',
        amount: -300,
        status: 'completed',
        description: 'Withdrawal to JazzCash 03001234567 (Paid)',
        createdAt: Date.now() - 86400000 * 1,
      },
    };
    setLocalItem(STORAGE_KEY_TRANSACTIONS, txMap);
  }
}

initSeedDataIfEmpty();

// Safe RTDB query with strict timeout to prevent mobile network hangs
export async function safeRtdbGet(dbRef: DatabaseReference | null | undefined, timeoutMs = 1500): Promise<DataSnapshot | null> {
  if (!dbRef) return null;
  try {
    const res = await Promise.race([
      get(dbRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return res as DataSnapshot | null;
  } catch (err) {
    console.warn('safeRtdbGet error or timeout:', err);
    return null;
  }
}

// --- Realtime Database API Layer ---
export const dbService = {
  // --- USERS ---
  async getUser(uid: string): Promise<UserProfile | null> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, `users/${uid}`));
        if (snap?.exists()) {
          const profile: UserProfile = snap.val();
          if (
            uid === 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2' ||
            profile.email?.toLowerCase() === 'syedhumyiar@gmail.com' ||
            profile.email?.toLowerCase() === 'syedumair56300@gmail.com' ||
            profile.email?.toLowerCase() === 'admin@earn4pkr.com'
          ) {
            profile.role = 'admin';
          }
          return profile;
        }
      } catch (e) {
        console.error('RTDB getUser error:', e);
      }
    }
    const users = getLocalItem<Record<string, UserProfile>>(STORAGE_KEY_USERS, {});
    const profile = users[uid] || null;
    if (profile && (uid === 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2' || profile.email?.toLowerCase() === 'syedhumyiar@gmail.com')) {
      profile.role = 'admin';
    }
    return profile;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'users'));
        if (snap?.exists()) {
          const val = snap.val();
          return Object.values(val);
        }
      } catch (e) {
        console.error('RTDB getAllUsers error:', e);
      }
    }
    const users = getLocalItem<Record<string, UserProfile>>(STORAGE_KEY_USERS, {});
    return Object.values(users);
  },

  async setUser(profile: UserProfile): Promise<void> {
    if (rtdb) {
      try {
        await set(ref(rtdb, `users/${profile.uid}`), profile);
      } catch (e) {
        console.error('RTDB setUser error:', e);
      }
    }
    const users = getLocalItem<Record<string, UserProfile>>(STORAGE_KEY_USERS, {});
    users[profile.uid] = profile;
    setLocalItem(STORAGE_KEY_USERS, users);
  },

  async updateUserStatus(uid: string, status: 'active' | 'suspended', adminUid: string): Promise<void> {
    if (rtdb) {
      try {
        await update(ref(rtdb, `users/${uid}`), { accountStatus: status });
      } catch (e) {
        console.error('RTDB updateUserStatus error:', e);
      }
    }
    const users = getLocalItem<Record<string, UserProfile>>(STORAGE_KEY_USERS, {});
    if (users[uid]) {
      users[uid].accountStatus = status;
      setLocalItem(STORAGE_KEY_USERS, users);
    }
    await this.logAdminAction(adminUid, 'UPDATE_USER_STATUS', `User ${uid} set to ${status}`, uid);
  },

  // --- WALLETS ---
  async getWallet(uid: string): Promise<Wallet> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, `wallets/${uid}`));
        if (snap?.exists()) return snap.val();
      } catch (e) {
        console.error('RTDB getWallet error:', e);
      }
    }
    const wallets = getLocalItem<Record<string, Wallet>>(STORAGE_KEY_WALLETS, {});
    if (!wallets[uid]) {
      const newWallet: Wallet = {
        uid,
        availableBalance: 0,
        pendingBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarnedTasks: 0,
        totalEarnedReferrals: 0,
        updatedAt: Date.now(),
      };
      wallets[uid] = newWallet;
      setLocalItem(STORAGE_KEY_WALLETS, wallets);
      return newWallet;
    }
    return wallets[uid];
  },

  async updateWallet(wallet: Wallet): Promise<void> {
    wallet.updatedAt = Date.now();
    if (rtdb) {
      try {
        await set(ref(rtdb, `wallets/${wallet.uid}`), wallet);
      } catch (e) {
        console.error('RTDB updateWallet error:', e);
      }
    }
    const wallets = getLocalItem<Record<string, Wallet>>(STORAGE_KEY_WALLETS, {});
    wallets[wallet.uid] = wallet;
    setLocalItem(STORAGE_KEY_WALLETS, wallets);
  },

  async adminAdjustWallet(
    adminUid: string,
    targetUid: string,
    amountDelta: number,
    reason: string
  ): Promise<Wallet> {
    const wallet = await this.getWallet(targetUid);
    wallet.availableBalance = Math.max(0, wallet.availableBalance + amountDelta);
    await this.updateWallet(wallet);

    // Record transaction
    await this.addTransaction({
      transactionId: `tx-adj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uid: targetUid,
      type: 'admin_adjustment',
      amount: amountDelta,
      status: 'completed',
      description: `Admin adjustment: ${reason}`,
      createdAt: Date.now(),
    });

    await this.logAdminAction(
      adminUid,
      'WALLET_ADJUSTMENT',
      `Adjusted wallet for user ${targetUid} by ${amountDelta > 0 ? '+' : ''}${amountDelta} PKR. Reason: ${reason}`,
      targetUid
    );

    return wallet;
  },

  // --- DEPOSITS ---
  async getDeposits(uid?: string): Promise<DepositRequest[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'deposits'));
        if (snap?.exists()) {
          const list: DepositRequest[] = Object.values(snap.val());
          if (uid) return list.filter((d) => d.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch (e) {
        console.error('RTDB getDeposits error:', e);
      }
    }
    const deposits = getLocalItem<Record<string, DepositRequest>>(STORAGE_KEY_DEPOSITS, {});
    const list = Object.values(deposits);
    if (uid) return list.filter((d) => d.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  async submitDeposit(deposit: Omit<DepositRequest, 'depositId' | 'status' | 'createdAt'>): Promise<DepositRequest> {
    // Check for duplicate transaction ID
    const allDeposits = await this.getDeposits();
    const isDuplicate = allDeposits.some(
      (d) => d.transactionId.toLowerCase().trim() === deposit.transactionId.toLowerCase().trim()
    );
    if (isDuplicate) {
      throw new Error('This Transaction ID has already been submitted. Duplicate submissions are strictly rejected.');
    }

    const depositId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDeposit: DepositRequest = {
      ...deposit,
      depositId,
      status: 'pending',
      createdAt: Date.now(),
    };

    if (rtdb) {
      try {
        await set(ref(rtdb, `deposits/${depositId}`), newDeposit);
      } catch (e) {
        console.error('RTDB submitDeposit error:', e);
      }
    }

    const deposits = getLocalItem<Record<string, DepositRequest>>(STORAGE_KEY_DEPOSITS, {});
    deposits[depositId] = newDeposit;
    setLocalItem(STORAGE_KEY_DEPOSITS, deposits);

    // Record pending transaction
    await this.addTransaction({
      transactionId: `tx-dep-${depositId}`,
      uid: deposit.uid,
      type: 'deposit',
      amount: deposit.amount,
      status: 'pending',
      description: `Deposit request via ${deposit.paymentMethod} (Trx: ${deposit.transactionId})`,
      referenceId: depositId,
      createdAt: Date.now(),
    });

    return newDeposit;
  },

  async approveDeposit(depositId: string, adminUid: string): Promise<void> {
    const deposits = getLocalItem<Record<string, DepositRequest>>(STORAGE_KEY_DEPOSITS, {});
    let deposit = deposits[depositId];

    if (rtdb) {
      try {
        const snap = await get(ref(rtdb, `deposits/${depositId}`));
        if (snap.exists()) deposit = snap.val();
      } catch (e) {
        console.error('RTDB approveDeposit fetch error:', e);
      }
    }

    if (!deposit) throw new Error('Deposit record not found');
    if (deposit.status === 'approved') throw new Error('Deposit is already approved');

    deposit.status = 'approved';
    deposit.reviewedAt = Date.now();
    deposit.reviewedBy = adminUid;

    if (rtdb) {
      await update(ref(rtdb, `deposits/${depositId}`), deposit);
    }
    deposits[depositId] = deposit;
    setLocalItem(STORAGE_KEY_DEPOSITS, deposits);

    // Credit user's wallet
    const wallet = await this.getWallet(deposit.uid);
    wallet.availableBalance += deposit.amount;
    wallet.totalDeposited += deposit.amount;
    if (deposit.planId) {
      wallet.activePlanId = deposit.planId;
    }
    await this.updateWallet(wallet);

    // Update transaction to completed
    await this.updateTransactionStatus(`tx-dep-${depositId}`, 'completed');

    // Admin audit log
    await this.logAdminAction(
      adminUid,
      'DEPOSIT_APPROVED',
      `Approved deposit ${depositId} of ${deposit.amount} PKR for user ${deposit.username} (Trx: ${deposit.transactionId})`,
      deposit.uid
    );
  },

  async rejectDeposit(depositId: string, adminUid: string, reason: string): Promise<void> {
    const deposits = getLocalItem<Record<string, DepositRequest>>(STORAGE_KEY_DEPOSITS, {});
    let deposit = deposits[depositId];

    if (rtdb) {
      try {
        const snap = await get(ref(rtdb, `deposits/${depositId}`));
        if (snap.exists()) deposit = snap.val();
      } catch (e) {
        console.error('RTDB rejectDeposit fetch error:', e);
      }
    }

    if (!deposit) throw new Error('Deposit record not found');
    deposit.status = 'rejected';
    deposit.rejectionReason = reason;
    deposit.reviewedAt = Date.now();
    deposit.reviewedBy = adminUid;

    if (rtdb) {
      await update(ref(rtdb, `deposits/${depositId}`), deposit);
    }
    deposits[depositId] = deposit;
    setLocalItem(STORAGE_KEY_DEPOSITS, deposits);

    // Update transaction to rejected
    await this.updateTransactionStatus(`tx-dep-${depositId}`, 'rejected');

    await this.logAdminAction(
      adminUid,
      'DEPOSIT_REJECTED',
      `Rejected deposit ${depositId} of ${deposit.amount} PKR. Reason: ${reason}`,
      deposit.uid
    );
  },

  // --- WITHDRAWALS ---
  async getWithdrawals(uid?: string): Promise<WithdrawalRequest[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'withdrawals'));
        if (snap?.exists()) {
          const list: WithdrawalRequest[] = Object.values(snap.val());
          if (uid) return list.filter((w) => w.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch (e) {
        console.error('RTDB getWithdrawals error:', e);
      }
    }
    const withdrawals = getLocalItem<Record<string, WithdrawalRequest>>(STORAGE_KEY_WITHDRAWALS, {});
    const list = Object.values(withdrawals);
    if (uid) return list.filter((w) => w.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  async requestWithdrawal(
    request: Omit<WithdrawalRequest, 'withdrawalId' | 'status' | 'createdAt'>
  ): Promise<WithdrawalRequest> {
    const settings = await this.getSettings();
    if (request.amount < settings.minWithdrawalPKR) {
      throw new Error(`Minimum withdrawal amount is ${settings.minWithdrawalPKR} PKR.`);
    }

    // Verify wallet balance
    const wallet = await this.getWallet(request.uid);
    if (wallet.availableBalance < request.amount) {
      throw new Error(`Insufficient wallet balance. You have ${wallet.availableBalance} PKR available.`);
    }

    // Deduct immediately from available and place into pending
    wallet.availableBalance -= request.amount;
    wallet.pendingBalance += request.amount;
    await this.updateWallet(wallet);

    const withdrawalId = `wdr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newWithdrawal: WithdrawalRequest = {
      ...request,
      withdrawalId,
      status: 'pending',
      createdAt: Date.now(),
    };

    if (rtdb) {
      try {
        await set(ref(rtdb, `withdrawals/${withdrawalId}`), newWithdrawal);
      } catch (e) {
        console.error('RTDB requestWithdrawal error:', e);
      }
    }

    const withdrawals = getLocalItem<Record<string, WithdrawalRequest>>(STORAGE_KEY_WITHDRAWALS, {});
    withdrawals[withdrawalId] = newWithdrawal;
    setLocalItem(STORAGE_KEY_WITHDRAWALS, withdrawals);

    // Record pending transaction
    await this.addTransaction({
      transactionId: `tx-wdr-${withdrawalId}`,
      uid: request.uid,
      type: 'withdrawal',
      amount: -request.amount,
      status: 'pending',
      description: `Withdrawal request to ${request.paymentMethod} (${request.accountNumber})`,
      referenceId: withdrawalId,
      createdAt: Date.now(),
    });

    return newWithdrawal;
  },

  async approveWithdrawal(withdrawalId: string, adminUid: string): Promise<void> {
    const withdrawals = getLocalItem<Record<string, WithdrawalRequest>>(STORAGE_KEY_WITHDRAWALS, {});
    let w = withdrawals[withdrawalId];

    if (rtdb) {
      const snap = await get(ref(rtdb, `withdrawals/${withdrawalId}`));
      if (snap.exists()) w = snap.val();
    }
    if (!w) throw new Error('Withdrawal request not found');

    w.status = 'approved';
    w.processedAt = Date.now();
    w.processedBy = adminUid;

    if (rtdb) await update(ref(rtdb, `withdrawals/${withdrawalId}`), w);
    withdrawals[withdrawalId] = w;
    setLocalItem(STORAGE_KEY_WITHDRAWALS, withdrawals);

    await this.logAdminAction(
      adminUid,
      'WITHDRAWAL_APPROVED',
      `Approved withdrawal ${withdrawalId} of ${w.amount} PKR for ${w.username} (${w.paymentMethod})`,
      w.uid
    );
  },

  async markWithdrawalPaid(withdrawalId: string, adminUid: string, payoutTransactionId: string): Promise<void> {
    const withdrawals = getLocalItem<Record<string, WithdrawalRequest>>(STORAGE_KEY_WITHDRAWALS, {});
    let w = withdrawals[withdrawalId];

    if (rtdb) {
      const snap = await get(ref(rtdb, `withdrawals/${withdrawalId}`));
      if (snap.exists()) w = snap.val();
    }
    if (!w) throw new Error('Withdrawal request not found');

    w.status = 'paid';
    w.payoutTransactionId = payoutTransactionId;
    w.processedAt = Date.now();
    w.processedBy = adminUid;

    if (rtdb) await update(ref(rtdb, `withdrawals/${withdrawalId}`), w);
    withdrawals[withdrawalId] = w;
    setLocalItem(STORAGE_KEY_WITHDRAWALS, withdrawals);

    // Update wallet pending & total withdrawn
    const wallet = await this.getWallet(w.uid);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - w.amount);
    wallet.totalWithdrawn += w.amount;
    await this.updateWallet(wallet);

    // Complete transaction
    await this.updateTransactionStatus(`tx-wdr-${withdrawalId}`, 'completed');

    await this.logAdminAction(
      adminUid,
      'WITHDRAWAL_PAID',
      `Marked withdrawal ${withdrawalId} of ${w.amount} PKR as PAID. Payout Trx ID: ${payoutTransactionId}`,
      w.uid
    );
  },

  async rejectWithdrawal(withdrawalId: string, adminUid: string, reason: string): Promise<void> {
    const withdrawals = getLocalItem<Record<string, WithdrawalRequest>>(STORAGE_KEY_WITHDRAWALS, {});
    let w = withdrawals[withdrawalId];

    if (rtdb) {
      const snap = await get(ref(rtdb, `withdrawals/${withdrawalId}`));
      if (snap.exists()) w = snap.val();
    }
    if (!w) throw new Error('Withdrawal request not found');

    w.status = 'rejected';
    w.rejectionReason = reason;
    w.processedAt = Date.now();
    w.processedBy = adminUid;

    if (rtdb) await update(ref(rtdb, `withdrawals/${withdrawalId}`), w);
    withdrawals[withdrawalId] = w;
    setLocalItem(STORAGE_KEY_WITHDRAWALS, withdrawals);

    // Refund back to available balance!
    const wallet = await this.getWallet(w.uid);
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - w.amount);
    wallet.availableBalance += w.amount;
    await this.updateWallet(wallet);

    // Update transaction
    await this.updateTransactionStatus(`tx-wdr-${withdrawalId}`, 'rejected');

    await this.logAdminAction(
      adminUid,
      'WITHDRAWAL_REJECTED',
      `Rejected withdrawal ${withdrawalId} of ${w.amount} PKR and refunded to wallet. Reason: ${reason}`,
      w.uid
    );
  },

  // --- TASKS ---
  async getTasks(): Promise<TaskItem[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'tasks'));
        if (snap?.exists()) {
          return Object.values(snap.val());
        }
      } catch (e) {
        console.error('RTDB getTasks error:', e);
      }
    }
    const tasks = getLocalItem<Record<string, TaskItem>>(STORAGE_KEY_TASKS, {});
    return Object.values(tasks);
  },

  async saveTask(task: TaskItem, adminUid: string): Promise<void> {
    if (rtdb) {
      await set(ref(rtdb, `tasks/${task.taskId}`), task);
    }
    const tasks = getLocalItem<Record<string, TaskItem>>(STORAGE_KEY_TASKS, {});
    tasks[task.taskId] = task;
    setLocalItem(STORAGE_KEY_TASKS, tasks);

    await this.logAdminAction(adminUid, 'SAVE_TASK', `Saved task ${task.title} (Reward: ${task.reward} PKR)`);
  },

  async deleteTask(taskId: string, adminUid: string): Promise<void> {
    if (rtdb) {
      await set(ref(rtdb, `tasks/${taskId}`), null);
    }
    const tasks = getLocalItem<Record<string, TaskItem>>(STORAGE_KEY_TASKS, {});
    delete tasks[taskId];
    setLocalItem(STORAGE_KEY_TASKS, tasks);

    await this.logAdminAction(adminUid, 'DELETE_TASK', `Deleted task ${taskId}`);
  },

  // --- TASK SUBMISSIONS ---
  async getSubmissions(uid?: string): Promise<TaskSubmission[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'taskSubmissions'));
        if (snap?.exists()) {
          const list: TaskSubmission[] = Object.values(snap.val());
          if (uid) return list.filter((s) => s.uid === uid).sort((a, b) => b.submittedAt - a.submittedAt);
          return list.sort((a, b) => b.submittedAt - a.submittedAt);
        }
      } catch (e) {
        console.error('RTDB getSubmissions error:', e);
      }
    }
    const submissions = getLocalItem<Record<string, TaskSubmission>>(STORAGE_KEY_SUBMISSIONS, {});
    const list = Object.values(submissions);
    if (uid) return list.filter((s) => s.uid === uid).sort((a, b) => b.submittedAt - a.submittedAt);
    return list.sort((a, b) => b.submittedAt - a.submittedAt);
  },

  async submitTask(
    sub: Omit<TaskSubmission, 'submissionId' | 'status' | 'submittedAt'>,
    autoApprove = false
  ): Promise<TaskSubmission> {
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const submission: TaskSubmission = {
      ...sub,
      submissionId,
      status: autoApprove ? 'approved' : 'pending',
      submittedAt: Date.now(),
      reviewedAt: autoApprove ? Date.now() : undefined,
    };

    if (rtdb) {
      await set(ref(rtdb, `taskSubmissions/${submissionId}`), submission);
    }
    const submissions = getLocalItem<Record<string, TaskSubmission>>(STORAGE_KEY_SUBMISSIONS, {});
    submissions[submissionId] = submission;
    setLocalItem(STORAGE_KEY_SUBMISSIONS, submissions);

    if (autoApprove) {
      // Credit wallet immediately
      const wallet = await this.getWallet(sub.uid);
      wallet.availableBalance += sub.reward;
      wallet.totalEarnedTasks += sub.reward;
      await this.updateWallet(wallet);

      await this.addTransaction({
        transactionId: `tx-tsk-${submissionId}`,
        uid: sub.uid,
        type: 'task_reward',
        amount: sub.reward,
        status: 'completed',
        description: `Task reward: ${sub.taskTitle}`,
        referenceId: submissionId,
        createdAt: Date.now(),
      });
    }

    return submission;
  },

  async approveSubmission(submissionId: string, adminUid: string): Promise<void> {
    const submissions = getLocalItem<Record<string, TaskSubmission>>(STORAGE_KEY_SUBMISSIONS, {});
    let sub = submissions[submissionId];

    if (rtdb) {
      const snap = await get(ref(rtdb, `taskSubmissions/${submissionId}`));
      if (snap.exists()) sub = snap.val();
    }
    if (!sub) throw new Error('Submission not found');
    if (sub.status === 'approved') return;

    sub.status = 'approved';
    sub.reviewedAt = Date.now();
    sub.reviewedBy = adminUid;

    if (rtdb) await update(ref(rtdb, `taskSubmissions/${submissionId}`), sub);
    submissions[submissionId] = sub;
    setLocalItem(STORAGE_KEY_SUBMISSIONS, submissions);

    // Credit user's wallet
    const wallet = await this.getWallet(sub.uid);
    wallet.availableBalance += sub.reward;
    wallet.totalEarnedTasks += sub.reward;
    await this.updateWallet(wallet);

    // Transaction
    await this.addTransaction({
      transactionId: `tx-tsk-${submissionId}`,
      uid: sub.uid,
      type: 'task_reward',
      amount: sub.reward,
      status: 'completed',
      description: `Task reward: ${sub.taskTitle}`,
      referenceId: submissionId,
      createdAt: Date.now(),
    });

    await this.logAdminAction(
      adminUid,
      'APPROVE_TASK_SUBMISSION',
      `Approved task submission ${submissionId} for ${sub.username} (${sub.reward} PKR)`,
      sub.uid
    );
  },

  async rejectSubmission(submissionId: string, adminUid: string, reason: string): Promise<void> {
    const submissions = getLocalItem<Record<string, TaskSubmission>>(STORAGE_KEY_SUBMISSIONS, {});
    let sub = submissions[submissionId];

    if (rtdb) {
      const snap = await get(ref(rtdb, `taskSubmissions/${submissionId}`));
      if (snap.exists()) sub = snap.val();
    }
    if (!sub) throw new Error('Submission not found');

    sub.status = 'rejected';
    sub.rejectionReason = reason;
    sub.reviewedAt = Date.now();
    sub.reviewedBy = adminUid;

    if (rtdb) await update(ref(rtdb, `taskSubmissions/${submissionId}`), sub);
    submissions[submissionId] = sub;
    setLocalItem(STORAGE_KEY_SUBMISSIONS, submissions);

    await this.logAdminAction(
      adminUid,
      'REJECT_TASK_SUBMISSION',
      `Rejected task submission ${submissionId}. Reason: ${reason}`,
      sub.uid
    );
  },

  // --- DAILY CHECK-IN REWARD ---
  async claimDailyReward(uid: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_${uid}_${today}`;
    const alreadyClaimed = localStorage.getItem(key);

    if (alreadyClaimed) {
      throw new Error('You have already claimed your daily reward today. Come back tomorrow after 12:00 AM!');
    }

    const settings = await this.getSettings();
    const rewardAmount = settings.dailyLoginRewardPKR || 15;

    const wallet = await this.getWallet(uid);
    wallet.availableBalance += rewardAmount;
    wallet.lastDailyClaimDate = today;
    await this.updateWallet(wallet);

    localStorage.setItem(key, String(Date.now()));

    await this.addTransaction({
      transactionId: `tx-daily-${Date.now()}-${uid.substring(0, 4)}`,
      uid,
      type: 'daily_reward',
      amount: rewardAmount,
      status: 'completed',
      description: `Daily loyalty login bonus for ${today}`,
      createdAt: Date.now(),
    });

    return rewardAmount;
  },

  // --- TRANSACTIONS ---
  async getTransactions(uid?: string): Promise<Transaction[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'transactions'));
        if (snap?.exists()) {
          const list: Transaction[] = Object.values(snap.val());
          if (uid) return list.filter((t) => t.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch (e) {
        console.error('RTDB getTransactions error:', e);
      }
    }
    const txs = getLocalItem<Record<string, Transaction>>(STORAGE_KEY_TRANSACTIONS, {});
    const list = Object.values(txs);
    if (uid) return list.filter((t) => t.uid === uid).sort((a, b) => b.createdAt - a.createdAt);
    return list.sort((a, b) => b.createdAt - a.createdAt);
  },

  async addTransaction(tx: Transaction): Promise<void> {
    if (rtdb) {
      try {
        await set(ref(rtdb, `transactions/${tx.transactionId}`), tx);
      } catch (e) {
        console.error('RTDB addTransaction error:', e);
      }
    }
    const txs = getLocalItem<Record<string, Transaction>>(STORAGE_KEY_TRANSACTIONS, {});
    txs[tx.transactionId] = tx;
    setLocalItem(STORAGE_KEY_TRANSACTIONS, txs);
  },

  async updateTransactionStatus(transactionId: string, status: 'completed' | 'rejected' | 'pending'): Promise<void> {
    if (rtdb) {
      try {
        await update(ref(rtdb, `transactions/${transactionId}`), { status });
      } catch (e) {
        console.error('RTDB updateTransactionStatus error:', e);
      }
    }
    const txs = getLocalItem<Record<string, Transaction>>(STORAGE_KEY_TRANSACTIONS, {});
    if (txs[transactionId]) {
      txs[transactionId].status = status;
      setLocalItem(STORAGE_KEY_TRANSACTIONS, txs);
    }
  },

  // --- PLANS ---
  async getPlans(): Promise<DepositPlan[]> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'settings/depositPlans'));
        if (snap?.exists()) {
          return Object.values(snap.val());
        }
      } catch (e) {
        console.error('RTDB getPlans error:', e);
      }
    }
    return getLocalItem<DepositPlan[]>(STORAGE_KEY_PLANS, INITIAL_DEPOSIT_PLANS);
  },

  async savePlans(plans: DepositPlan[], adminUid: string): Promise<void> {
    if (rtdb) {
      await set(ref(rtdb, 'settings/depositPlans'), plans);
    }
    setLocalItem(STORAGE_KEY_PLANS, plans);
    await this.logAdminAction(adminUid, 'SAVE_PLANS', `Updated ${plans.length} deposit plans`);
  },

  // --- SETTINGS ---
  async getSettings(): Promise<PlatformSettings> {
    if (rtdb) {
      try {
        const snap = await safeRtdbGet(ref(rtdb, 'settings/website'));
        if (snap?.exists()) {
          return { ...INITIAL_PLATFORM_SETTINGS, ...snap.val() };
        }
      } catch (e) {
        console.error('RTDB getSettings error:', e);
      }
    }
    const local = getLocalItem<PlatformSettings>(STORAGE_KEY_SETTINGS, INITIAL_PLATFORM_SETTINGS);
    return { ...INITIAL_PLATFORM_SETTINGS, ...local };
  },

  async saveSettings(settings: PlatformSettings, adminUid: string): Promise<void> {
    if (rtdb) {
      await set(ref(rtdb, 'settings/website'), settings);
    }
    setLocalItem(STORAGE_KEY_SETTINGS, settings);
    await this.logAdminAction(adminUid, 'UPDATE_SETTINGS', 'Updated platform & payment settings');
  },

  // --- ADMIN LOGS ---
  async logAdminAction(adminUid: string, action: string, details: string, targetUid?: string): Promise<void> {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const admin = await this.getUser(adminUid);
    const newLog: AdminLog = {
      logId,
      adminUid,
      adminEmail: admin?.email || 'admin@earn4pkr.com',
      action,
      targetUid,
      details,
      timestamp: Date.now(),
    };

    if (rtdb) {
      try {
        await set(ref(rtdb, `adminLogs/${logId}`), newLog);
      } catch (e) {
        console.error('RTDB logAdminAction error:', e);
      }
    }
    const logs = getLocalItem<AdminLog[]>(STORAGE_KEY_ADMIN_LOGS, []);
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    setLocalItem(STORAGE_KEY_ADMIN_LOGS, logs);
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    if (rtdb) {
      try {
        const snap = await get(ref(rtdb, 'adminLogs'));
        if (snap.exists()) {
          const list: AdminLog[] = Object.values(snap.val());
          return list.sort((a, b) => b.timestamp - a.timestamp);
        }
      } catch (e) {
        console.error('RTDB getAdminLogs error:', e);
      }
    }
    return getLocalItem<AdminLog[]>(STORAGE_KEY_ADMIN_LOGS, []);
  },

  // --- SCREENSHOT UPLOAD ---
  async uploadPaymentScreenshot(file: File, folder = 'deposits'): Promise<string> {
    if (storage) {
      try {
        const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const sRef = storageRef(storage, filename);
        const res = await uploadBytes(sRef, file);
        return await getDownloadURL(res.ref);
      } catch (err) {
        console.warn('Firebase Storage upload failed, falling back to data URL:', err);
      }
    }
    // Return base64 data URL fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  },
};
