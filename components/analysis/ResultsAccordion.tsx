import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { ChevronDown, AlertTriangle, CheckCircle, Smartphone, Car, DollarSign, ArrowRight, BrainCircuit, Activity, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsAccordionProps {
  results: AnalysisResult;
  onViewReport: () => void;
}

export const ResultsAccordion: React.FC<ResultsAccordionProps> = ({ results, onViewReport }) => {
  const [openSection, setOpenSection] = useState<string | null>('summary');

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);
  
  // Safe accessors
  const { forensics, insurance, fraud, summary } = results;
  
  // Risk Score Logic: Never 0, Minimum 5
  const rawRisk = fraud.riskScore ?? 0;
  const riskScore = Math.max(5, rawRisk);
  
  const isAiGenerated = fraud.isAiGenerated;
  const software = forensics.software || "";
  
  const confidence = summary?.confidenceScore ?? 0;
  const recommendation = summary?.recommendation ?? "Review";

  // Dynamic Color Logic based on Risk Buckets
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'CRITICAL RISK', color: 'text-rose-500', gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-500', border: 'border-rose-500' };
    if (score >= 50) return { label: 'HIGH RISK', color: 'text-orange-500', gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500', border: 'border-orange-500' };
    if (score >= 20) return { label: 'MODERATE RISK', color: 'text-amber-500', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500', border: 'border-amber-500' };
    return { label: 'LOW RISK', color: 'text-emerald-500', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500', border: 'border-emerald-500' };
  };

  const riskMeta = getRiskLevel(riskScore);

  return (
    <div className="space-y-4 mt-6">

      {/* New AI Summary Section - Default Open */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full"></div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-emerald-400">
             <BrainCircuit size={20} />
             <span className="font-semibold tracking-wide text-sm">AI CONSENSUS</span>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
            recommendation === 'Approve' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            recommendation === 'Reject' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
            'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
             {recommendation}
          </div>
        </div>
        
        <p className="text-zinc-300 text-sm leading-relaxed mb-4">
          {summary?.finalConclusion || "Analysis complete. Please review detailed findings below."}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
           <div className="flex items-center gap-2">
             <Activity size={14} />
             <span>Model Confidence: <span className="text-zinc-300">{confidence}%</span></span>
           </div>
           <div className="h-3 w-px bg-zinc-700"></div>
           <span>Processing Node: Gemini-3-Flash</span>
        </div>
      </div>
      
      {/* Forensics Item */}
      <AccordionItem 
        id="forensics"
        isOpen={openSection === 'forensics'}
        onClick={() => toggle('forensics')}
        title="Digital Forensics"
        icon={<Smartphone size={18} className="text-blue-500" />}
        badge="Verified"
        badgeColor="bg-blue-500/10 text-blue-500"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <DetailRow label="Device Model" value={forensics.deviceModel} />
          <DetailRow label="Software Sig" value={software} warning={software.toLowerCase().includes('photoshop')} />
          <DetailRow label="GPS Data" value={forensics.gpsCoordinates} fontMono />
          <DetailRow label="Timestamp" value={forensics.captureTime} fontMono />
          <div className="col-span-2 mt-2 p-3 bg-zinc-900/50 rounded border border-zinc-800">
            <span className="text-zinc-500 text-xs block mb-1">Visual Environment</span>
            <p className="text-zinc-300">{forensics.visualEnvironment}</p>
          </div>
        </div>
      </AccordionItem>

      {/* Insurance Item */}
      <AccordionItem 
        id="insurance"
        isOpen={openSection === 'insurance'}
        onClick={() => toggle('insurance')}
        title="Damage Assessment"
        icon={<Car size={18} className="text-amber-500" />}
        badge={insurance.damageClass || "Unknown"}
        badgeColor={insurance.damageClass === 'Total Loss' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}
      >
         <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pb-3 mb-3 border-b border-zinc-800">
            <DetailRow label="Vehicle ID" value={insurance.vehicleId} />
            <DetailRow label="Impact Type" value={insurance.impactType} />
          </div>
          
          <div className="space-y-2">
            <span className="text-zinc-500 text-xs uppercase tracking-wider">Identified Parts</span>
            {insurance.damagedParts?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-zinc-300">
                <span>{item.part}</span>
                <span className="font-mono text-zinc-400">₹{(item.estimatedCost ?? 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(!insurance.damagedParts || insurance.damagedParts.length === 0) && (
                <div className="text-zinc-500 italic text-xs">No specific parts identified.</div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/50 p-3 rounded">
            <span className="text-zinc-400 font-medium">Total Estimate</span>
            <span className="text-xl font-mono text-emerald-400 font-bold">
            ₹{(insurance.totalEstimatedCost ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </AccordionItem>

      {/* Fraud Item */}
      <AccordionItem 
        id="fraud"
        isOpen={openSection === 'fraud'}
        onClick={() => toggle('fraud')}
        title="Fraud Analysis"
        icon={<AlertTriangle size={18} className={riskMeta.color} />}
        badge={`Risk: ${riskScore}/100`}
        badgeColor={`${riskMeta.color.replace('text-', 'bg-')}/10 ${riskMeta.color}`}
      >
        <div className="space-y-3 text-sm">
          
          {/* Deepfake/AI Indicator */}
          <div className={`p-3 rounded border flex items-center gap-3 ${isAiGenerated ? 'bg-rose-500/10 border-rose-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
            <ScanFace size={20} className={isAiGenerated ? "text-rose-500" : "text-zinc-500"} />
            <div className="flex flex-col">
              <span className={`text-xs font-bold uppercase tracking-wider ${isAiGenerated ? "text-rose-500" : "text-zinc-400"}`}>
                Deepfake / AI Scan
              </span>
              <span className="text-zinc-300 text-xs">
                {isAiGenerated ? "WARNING: Synthetic Media Artifacts Detected" : "No generative AI signatures found."}
              </span>
            </div>
          </div>

          {/* Dynamic Risk Bar */}
          <div className="mb-4 pt-2">
             <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-zinc-500 font-medium">Risk Assessment</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${riskMeta.color} text-lg`}>{riskScore}%</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${riskMeta.bg}/10 ${riskMeta.color} border ${riskMeta.border}/20`}>
                    {riskMeta.label}
                  </span>
                </div>
             </div>
             
             {/* Gradient Bar Container */}
             <div className="w-full bg-zinc-800/50 h-3 rounded-full overflow-hidden relative border border-zinc-700/50">
                <div 
                  className={`h-full transition-all duration-700 ease-out bg-gradient-to-r ${riskMeta.gradient} shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                  style={{ width: `${riskScore}%`}}
                ></div>
                
                {/* Visual Markers */}
                <div className="absolute top-0 bottom-0 left-[25%] w-px bg-zinc-950/20 border-r border-zinc-50/5"></div>
                <div className="absolute top-0 bottom-0 left-[50%] w-px bg-zinc-950/20 border-r border-zinc-50/5"></div>
                <div className="absolute top-0 bottom-0 left-[75%] w-px bg-zinc-950/20 border-r border-zinc-50/5"></div>
             </div>
             
             <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1 px-0.5">
               <span>0</span>
               <span>50</span>
               <span>100</span>
             </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
            <h4 className="text-zinc-500 text-xs uppercase mb-2">Anomalies Detected</h4>
            <ul className="space-y-1">
              {fraud.anomalies?.map((ano, i) => (
                <li key={i} className="flex items-start gap-2 text-zinc-300">
                  <span className="text-rose-500 mt-1">●</span> {ano}
                </li>
              ))}
              {(!fraud.anomalies || fraud.anomalies.length === 0) && <li className="text-zinc-500 italic">No significant anomalies detected.</li>}
            </ul>
          </div>

          <p className="text-zinc-400 leading-relaxed pt-2">
            <strong className="text-zinc-200">Conclusion: </strong>
            {fraud.details}
          </p>
        </div>
      </AccordionItem>

      {/* Full Report Button */}
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onViewReport}
        className="w-full mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700 text-zinc-300 font-medium rounded-lg transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md hover:shadow-emerald-900/20"
      >
        <span>View Full Report</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-emerald-500" />
      </motion.button>

    </div>
  );
};

// Helper Components

const AccordionItem = ({ id, isOpen, onClick, title, icon, children, badge, badgeColor }: any) => (
  <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg overflow-hidden transition-colors hover:border-zinc-700">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-zinc-200">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${badgeColor}`}>
          {badge}
        </span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 pt-0 border-t border-zinc-800/50">
            <div className="pt-4">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const DetailRow = ({ label, value, fontMono, warning }: { label: string; value: string; fontMono?: boolean; warning?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-zinc-500 text-xs mb-1">{label}</span>
    <span className={`text-zinc-200 ${fontMono ? 'font-mono text-xs' : 'font-medium'} ${warning ? 'text-rose-500' : ''}`}>
      {value || 'N/A'}
    </span>
  </div>
);