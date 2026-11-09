/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Coins,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dbService } from '../services/firebase';

interface Props {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<Props> = ({ task, isOpen, onClose, onSuccess }) => {
  const { currentUser, refreshWallet } = useAuth();
  const { showToast } = useToast();

  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [visited, setVisited] = useState<boolean>(false);
  const [proofText, setProofText] = useState<string>('');
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (task && isOpen) {
      setTimerRemaining(task.durationSeconds || 0);
      setTimerActive(false);
      setVisited(false);
      setProofText('');
      setSelectedQuizOption('');
      setSubmitting(false);
    }
  }, [task, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerRemaining]);

  if (!isOpen || !task || !currentUser) return null;

  const handleStartTimer = () => {
    setTimerActive(true);
    setVisited(true);
    if (task.visitUrl) {
      window.open(task.visitUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task.durationSeconds > 0 && timerRemaining > 0) {
      showToast(`Please wait ${timerRemaining}s for task verification to finish.`, 'error');
      return;
    }

    if (task.category === 'video_watch' && selectedQuizOption !== 'correct') {
      showToast('Please select the correct security answer to verify comprehension.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Auto-approve website visits and video watch tasks once timer finishes!
      const canAutoApprove =
        task.category === 'website_visit' ||
        task.category === 'video_watch' ||
        task.category === 'daily_checkin';

      await dbService.submitTask(
        {
          taskId: task.taskId,
          taskTitle: task.title,
          uid: currentUser.uid,
          username: currentUser.username,
          userEmail: currentUser.email,
          reward: task.reward,
          proofText: proofText || (visited ? 'Automated timer verification passed' : ''),
        },
        canAutoApprove
      );

      await refreshWallet();

      if (canAutoApprove) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#3b82f6'],
        });
        showToast(`Task completed! +${task.reward} PKR added to available balance.`, 'success');
      } else {
        showToast('Proof submitted! Pending Admin verification.', 'info');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit task.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1326] border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-800 bg-[#080e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{task.title}</h3>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold font-mono">
                <span>Reward: +{task.reward} PKR</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal">
                  {task.durationSeconds > 0 ? `${task.durationSeconds}s duration` : 'Instant'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1.5">
            <p className="font-semibold text-white text-xs">Task Instructions:</p>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line text-[11px]">
              {task.instructions}
            </p>
          </div>

          {/* Interactive Timer / Web Action */}
          {task.durationSeconds > 0 && (
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-2xl font-bold">
                <Clock className="w-6 h-6 animate-pulse" />
                <span className="tabular-nums">00:{timerRemaining < 10 ? `0${timerRemaining}` : timerRemaining}</span>
              </div>

              {!timerActive && timerRemaining > 0 && (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {task.category === 'website_visit' ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Website & Start {task.durationSeconds}s Timer</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Video & Verification Timer</span>
                    </>
                  )}
                </button>
              )}

              {timerActive && (
                <p className="text-slate-400 text-[11px] animate-pulse">
                  Verification in progress... Please keep window active.
                </p>
              )}

              {timerRemaining === 0 && (
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold text-xs py-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Time requirements fulfilled! You can claim your reward.</span>
                </div>
              )}
            </div>
          )}

          {/* Video Quiz verification */}
          {task.category === 'video_watch' && (
            <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-2">
              <p className="font-semibold text-white">Comprehension Question:</p>
              <p className="text-slate-400 text-[11px]">
                How should you protect your JazzCash / Easypaisa mobile account?
              </p>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-navy-950 border border-navy-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="radio"
                    name="quiz"
                    value="wrong1"
                    checked={selectedQuizOption === 'wrong1'}
                    onChange={(e) => setSelectedQuizOption(e.target.value)}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span>Share OTP with callers claiming to be bank agents</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-navy-950 border border-navy-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="radio"
                    name="quiz"
                    value="correct"
                    checked={selectedQuizOption === 'correct'}
                    onChange={(e) => setSelectedQuizOption(e.target.value)}
                    className="text-amber-500 focus:ring-0"
                  />
                  <span className="text-white font-medium">Never disclose your PIN or SMS OTP to anyone</span>
                </label>
              </div>
            </div>
          )}

          {/* Optional Proof Notes */}
          {task.category === 'admin_custom' && (
            <div>
              <label className="block font-semibold text-white mb-1">
                Proof of Completion / Confirmation Code:
              </label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="Enter transaction reference, username, or completion details..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || (task.durationSeconds > 0 && timerRemaining > 0)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-navy-950 font-bold hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {submitting ? 'Verifying...' : `Verify & Claim ${task.reward} PKR`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
