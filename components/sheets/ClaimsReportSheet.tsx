import React from 'react';
import { X, Check, XCircle, MapPin, Download, Sparkles, FileText } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { motion } from 'framer-motion';

interface ClaimsReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisResult | null;
  onDecision: (type: 'APPROVE' | 'REJECT') => void;
  onDownload: () => void;
  caseId: string;
}

export const ClaimsReportSheet: React.FC<ClaimsReportSheetProps> = ({ isOpen, onClose, data, onDecision, onDownload, caseId }) => {
  if (!isOpen || !data) return null;

  const rawRisk = data.fraud?.riskScore ?? 0;
  const riskScore = Math.max(5, rawRisk);
  const trustScore = Math.max(0, 100 - riskScore);
  
  const formatCurrency = (amount: number | undefined) => {
    return (amount ?? 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  const totalCost = data.insurance?.totalEstimatedCost ?? 0;
  const gpsCoords = data.forensics?.gpsCoordinates || 'Location Data Unavailable';
  const isHighRisk = riskScore > 50;
  
  const recommendation = data.summary?.recommendation || "Review";
  const confidence = data.summary?.confidenceScore ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Sheet Content */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-white">Final Claim Report</h2>
            <span className="text-xs text-zinc-500 font-mono">ID: {caseId}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Trust Score Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                 <circle 
                   cx="80" cy="80" r="70" 
                   stroke="currentColor" 
                   strokeWidth="8" 
                   fill="transparent" 
                   strokeDasharray={440} 
                   strokeDashoffset={440 - (440 * trustScore) / 100}
                   className={trustScore > 75 ? "text-emerald-500" : trustScore > 40 ? "text-amber-500" : "text-rose-500"}
                 />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className="text-3xl font-bold text-white">{trustScore}</span>
                 <span className="text-xs text-zinc-500 uppercase tracking-widest">Trust Score</span>
               </div>
            </div>
            
            <div className="mt-4 flex flex-col items-center gap-1">
              <span className={`text-sm font-bold uppercase tracking-widest px-3 py-1 rounded border ${
                 recommendation === 'Approve' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                 recommendation === 'Reject' ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' :
                 'text-amber-500 border-amber-500/20 bg-amber-500/10'
              }`}>
                {recommendation}
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Sparkles size={10} /> AI Confidence: {confidence}%
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-center">
                <span className="text-zinc-500 text-xs uppercase block mb-1">Total Impact</span>
                <span className="text-lg font-mono text-white">{formatCurrency(totalCost)}</span>
             </div>
             <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-center">
                <span className="text-zinc-500 text-xs uppercase block mb-1">Fraud Risk</span>
                <span className={`text-lg font-mono ${isHighRisk ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isHighRisk ? 'HIGH' : 'LOW'}
                </span>
             </div>
              <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-center col-span-2">
                  <span className="text-zinc-500 text-xs uppercase block mb-1">Collision Type</span>
                  <span className="text-md font-medium text-white">{data.insurance?.impactType || 'N/A'}</span>
              </div>
          </div>

          {/* Download PDF Button (Prominent) */}
          <button 
            onClick={onDownload}
            className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <div className="p-1 bg-zinc-900 text-white rounded">
              <FileText size={16} />
            </div>
            <span className="text-sm">DOWNLOAD OFFICIAL PDF REPORT</span>
            <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          </button>

          {/* Map Placeholder */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden h-40 relative opacity-75">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-122.4241,37.78,14.25,0,0/600x600?access_token=Pk')] opacity-30 bg-cover bg-center"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <MapPin className="text-rose-500 w-8 h-8 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-zinc-400 font-mono">
              {gpsCoords}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
             <p className="text-center text-xs text-zinc-500 mb-2 uppercase tracking-wide">Supervisor Decision Required</p>
             <button 
                onClick={() => onDecision('APPROVE')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
             >
                <Check size={18} /> Approve Claim
             </button>
             <button 
                onClick={() => onDecision('REJECT')}
                className="w-full py-3 bg-rose-900/50 border border-rose-900 hover:bg-rose-900/80 text-rose-200 rounded font-medium transition-colors flex items-center justify-center gap-2"
             >
                <XCircle size={18} /> Flag for Manual Review
             </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};