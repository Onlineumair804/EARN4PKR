/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Smartphone,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PlatformSettings } from '../types';

interface FAQProps {
  settings?: PlatformSettings | null;
  onNavigate?: (view: string) => void;
}

interface FAQItem {
  id: string;
  category: 'deposit' | 'withdrawal' | 'tasks' | 'referral' | 'general';
  categoryLabel: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string;
  icon: React.ElementType;
}

export const FAQ: React.FC<FAQProps> = ({ settings, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-deposit-1');

  const websiteName = settings?.websiteName || 'Earn4PKR';
  const minWithdrawal = settings?.minWithdrawalPKR ?? 200;
  const referralReward = settings?.referralRewardFixedPKR ?? 50;

  const faqs: FAQItem[] = useMemo(
    () => [
      {
        id: 'faq-deposit-1',
        category: 'deposit',
        categoryLabel: 'Deposit System',
        icon: ArrowDownCircle,
        question: 'How do I deposit money using JazzCash or Easypaisa?',
        answer:
          'Deposits on Earn4PKR are handled via secure manual verification to prevent automated errors or duplicate transaction attempts. Follow these straightforward steps:',
        steps: [
          'Choose a Deposit Plan (Starter, Basic, Silver, Gold, VIP, or Premium).',
          'Select your preferred payment gateway: JazzCash or Easypaisa.',
          'Copy our official merchant/admin account number displayed on the screen.',
          'Open your JazzCash or Easypaisa mobile app and transfer the exact plan amount.',
          'Copy the 11 or 12-digit Transaction ID (TRX ID / TID) from your payment receipt SMS.',
          'Paste the TRX ID into Earn4PKR and upload a clear screenshot of your payment receipt.',
          'Submit the request. Our finance administrators verify the payment against bank logs within 15–45 minutes.',
        ],
        tips: 'Always double-check that your TRX ID is entered accurately. Duplicate or reused Transaction IDs are automatically flagged and rejected.',
      },
      {
        id: 'faq-deposit-2',
        category: 'deposit',
        categoryLabel: 'Deposit System',
        icon: Smartphone,
        question: 'How long does deposit verification take?',
        answer:
          'Most JazzCash and Easypaisa deposits are approved within 15 to 45 minutes during official banking hours (9:00 AM – 11:00 PM PKT). Once verified by our admin team, your selected plan activates immediately and your tier features become accessible in your dashboard.',
      },
      {
        id: 'faq-deposit-3',
        category: 'deposit',
        categoryLabel: 'Deposit System',
        icon: ShieldCheck,
        question: 'Can I deposit without uploading a screenshot or Transaction ID?',
        answer:
          'No. To strictly safeguard user funds and prevent fraudulent claims, Earn4PKR enforces a strict zero-counterfeit policy. Both a valid Transaction ID from JazzCash or Easypaisa and an uploaded payment proof are mandatory for administrator verification.',
      },
      {
        id: 'faq-withdrawal-1',
        category: 'withdrawal',
        categoryLabel: 'Withdrawal System',
        icon: ArrowUpCircle,
        question: 'How do I withdraw my earnings to JazzCash or Easypaisa?',
        answer:
          'Withdrawing your earned PKR is fast and transparent. You can request payouts directly to your active Pakistani mobile wallet:',
        steps: [
          `Ensure your available wallet balance has reached at least ${minWithdrawal} PKR.`,
          'Go to the "Withdrawal" page or click "Withdraw" from your User Dashboard.',
          'Select JazzCash or Easypaisa as your payout method.',
          'Enter your registered Account Holder Name and 11-digit Mobile Wallet Number (e.g., 03001234567).',
          'Enter the payout amount and submit your withdrawal request.',
          'Our finance officers review the request, execute the mobile transfer, and update your status to Paid.',
        ],
        tips: 'Make sure your mobile wallet number is active and registered under your correct CNIC to prevent telecom payout reversals.',
      },
      {
        id: 'faq-withdrawal-2',
        category: 'withdrawal',
        categoryLabel: 'Withdrawal System',
        icon: Clock,
        question: `What is the minimum withdrawal limit and processing time?`,
        answer: `The minimum withdrawal threshold is ${minWithdrawal} PKR. Standard withdrawal requests are verified and processed within 1 to 24 hours. VIP tier holders receive expedited priority processing (as fast as 2 to 6 hours).`,
      },
      {
        id: 'faq-withdrawal-3',
        category: 'withdrawal',
        categoryLabel: 'Withdrawal System',
        icon: Wallet,
        question: 'Is there any fee or deduction on withdrawals?',
        answer:
          'Earn4PKR charges 0% platform withdrawal fees on standard tiers. You receive the exact requested amount into your JazzCash or Easypaisa account without hidden deductions.',
      },
      {
        id: 'faq-tasks-1',
        category: 'tasks',
        categoryLabel: 'Task Earning',
        icon: Sparkles,
        question: 'How do genuine task earnings work?',
        answer:
          'Users earn money by performing verified digital activities: visiting educational technology portals, watching informative videos on cyber safety & digital payments, and completing daily attendance check-ins. When you click "Start Task", an embedded countdown timer verifies genuine attention before crediting PKR to your wallet balance.',
      },
      {
        id: 'faq-tasks-2',
        category: 'tasks',
        categoryLabel: 'Task Earning',
        icon: CheckCircle2,
        question: 'What is the proposed 2% daily rate shown on deposit plans?',
        answer:
          'The 2% rate is strictly an analytical projection model displayed for educational and planning simulation purposes. In compliance with Pakistani financial regulations, Earn4PKR does not offer automated guaranteed investment returns; all real wallet earnings are derived from genuine user task completions.',
      },
      {
        id: 'faq-referral-1',
        category: 'referral',
        categoryLabel: 'Referral Rewards',
        icon: Users,
        question: 'How does the Referral & Invite Program work?',
        answer:
          'Every registered member receives a unique Referral Code and shareable WhatsApp link. When a friend signs up using your invitation code, you receive an instant reward bonus of ' +
          referralReward +
          ' PKR once they activate their account. Plus, you earn multi-tier percentage commissions on their ongoing task completions.',
      },
      {
        id: 'faq-general-1',
        category: 'general',
        categoryLabel: 'Security & Maintenance',
        icon: HelpCircle,
        question: 'What happens during scheduled platform maintenance?',
        answer:
          'When system updates or security enhancements are taking place, the website temporarily enters Maintenance Mode with a live countdown timer. All user wallet balances, transaction ledgers, and referral points remain 100% secure in the database. As soon as the timer completes, normal services resume automatically.',
      },
      {
        id: 'faq-general-2',
        category: 'general',
        categoryLabel: 'Security & Maintenance',
        icon: ShieldCheck,
        question: 'How can I contact official Earn4PKR customer support?',
        answer:
          'You can contact our official team via WhatsApp helpline (' +
          (settings?.contactWhatsapp || '+92 300 1234567') +
          ') or email (' +
          (settings?.contactEmail || 'support@earn4pkr.com') +
          ') for swift assistance with deposits, withdrawals, or account verification.',
      },
    ],
    [websiteName, minWithdrawal, referralReward, settings]
  );

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'deposit', label: 'Deposits (JazzCash / Easypaisa)' },
    { id: 'withdrawal', label: 'Withdrawal Rules' },
    { id: 'tasks', label: 'Tasks & Earning' },
    { id: 'referral', label: 'Referral Program' },
    { id: 'general', label: 'Security & System' },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Help &amp; Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Find instant answers on how to deposit with JazzCash and Easypaisa, complete genuine tasks, and withdraw your funds.
        </p>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none mt-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g., JazzCash deposit, withdrawal limit, TRX ID)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-navy-900/90 border border-navy-700 hover:border-amber-500/40 focus:border-amber-400 text-slate-100 placeholder-slate-500 text-xs sm:text-sm transition-all focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white mt-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-navy-900 border border-navy-800 text-slate-300 hover:text-white hover:border-navy-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-[#0a1122] border border-navy-800 p-6 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No matching questions found</p>
            <p className="text-xs text-slate-500">
              Try searching with different keywords like "deposit", "Easypaisa", "withdrawal", or "task".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-amber-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0b1328] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#0a1122] border-navy-800 hover:border-navy-700'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded
                          ? 'bg-amber-500 text-navy-950 font-bold'
                          : 'bg-navy-900 text-amber-400 border border-navy-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400/90 block mb-0.5">
                        {faq.categoryLabel}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-navy-900 border border-navy-800 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-amber-400 border-amber-500/30' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 space-y-3.5 border-t border-navy-800/80 animate-in fade-in duration-200">
                    <p className="leading-relaxed text-slate-300">{faq.answer}</p>

                    {faq.steps && faq.steps.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/90 space-y-2">
                        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          Step-by-Step Instructions:
                        </p>
                        <ol className="space-y-1.5 pl-4 list-decimal text-xs text-slate-300">
                          {faq.steps.map((step, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {faq.tips && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{faq.tips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Help Hotline Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0a1329] to-navy-900 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="text-center sm:text-left space-y-1">
          <p className="text-xs sm:text-sm font-bold text-white">Still have questions?</p>
          <p className="text-xs text-slate-400">
            Our support agents in Pakistan are ready to assist you on WhatsApp or via our helpdesk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {settings?.contactWhatsapp && (
            <a
              href={`https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('deposit')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              View Deposit Plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
