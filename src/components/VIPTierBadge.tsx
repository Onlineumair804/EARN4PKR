/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Crown,
  Gem,
  Award,
  ShieldCheck,
  Star,
  Zap,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { DepositPlan } from '../types';

export interface VIPTierMeta {
  tierId: string;
  name: string;
  badgeCode: string;
  level: number;
  icon: LucideIcon;
  gradientClass: string;
  borderClass: string;
  textClass: string;
  bgPillClass: string;
  glowClass: string;
  accentColor: string;
  tagline: string;
  perks: string[];
}

export function getVIPTierMeta(plan?: DepositPlan | null): VIPTierMeta {
  if (!plan) {
    return {
      tierId: 'free',
      name: 'Standard Free Member',
      badgeCode: 'FREE',
      level: 0,
      icon: ShieldCheck,
      gradientClass: 'from-slate-800 via-navy-900 to-slate-950',
      borderClass: 'border-slate-700/60',
      textClass: 'text-slate-300',
      bgPillClass: 'bg-slate-800/80 text-slate-300 border-slate-700',
      glowClass: 'shadow-slate-900/30',
      accentColor: '#94a3b8',
      tagline: 'Basic task earning enabled',
      perks: ['Level 1 Micro Tasks', 'Standard 24h Payout Queue', 'Community Support'],
    };
  }

  const id = plan.id.toLowerCase();

  if (id.includes('premium') || id.includes('crown')) {
    return {
      tierId: 'premium',
      name: 'Premium Crown',
      badgeCode: 'VIP CROWN',
      level: 6,
      icon: Crown,
      gradientClass: 'from-amber-500/25 via-yellow-600/20 to-navy-950',
      borderClass: 'border-amber-400/80',
      textClass: 'text-amber-300',
      bgPillClass: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-navy-950 font-black border-amber-300',
      glowClass: 'shadow-amber-500/30',
      accentColor: '#fbbf24',
      tagline: 'Highest Yield & Concierge Privileges',
      perks: [
        '100 PKR/day Proposed Rate',
        'VIP Concierge 24/7 Support',
        'Fastest Priority Payouts',
        'Zero Platform Deduction',
      ],
    };
  }

  if (id.includes('vip') || id.includes('executive')) {
    return {
      tierId: 'vip',
      name: 'VIP Executive',
      badgeCode: 'VIP 5',
      level: 5,
      icon: Gem,
      gradientClass: 'from-purple-600/20 via-pink-600/15 to-navy-950',
      borderClass: 'border-purple-400/60',
      textClass: 'text-purple-300',
      bgPillClass: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      glowClass: 'shadow-purple-500/25',
      accentColor: '#c084fc',
      tagline: 'Executive VIP Status & Dedicated Hotline',
      perks: [
        '40 PKR/day Proposed Rate',
        'Dedicated WhatsApp Hotline',
        'Priority 2h Processing',
        'Maximum Task Allocation',
      ],
    };
  }

  if (id.includes('gold')) {
    return {
      tierId: 'gold',
      name: 'Gold VIP',
      badgeCode: 'VIP 4',
      level: 4,
      icon: Crown,
      gradientClass: 'from-amber-500/20 via-amber-600/10 to-navy-950',
      borderClass: 'border-amber-500/60',
      textClass: 'text-amber-400',
      bgPillClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glowClass: 'shadow-amber-500/25',
      accentColor: '#f59e0b',
      tagline: 'Most Popular VIP Member Tier',
      perks: [
        '20 PKR/day Proposed Rate',
        'High-Yield Sponsored Tasks',
        'Express 6h Withdrawal Queue',
        '2.0x Referral Multiplier',
      ],
    };
  }

  if (id.includes('silver')) {
    return {
      tierId: 'silver',
      name: 'Silver VIP',
      badgeCode: 'VIP 3',
      level: 3,
      icon: Zap,
      gradientClass: 'from-cyan-600/20 via-slate-700/20 to-navy-950',
      borderClass: 'border-cyan-400/50',
      textClass: 'text-cyan-300',
      bgPillClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      glowClass: 'shadow-cyan-500/20',
      accentColor: '#22d3ee',
      tagline: 'High Speed Video & Web Tasks Access',
      perks: [
        '10 PKR/day Proposed Rate',
        'Full Video & Web Tasks Access',
        '12h Withdrawal Queue',
        '1.5x Referral Multiplier',
      ],
    };
  }

  if (id.includes('basic')) {
    return {
      tierId: 'basic',
      name: 'Basic VIP',
      badgeCode: 'VIP 2',
      level: 2,
      icon: Star,
      gradientClass: 'from-blue-600/20 via-indigo-700/15 to-navy-950',
      borderClass: 'border-blue-400/50',
      textClass: 'text-blue-300',
      bgPillClass: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      glowClass: 'shadow-blue-500/20',
      accentColor: '#60a5fa',
      tagline: 'Level 1 & 2 Task Multipliers',
      perks: [
        '6 PKR/day Proposed Rate',
        'Level 1 & 2 Tasks Access',
        'Priority Withdrawal Handling',
        '1.2x Referral Multiplier',
      ],
    };
  }

  // starter
  return {
    tierId: 'starter',
    name: 'Starter VIP',
    badgeCode: 'VIP 1',
    level: 1,
    icon: Award,
    gradientClass: 'from-amber-600/15 via-orange-600/10 to-navy-950',
    borderClass: 'border-amber-600/50',
    textClass: 'text-amber-400',
    bgPillClass: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
    glowClass: 'shadow-amber-600/20',
    accentColor: '#d97706',
    tagline: 'Starter Entry VIP Tier',
    perks: [
      '2 PKR/day Proposed Rate',
      'Level 1 Micro Tasks Access',
      'JazzCash & Easypaisa Processing',
      'Standard 24h Queue',
    ],
  };
}

interface VIPTierBadgeProps {
  plan?: DepositPlan | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VIPTierBadge: React.FC<VIPTierBadgeProps> = ({
  plan,
  size = 'md',
  showLabel = true,
}) => {
  const meta = getVIPTierMeta(plan);
  const Icon = meta.icon;

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${meta.bgPillClass} shadow-sm`}
        title={`${meta.name} - ${meta.tagline}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{meta.badgeCode}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border ${meta.bgPillClass} shadow-md`}
      >
        <div className="w-6 h-6 rounded-lg bg-navy-950/60 flex items-center justify-center">
          <Icon className="w-4 h-4 text-inherit" />
        </div>
        <div className="text-left leading-none">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-90 block">
            {meta.badgeCode}
          </span>
          {showLabel && (
            <span className="text-xs font-extrabold tracking-tight block mt-0.5">
              {meta.name}
            </span>
          )}
        </div>
      </div>
    );
  }

  // md (default)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${meta.bgPillClass} shadow-sm`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{meta.badgeCode}</span>
      {showLabel && <span className="font-sans font-semibold">· {meta.name}</span>}
    </span>
  );
};
