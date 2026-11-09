/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  auth,
  dbService,
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  FirebaseConfigParams,
} from '../services/firebase';
import { UserProfile, Wallet } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  wallet: Wallet | null;
  isAdmin: boolean;
  loading: boolean;
  isFirebaseLive: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (
    email: string,
    username: string,
    pass: string,
    refCode?: string
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshWallet: () => Promise<Wallet | null>;
  reloadUser: () => Promise<void>;
  saveCustomConfig: (config: FirebaseConfigParams) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'earn4pkr_active_session_uid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebaseLive = isFirebaseConfigured() && Boolean(auth);

  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const profile = await dbService.getUser(uid);
      if (profile) {
        setCurrentUser(profile);
        const userWallet = await dbService.getWallet(uid);
        setWallet(userWallet);
      } else {
        setCurrentUser(null);
        setWallet(null);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  const refreshWallet = useCallback(async (): Promise<Wallet | null> => {
    if (!currentUser) return null;
    try {
      const w = await dbService.getWallet(currentUser.uid);
      setWallet(w);
      return w;
    } catch (err) {
      console.error('Failed to refresh wallet:', err);
      return null;
    }
  }, [currentUser]);

  const reloadUser = useCallback(async () => {
    if (currentUser?.uid) {
      await fetchUserData(currentUser.uid);
    }
  }, [currentUser, fetchUserData]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isFirebaseLive && auth) {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          await fetchUserData(fbUser.uid);
        } else {
          setCurrentUser(null);
          setWallet(null);
        }
        setLoading(false);
      });
    } else {
      // Local session mode
      const activeUid = localStorage.getItem(LOCAL_SESSION_KEY);
      if (activeUid) {
        fetchUserData(activeUid).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isFirebaseLive, fetchUserData]);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check admin email or UID override
      const adminEmails = [
        ((import.meta.env.VITE_ADMIN_EMAIL as string) || '').toLowerCase(),
        'syedhumyiar@gmail.com',
        'syedumair56300@gmail.com',
        'admin@earn4pkr.com',
      ].filter(Boolean);

      if (isFirebaseLive && auth) {
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (authErr: any) {
          const errCode = authErr?.code || '';
          const errMsg = authErr?.message || '';

          if (
            errCode === 'auth/api-key-not-valid-please-pass-a-valid-api-key' ||
            errMsg.includes('api-key-not-valid')
          ) {
            console.warn('API key mismatch encountered in browser session, auto-healing...');
            localStorage.removeItem('earn4pkr_firebase_custom_config');
            throw new Error('Authentication session refreshed. Please click login again.');
          }

          if (errCode === 'auth/invalid-credential' || errCode === 'auth/wrong-password') {
            throw new Error('Invalid email or password. Please verify your credentials.');
          }
          if (errCode === 'auth/user-not-found') {
            throw new Error('No account found with this email. Please register first.');
          }
          if (errCode === 'auth/too-many-requests') {
            throw new Error('Access temporarily suspended due to multiple failed login attempts. Please wait a few moments.');
          }
          throw new Error(authErr?.message || 'Firebase login failed. Please verify your credentials.');
        }

        const fbUid = userCredential.user.uid;
        let profile = await dbService.getUser(fbUid);

        const isSuperAdmin =
          adminEmails.includes(cleanEmail) ||
          fbUid === 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2';

        if (!profile) {
          // Provision initial profile
          profile = {
            uid: fbUid,
            username: cleanEmail === 'syedhumyiar@gmail.com' ? 'Syed Humyiar (Owner)' : cleanEmail.split('@')[0],
            email: cleanEmail,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            accountStatus: 'active',
            role: isSuperAdmin ? 'admin' : 'user',
            createdAt: Date.now(),
            emailVerified: userCredential.user.emailVerified,
          };
          await dbService.setUser(profile);
        } else if (isSuperAdmin && profile.role !== 'admin') {
          profile.role = 'admin';
          await dbService.setUser(profile);
        }

        if (profile.accountStatus === 'suspended') {
          await fbSignOut(auth);
          throw new Error('Your account has been suspended by administration. Please contact support.');
        }

        setCurrentUser(profile);
        const userWallet = await dbService.getWallet(fbUid);
        setWallet(userWallet);
        return profile;
      } else {
        // Local mode login
        const allUsers = await dbService.getAllUsers();
        const found = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

        if (!found) {
          throw new Error('No account found with this email. Please check your credentials or register.');
        }

        if (found.accountStatus === 'suspended') {
          throw new Error('This account has been suspended by administration. Contact support.');
        }

        localStorage.setItem(LOCAL_SESSION_KEY, found.uid);
        setCurrentUser(found);
        const userWallet = await dbService.getWallet(found.uid);
        setWallet(userWallet);
        return found;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    pass: string,
    refCode?: string
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim();
      const adminEmails = [
        ((import.meta.env.VITE_ADMIN_EMAIL as string) || '').toLowerCase(),
        'syedhumyiar@gmail.com',
        'syedumair56300@gmail.com',
        'admin@earn4pkr.com',
      ].filter(Boolean);
      let uid = '';

      if (isFirebaseLive && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          uid = userCredential.user.uid;
        } catch (authErr: any) {
          const errCode = authErr?.code || '';
          if (errCode === 'auth/email-already-in-use') {
            throw new Error('An account with this email address already exists. Please log in.');
          }
          if (errCode === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters.');
          }
          if (
            errCode === 'auth/api-key-not-valid-please-pass-a-valid-api-key' ||
            authErr?.message?.includes('api-key-not-valid')
          ) {
            console.warn('API key mismatch encountered in browser session, auto-healing...');
            localStorage.removeItem('earn4pkr_firebase_custom_config');
            throw new Error('Configuration refreshed. Please click register again.');
          }
          throw new Error(authErr?.message || 'Registration failed.');
        }
      } else {
        // Local mode duplicate check
        const allUsers = await dbService.getAllUsers();
        if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
          throw new Error('An account with this email address already exists.');
        }
        uid = cleanEmail === 'syedhumyiar@gmail.com' ? 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2' : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }

      const isSuperAdmin =
        adminEmails.includes(cleanEmail) ||
        uid === 'i9ajhjk1xFYNGOL6mFsEyZOL5GY2';

      // Generate unique referral code
      const myRefCode = 'PKR' + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Resolve referral
      let referrerUid: string | undefined;
      if (refCode && refCode.trim()) {
        const allUsers = await dbService.getAllUsers();
        const referrer = allUsers.find(
          (u) => u.referralCode.toUpperCase() === refCode.trim().toUpperCase()
        );
        if (referrer && referrer.uid !== uid) {
          referrerUid = referrer.uid;

          // Award instant referral bonus to referrer
          const settings = await dbService.getSettings();
          const bonus = settings.referralRewardFixedPKR || 50;

          const referrerWallet = await dbService.getWallet(referrer.uid);
          referrerWallet.availableBalance += bonus;
          referrerWallet.totalEarnedReferrals += bonus;
          await dbService.updateWallet(referrerWallet);

          await dbService.addTransaction({
            transactionId: `tx-ref-${Date.now()}-${referrer.uid.substring(0, 4)}`,
            uid: referrer.uid,
            type: 'referral_bonus',
            amount: bonus,
            status: 'completed',
            description: `Referral bonus for inviting ${cleanUsername}`,
            createdAt: Date.now(),
          });
        }
      }

      const newProfile: UserProfile = {
        uid,
        username: cleanUsername,
        email: cleanEmail,
        referralCode: myRefCode,
        referredBy: referrerUid,
        accountStatus: 'active',
        role: isSuperAdmin ? 'admin' : 'user',
        createdAt: Date.now(),
        emailVerified: false,
      };

      await dbService.setUser(newProfile);

      // Create initial wallet
      const newWallet: Wallet = {
        uid,
        availableBalance: 25, // 25 PKR Welcome Bonus!
        pendingBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalEarnedTasks: 0,
        totalEarnedReferrals: 0,
        updatedAt: Date.now(),
      };
      await dbService.updateWallet(newWallet);

      // Add Welcome Bonus transaction
      await dbService.addTransaction({
        transactionId: `tx-welcome-${uid}`,
        uid,
        type: 'daily_reward',
        amount: 25,
        status: 'completed',
        description: 'Welcome Sign-up Bonus to Earn4PKR VIP',
        createdAt: Date.now(),
      });

      if (!isFirebaseLive) {
        localStorage.setItem(LOCAL_SESSION_KEY, uid);
      }

      setCurrentUser(newProfile);
      setWallet(newWallet);
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (isFirebaseLive && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setCurrentUser(null);
    setWallet(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (isFirebaseLive && auth) {
      await fbSendPasswordResetEmail(auth, cleanEmail);
    } else {
      // Simulate password reset
      const allUsers = await dbService.getAllUsers();
      const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        throw new Error('No registered account was found with that email address.');
      }
      // Mock reset success
    }
  };

  const saveCustomConfig = (config: FirebaseConfigParams) => {
    localStorage.setItem('earn4pkr_firebase_custom_config', JSON.stringify(config));
    window.location.reload();
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        wallet,
        isAdmin,
        loading,
        isFirebaseLive,
        login,
        register,
        logout,
        resetPassword,
        refreshWallet,
        reloadUser,
        saveCustomConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
