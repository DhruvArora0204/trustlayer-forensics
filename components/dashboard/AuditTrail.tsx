import React, { useState } from 'react';
import { CaseRecord } from '../../types';
import { Search, Filter, ShieldCheck, Clock, UserCheck, Download, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePDF } from '../../services/pdfGenerator';

interface AuditTrailProps {
  logs: CaseRecord[];
  onOpenCase: (record: CaseRecord) => void;
  onDeleteCase: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, onOpenCase, onDeleteCase, searchTerm, onSearchChange }) => {

  const handleDownload = (e: React.MouseEvent, record: CaseRecord) => {
    e.stopPropagation(); // Prevent opening the case when clicking download
    if (record.analysisData) {
      generatePDF(record.id, record.analysisData, record.evidenceImage || null);
    } else {
      alert("Full report data unavailable for archived cases.");
    }
  };

  const handleDelete = (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete case ${recordId}? This action cannot be undone.`)) {
      onDeleteCase(recordId);
    }
  };

  // Enhanced search: Matches ID, AI Verdict/Recommendation, Human Decision, or Status
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.id.toLowerCase().includes(term) ||
      log.aiRecommendation.toLowerCase().includes(term) ||
      log.supervisorDecision.toLowerCase().includes(term) ||
      log.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" /> Audit Trail
          </h1>
          <p className="text-zinc-400 text-sm">Case Ledger: Tracking AI verdicts and human supervision.</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <input 
              type="text" 
              placeholder="Search ID, Verdict, or Status..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 rounded-md pl-9 pr-4 py-2 w-72 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" 
             />
           </div>
           <button className="p-2 border border-zinc-800 rounded-md hover:bg-zinc-900 text-zinc-400 transition-colors">
             <Filter size={18} />
           </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs">Case ID</th>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs">Init Time</th>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs">AI Verdict</th>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs">Final Verdict</th>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-medium text-zinc-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLogs.map((log, index) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onOpenCase(log)}
                  className="hover:bg-zinc-900/60 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-mono text-emerald-500/80 font-bold group-hover:text-emerald-400 flex items-center gap-2">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                       <span className={`font-medium inline-flex items-center gap-1.5 ${
                         log.aiRecommendation === 'Approve' ? 'text-emerald-400' : 
                         log.aiRecommendation === 'Reject' ? 'text-rose-400' : 'text-amber-400'
                       }`}>
                         {log.aiRecommendation === 'Review' ? 'Needs Review' : log.aiRecommendation}
                       </span>
                       <span className="text-[10px] text-zinc-500">{log.aiVerdict}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     {log.supervisorDecision === 'PENDING' ? (
                       <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-zinc-700 bg-zinc-800/50 text-zinc-400 text-[10px]">
                         <Clock size={10} /> Pending
                       </span>
                     ) : (
                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-wider border ${
                          log.supervisorDecision === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                       }`}>
                          <UserCheck size={10} />
                          {log.supervisorDecision}
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${
                        log.status === 'PROCESSING' ? 'text-amber-500 animate-pulse' :
                        log.status === 'WAITING_REVIEW' ? 'text-blue-400' :
                        'text-zinc-500'
                     }`}>
                        {log.status === 'PROCESSING' && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>}
                        {log.status === 'WAITING_REVIEW' && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
                        {log.status === 'WAITING_REVIEW' ? 'Awaiting Action' : log.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        {log.analysisData && (
                        <button 
                            onClick={(e) => handleDownload(e, log)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded transition-colors"
                            title="Download PDF"
                        >
                            <FileText size={16} />
                        </button>
                        )}
                        {log.status === 'CLOSED' && (
                          <button
                            onClick={(e) => handleDelete(e, log.id)}
                            className="p-1.5 text-zinc-500 hover:bg-rose-950/50 hover:text-rose-500 rounded transition-colors"
                            title="Delete Case Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center">
                <Search size={32} className="mb-3 text-zinc-700" />
                No records match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};