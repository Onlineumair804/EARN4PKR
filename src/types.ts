/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AccountStatus = 'active' | 'suspended';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  accountStatus: AccountStatus;
  role: UserRole;
  createdAt: number;
  emailVerified: boolean;
  avatarUrl?: string;
}

export interface Wallet {
  uid: string;
  availableBalance: number;
  pendingBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnedTasks: number;
  totalEarnedReferrals: number;
  activePlanId?: string;
  lastDailyClaimDate?: string; // YYYY-MM-DD
  updatedAt: number;
}

export type PaymentMethod = 'JazzCash' | 'Easypaisa';
export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  depositId: string;
  uid: string;
  username: string;
  userEmail: string;
  amount: number;
  planId?: string;
  planName?: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  screenshotUrl?: string;
  status: DepositStatus;
  rejectionReason?: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface WithdrawalRequest {
  withdrawalId: string;
  uid: string;
  username: string;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountHolderName: string;
  accountNumber: string;
  status: WithdrawalStatus;
  payoutTransactionId?: string;
  rejectionReason?: string;
  createdAt: number;
  processedAt?: number;
  processedBy?: string;
}

export type TaskCategory = 'website_visit' | 'video_watch' | 'daily_checkin' | 'referral' | 'admin_custom';
export type TaskStatus = 'active' | 'paused' | 'archived';

export interface TaskItem {
  taskId: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: number; // in PKR
  durationSeconds: number; // time to wait or watch
  visitUrl?: string;
  instructions: string;
  status: TaskStatus;
  maxCompletionsPerUser?: number;
  createdAt: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  submissionId: string;
  taskId: string;
  taskTitle: string;
  uid: string;
  username: string;
  userEmail: string;
  reward: number;
  proofText?: string;
  proofScreenshotUrl?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'task_reward'
  | 'daily_reward'
  | 'referral_bonus'
  | 'admin_adjustment';

export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export interface Transaction {
  transactionId: string;
  uid: string;
  type: TransactionType;
  amount: number; // positive for income, negative for withdrawal
  status: TransactionStatus;
  description: string;
  referenceId?: string; // depositId, withdrawalId, submissionId
  createdAt: number;
}

export interface DepositPlan {
  id: string;
  name: string;
  depositAmount: number; // PKR
  proposedDailyRatePercent: number; // e.g. 2%
  durationDays: number;
  features: string[];
  enabled: boolean;
  vipTierBadge: string;
  popular?: boolean;
}

export interface PlatformSettings {
  websiteName: string;
  logoText: string;
  contactEmail: string;
  contactWhatsapp: string;
  jazzcashAccountName: string;
  jazzcashAccountNumber: string;
  easypaisaAccountName: string;
  easypaisaAccountNumber: string;
  referralRewardFixedPKR: number;
  minWithdrawalPKR: number;
  withdrawalFeePercent: number;
  dailyLoginRewardPKR: number;
  maintenanceMode: boolean;
  proposedRateDisclaimer: string;
}

export interface AdminLog {
  logId: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUid?: string;
  details: string;
  timestamp: number;
}
