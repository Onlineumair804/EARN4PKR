/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Play,
  Flame,
  Filter,
  Check,
  XCircle,
} from 'lucide-react';
import { TaskCategory, TaskItem, TaskSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/firebase';
import { TaskModal } from '../components/TaskModal';

interface TasksPageProps {
  onNavigate: (view: string) => void;
}

export const Tasks: React.FC<TasksPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'available' | 'submissions'>('available');
  const [activeTaskForModal, setActiveTaskForModal] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allTasks = await dbService.getTasks();
      setTasks(allTasks);
      if (currentUser) {
        const userSubs = await dbService.getSubmissions(currentUser.uid);
        setSubmissions(userSubs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const completedTaskIds = new Set(
    submissions.filter((s) => s.status === 'approved').map((s) => s.taskId)
  );
  const pendingTaskIds = new Set(
    submissions.filter((s) => s.status === 'pending').map((s) => s.taskId)
  );

  const filteredTasks = tasks.filter((t) => {
    if (t.status === 'paused' || t.status === 'archived') return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Earn with Genuine Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Complete partner website visits, watch tutorials, and earn verified rewards directly to your wallet.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 bg-navy-900 border border-navy-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'available'
                ? 'bg-amber-500 text-navy-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'submissions'
                ? 'bg-amber-500 text-navy-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Submissions ({submissions.length})
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <div className="space-y-6">
          {/* Category Filters (Segmented Controls) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'website_visit', label: 'Website Visits' },
              { id: 'video_watch', label: 'Watch Videos' },
              { id: 'daily_checkin', label: 'Daily Bonus' },
              { id: 'referral', label: 'Referrals' },
              { id: 'admin_custom', label: 'Special Sponsor Tasks' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tasks Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
              Loading available tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 p-8 rounded-2xl bg-[#0a1122] border border-navy-800">
              No tasks found in this category. Check back soon for new sponsor opportunities.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => {
                const isCompleted = completedTaskIds.has(task.taskId);
                const isPending = pendingTaskIds.has(task.taskId);

                return (
                  <div
                    key={task.taskId}
                    className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wide">
                          {task.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.durationSeconds > 0 ? `${task.durationSeconds}s` : 'Instant'}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {task.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-navy-800/80 mt-4 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                          +{task.reward}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">PKR</span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : isPending ? (
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Under Review</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (task.category === 'referral') {
                              onNavigate('referral');
                            } else {
                              setActiveTaskForModal(task);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20"
                        >
                          Start Task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* My Submissions Table */
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Task Completion History</h2>
            <span className="text-xs text-slate-400">{submissions.length} Total Submissions</span>
          </div>

          {submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              You haven't submitted any tasks yet. Head over to Available Tasks to begin earning!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400">
                    <th className="pb-3 font-medium">Task</th>
                    <th className="pb-3 font-medium">Submitted At</th>
                    <th className="pb-3 font-medium text-right">Reward</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {submissions.map((sub) => (
                    <tr key={sub.submissionId} className="hover:bg-navy-900/40">
                      <td className="py-3">
                        <p className="font-semibold text-white">{sub.taskTitle}</p>
                        {sub.rejectionReason && (
                          <p className="text-[11px] text-rose-400 mt-0.5">
                            Reason: {sub.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                        +{sub.reward} PKR
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : sub.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Task Modal for live timer & questions */}
      <TaskModal
        task={activeTaskForModal}
        isOpen={Boolean(activeTaskForModal)}
        onClose={() => setActiveTaskForModal(null)}
        onSuccess={loadData}
      />
    </div>
  );
};
