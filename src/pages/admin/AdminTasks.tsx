/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Coins,
  CheckCircle2,
  XCircle,
  X,
  FileText,
} from 'lucide-react';
import { dbService } from '../../services/firebase';
import { TaskCategory, TaskItem, TaskSubmission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminTasks: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'submissions'>('manage');
  const [loading, setLoading] = useState(true);

  // Edit / Create Task Modal
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('website_visit');
  const [reward, setReward] = useState('20');
  const [durationSeconds, setDurationSeconds] = useState('30');
  const [visitUrl, setVisitUrl] = useState('');
  const [instructions, setInstructions] = useState('');

  // Reject submission modal
  const [rejectingSub, setRejectingSub] = useState<TaskSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, sList] = await Promise.all([
        dbService.getTasks(),
        dbService.getSubmissions(),
      ]);
      setTasks(tList);
      setSubmissions(sList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setCategory('website_visit');
    setReward('20');
    setDurationSeconds('30');
    setVisitUrl('');
    setInstructions('Visit the sponsor page, keep it active for the specified duration, and submit verification.');
    setIsCreating(true);
  };

  const openEditModal = (t: TaskItem) => {
    setEditingTask(t);
    setTitle(t.title);
    setDescription(t.description);
    setCategory(t.category);
    setReward(String(t.reward));
    setDurationSeconds(String(t.durationSeconds));
    setVisitUrl(t.visitUrl || '');
    setInstructions(t.instructions);
    setIsCreating(false);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const rewardNum = parseFloat(reward);
    const durationNum = parseInt(durationSeconds, 10);

    if (isNaN(rewardNum) || rewardNum <= 0) {
      showToast('Please specify a positive reward amount.', 'error');
      return;
    }

    const taskId = editingTask ? editingTask.taskId : `task-${Date.now()}`;
    const newTask: TaskItem = {
      taskId,
      title: title.trim(),
      description: description.trim(),
      category,
      reward: rewardNum,
      durationSeconds: isNaN(durationNum) ? 0 : durationNum,
      visitUrl: visitUrl.trim() || undefined,
      instructions: instructions.trim(),
      status: editingTask ? editingTask.status : 'active',
      createdAt: editingTask ? editingTask.createdAt : Date.now(),
    };

    try {
      await dbService.saveTask(newTask, currentUser.uid);
      showToast(`Task "${title}" saved successfully!`, 'success');
      setEditingTask(null);
      setIsCreating(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save task.', 'error');
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    if (!currentUser) return;
    const newStatus = task.status === 'active' ? 'paused' : 'active';
    try {
      await dbService.saveTask({ ...task, status: newStatus }, currentUser.uid);
      showToast(`Task ${task.title} is now ${newStatus}.`, 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await dbService.deleteTask(taskId, currentUser.uid);
      showToast('Task deleted.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task.', 'error');
    }
  };

  const handleApproveSubmission = async (sub: TaskSubmission) => {
    if (!currentUser) return;
    try {
      await dbService.approveSubmission(sub.submissionId, currentUser.uid);
      showToast(`Task submission approved! +${sub.reward} PKR credited to ${sub.username}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve submission.', 'error');
    }
  };

  const handleConfirmRejectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSub || !currentUser) return;
    try {
      await dbService.rejectSubmission(
        rejectingSub.submissionId,
        currentUser.uid,
        rejectionReason.trim()
      );
      showToast('Task submission rejected.', 'info');
      setRejectingSub(null);
      setRejectionReason('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject submission.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Task Management</h1>
          <p className="text-xs text-slate-400">
            Create partner tasks, configure reward amounts, and audit user completions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-navy-900 border border-navy-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'manage'
                  ? 'bg-amber-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'submissions'
                  ? 'bg-amber-500 text-navy-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-navy-950 font-bold text-xs hover:from-amber-300 hover:to-amber-500 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {activeTab === 'manage' ? (
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <h2 className="text-base font-bold text-white">Available Tasks</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="p-5 rounded-xl bg-navy-950 border border-navy-800 hover:border-amber-500/30 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {task.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        task.status === 'active'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-400 bg-navy-800'
                      }`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{task.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-base font-bold font-mono text-amber-400">
                      +{task.reward} PKR
                    </span>
                    <span className="text-slate-500 text-[10px] ml-1">
                      ({task.durationSeconds}s)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300"
                      title={task.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {task.status === 'active' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-amber-300"
                      title="Edit task"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="p-1.5 rounded-lg bg-navy-900 hover:bg-rose-500/20 text-rose-400"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Submissions review table */
        <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
          <h2 className="text-base font-bold text-white">User Task Submissions</h2>

          {submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No task submissions to review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-navy-800 text-slate-400">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Task</th>
                    <th className="pb-3 font-medium">Proof Notes</th>
                    <th className="pb-3 font-medium text-right">Reward</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {submissions.map((sub) => (
                    <tr key={sub.submissionId} className="hover:bg-navy-900/40">
                      <td className="py-3">
                        <p className="font-semibold text-white">{sub.username}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{sub.userEmail}</p>
                      </td>
                      <td className="py-3 font-medium text-white">{sub.taskTitle}</td>
                      <td className="py-3 text-slate-300 max-w-xs truncate">
                        {sub.proofText || 'Automated Timer Completion'}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                        +{sub.reward} PKR
                      </td>
                      <td className="py-3 text-center">
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
                      <td className="py-3 text-right whitespace-nowrap">
                        {sub.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveSubmission(sub)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingSub(sub);
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">
                            {sub.status === 'approved' ? 'Credited' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      {(isCreating || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Sponsor Task'}
              </h3>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsCreating(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Visit Pakistan Tech Forum"
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="website_visit">Website Visit</option>
                  <option value="video_watch">Video Watching</option>
                  <option value="daily_checkin">Daily Check-in</option>
                  <option value="referral">Referral Task</option>
                  <option value="admin_custom">Custom Sponsor Task</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reward Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target URL (if website visit)
                </label>
                <input
                  type="url"
                  value={visitUrl}
                  onChange={(e) => setVisitUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of what the user will do..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step by step instructions for the user..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setIsCreating(false);
                  }}
                  className="px-3 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold transition-all shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Submission Modal */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reject Task Submission</h3>
            <form onSubmit={handleConfirmRejectSubmission} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Rejecting submission for task <strong className="text-white">{rejectingSub.taskTitle}</strong> by{' '}
                <strong className="text-amber-400">{rejectingSub.username}</strong>.
              </p>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Timer closed before completion, invalid answers..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingSub(null)}
                  className="px-3 py-2 rounded-lg text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
