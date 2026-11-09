/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'navy' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = 'navy',
}) => {
  let iconBg = 'bg-navy-900 border-navy-700 text-amber-400';
  let borderHover = 'hover:border-amber-500/40';

  if (variant === 'gold') {
    iconBg = 'bg-gradient-to-br from-amber-500 to-amber-700 text-navy-950 font-black shadow-lg shadow-amber-500/20';
    borderHover = 'border-amber-500/50 hover:border-amber-400';
  } else if (variant === 'emerald') {
    iconBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    borderHover = 'hover:border-emerald-500/40';
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-[#0a1122] border border-navy-800 ${borderHover} transition-all duration-200 shadow-sm relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 tracking-wide">{label}</p>
          <p className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {value}
          </p>
          {subValue && (
            <p className="text-[11px] text-slate-500 pt-0.5">{subValue}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
