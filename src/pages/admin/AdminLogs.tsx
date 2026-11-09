/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Shield, Clock } from 'lucide-react';
import { dbService } from '../../services/firebase';
import { AdminLog } from '../../types';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService
      .getAdminLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      (log.targetUid && log.targetUid.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Activity Logs</h1>
          <p className="text-xs text-slate-400">
            Immutable audit trail of all administrative approvals, payouts, adjustments, and suspensions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, details, admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-[#0a1122] border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Audit Entries</h2>
          <span className="text-xs text-slate-400 font-mono">{filteredLogs.length} Records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
            Loading activity audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No administrative activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400">
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium">Admin Operator</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Audit Details</th>
                  <th className="pb-3 font-medium text-right">Target UID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-navy-900/40">
                    <td className="py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-white">{log.adminEmail}</p>
                      <p className="text-[10px] font-mono text-slate-500">{log.adminUid}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 max-w-md">{log.details}</td>
                    <td className="py-3 text-right font-mono text-[11px] text-slate-400">
                      {log.targetUid || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
