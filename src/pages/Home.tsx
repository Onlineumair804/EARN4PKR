/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Smartphone,
  Award,
  ChevronRight,
  Lock,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { DepositPlan } from '../types';

interface HomeProps {
  onNavigate: (view: string) => void;
  plans: DepositPlan[];
  onSelectPlan: (plan: DepositPlan) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, plans, onSelectPlan }) => {
  const faqs = [
    {
      q: 'How does Earn4PKR work?',
      a: 'Earn4PKR is a genuine Pakistani micro-task and VIP earning platform. Users complete daily tasks such as sponsored website visits, educational video watching, and community invitations to earn verified PKR directly into their wallet.',
    },
    {
      q: 'Which payment methods are supported for deposits and withdrawals?',
      a: 'We exclusively support Pakistan’s two most trusted mobile wallets: JazzCash and Easypaisa. Every deposit and withdrawal is verified manually by our finance team.',
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal threshold is 200 PKR. Once requested, withdrawals are processed to your verified JazzCash or Easypaisa number within 1 to 24 hours.',
    },
    {
      q: 'What is the proposed 2% daily rate for deposit plans?',
      a: 'The 2% rate is displayed strictly for financial projection and simulation planning. Automatic guaranteed deposit returns are disabled until regulatory licenses are completed. Real earnings come from completing available tasks.',
    },
    {
      q: 'How much can I earn by inviting friends?',
      a: 'Every member receives a unique referral code. You earn 50 PKR for each active referred member who joins and verifies their account.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 lg:pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pakistan's Premier VIP Task Reward Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
                Earn Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">PKR</span> with Verified Tasks & VIP Rewards
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Complete genuine website reviews, video tutorials, daily attendance check-ins, and invite friends. Fast manual withdrawals directly to <span className="text-white font-medium">JazzCash</span> and <span className="text-white font-medium">Easypaisa</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base group"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('plans')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/50 text-slate-200 hover:text-white font-semibold transition-all text-sm sm:text-base"
                >
                  View VIP Plans
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-navy-800/80">
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">25 PKR</p>
                  <p className="text-xs text-slate-400">Welcome Bonus</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">100 PKR</p>
                  <p className="text-xs text-slate-400">Min Deposit</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">200 PKR</p>
                  <p className="text-xs text-slate-400">Min Withdrawal</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-500/10 group">
                <img
                  src="/src/assets/images/earn4pkr_hero_banner_1794190094762.jpg"
                  alt="Earn4PKR VIP Wealth & Tasks Emblem"
                  className="w-full h-auto object-cover aspect-[16/9] lg:aspect-[4/3] group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-navy-900/90 border border-navy-700/80 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Supported Mobile Gateways</p>
                    <p className="text-xs font-bold text-white">JazzCash &amp; Easypaisa Manual Payouts</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">Simple &amp; Transparent</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How Earn4PKR Works</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Get started in under 2 minutes with simple tasks and daily rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-white">1. Create &amp; Claim 25 PKR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign up with your email and username. Your wallet is automatically credited with a 25 PKR welcome starter bonus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-white">2. Complete Genuine Tasks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse available tasks: visit partner websites with our anti-cheat timer, watch security videos, and claim your daily login bonus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 hover:border-amber-500/40 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-white">3. Fast Manual Withdrawals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once your balance reaches 200 PKR, submit a withdrawal request. Our team verifies and transfers funds directly to your JazzCash or Easypaisa.
            </p>
          </div>
        </div>
      </section>

      {/* Deposit Plans Section */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">VIP Upgrade Tiers</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Official Deposit Plans</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Choose a deposit plan to unlock higher-tier micro tasks, priority queues, and referral multipliers.
          </p>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-navy-900 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Proposed Daily Earning Rate Notice (2% Daily)</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
              The 2% daily rate represents a proposed projection for planning purposes. In accordance with policy, automatic guaranteed deposit-based profits are not enabled. All payouts are backed by genuine verified micro-tasks and manual admin verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-[#0a1122] border transition-all duration-300 flex flex-col justify-between relative ${
                plan.popular
                  ? 'border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'border-navy-800 hover:border-amber-500/40'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-navy-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                    {plan.vipTierBadge}
                  </span>
                  <span className="text-xs text-slate-400">{plan.durationDays} Days Duration</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                      {plan.depositAmount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-amber-400">PKR</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Proposed estimate: ~{Math.round(plan.depositAmount * 0.02)} PKR/day (2%)
                  </p>
                </div>

                <div className="border-t border-navy-800 pt-4 space-y-2">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-navy-900 border border-navy-700 text-white hover:border-amber-400'
                  }`}
                >
                  Select {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Referral Program Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#060a14] border border-amber-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Earn4PKR Referral Program</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Earn <span className="text-amber-400">50 PKR</span> for Every Friend You Invite
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Share your personal invitation code. When contacts register and complete their account setup, your wallet is automatically credited with referral commissions.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('referral')}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-navy-950 font-bold hover:bg-amber-400 transition-all text-xs sm:text-sm shadow-md shadow-amber-500/20"
                >
                  Get Your Referral Link
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-700 text-center space-y-2 w-full max-w-xs">
                <p className="text-xs text-slate-400">Fixed Referral Bounty</p>
                <p className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">50 PKR</p>
                <p className="text-[11px] text-slate-500">Per verified registration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to know about Earn4PKR tasks and payments.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#0a1122] border border-navy-800 space-y-1.5"
            >
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{faq.q}</span>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
