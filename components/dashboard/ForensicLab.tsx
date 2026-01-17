import React from 'react';
import { motion } from 'framer-motion';
import { 
  Network, Cpu, Lock, Eye, Database, Share2, 
  ShieldCheck, AlertTriangle, FileSearch, ArrowRight, 
  Layers, Workflow, ScanEye
} from 'lucide-react';

export const ForensicLab: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
       {/* Header */}
       <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
       >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="text-indigo-500" size={32} /> 
            Forensic Architecture
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg">
            TrustLayer utilizes a multi-modal neural pipeline to decompose evidence into three distinct analytical vectors. This lab view visualizes the decision matrix.
          </p>
       </motion.div>

       {/* Workflow Visualization */}
       <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-5 gap-4 relative"
       >
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-zinc-800 via-indigo-900/50 to-zinc-800 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <WorkflowStep 
            icon={<FileSearch size={24} className="text-zinc-100" />}
            title="Ingestion"
            desc="SHA-256 Hashing & EXIF Extraction"
            step="01"
          />

          {/* Step 2 */}
          <WorkflowStep 
            icon={<ScanEye size={24} className="text-indigo-400" />}
            title="Computer Vision"
            desc="Object Segmentation & OCR"
            step="02"
            color="indigo"
          />

          {/* Step 3 */}
          <WorkflowStep 
            icon={<Cpu size={24} className="text-emerald-400" />}
            title="LLM (Reasoning)"
            desc="Contextual Reasoning Engine"
            step="03"
            color="emerald"
            isPulse
          />

          {/* Step 4 */}
          <WorkflowStep 
            icon={<Layers size={24} className="text-amber-400" />}
            title="Node Analysis"
            desc="Parallel Vector Processing"
            step="04"
            color="amber"
          />

          {/* Step 5 */}
          <WorkflowStep 
            icon={<Database size={24} className="text-rose-400" />}
            title="Risk Ledger"
            desc="Immutable Audit & Scoring"
            step="05"
            color="rose"
          />
       </motion.div>

       {/* Deep Dive Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          
          {/* Node 1: Forensics */}
          <NodeCard 
            title="Digital Forensics Node"
            icon={<Lock className="text-blue-500" />}
            color="blue"
            description="Analyzes the digital fingerprint of the evidence file to ensure authenticity."
            features={[
              "Metadata Verification (EXIF/IPTC)",
              "Software Signature Detection (Photoshop/GIMP)",
              "GPS Triangulation & Timestamp Analysis",
              "Device Model Sensor Fingerprinting"
            ]}
          />

          {/* Node 2: Insurance */}
          <NodeCard 
            title="Damage Assessment Node"
            icon={<Share2 className="text-amber-500" />}
            color="amber"
            description="Quantifies physical damage and estimates financial impact based on market data."
            features={[
              "Vehicle Make/Model/Year Identification",
              "Component-Level Damage Segmentation",
              "Repair Severity Classification",
              "Real-time Parts Cost Estimation (INR)"
            ]}
          />

          {/* Node 3: Fraud */}
          <NodeCard 
            title="Fraud Detection Node"
            icon={<ShieldCheck className="text-rose-500" />}
            color="rose"
            description="Cross-references visual data with environmental context to detect fabrication."
            features={[
              "Shadow & Lighting Vector Consistency",
              "Weather API vs. Visual Environment Check",
              "Reflection & Surface Geometry Analysis",
              "Generative AI Artifact Detection"
            ]}
          />
       </div>

       {/* Technical Footer */}
       <div className="border-t border-zinc-800 pt-8 mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-zinc-500 text-sm font-mono">
          <div>
            <span className="block text-zinc-300 mb-1">System Status: <span className="text-emerald-500">OPERATIONAL</span></span>
            <span>Latency: 48ms | Nodes Online: 3/3</span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Workflow size={14} /> Pipeline</span>
            <span className="flex items-center gap-2"><Eye size={14} /> Vision Model: Gemma</span>
          </div>
       </div>
    </div>
  );
};

const WorkflowStep = ({ icon, title, desc, step, color = "zinc", isPulse = false }: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, scale: 0.9 },
      show: { opacity: 1, scale: 1 }
    }}
    className="relative z-10 flex flex-col items-center text-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-lg hover:border-zinc-700 transition-colors group"
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform ${isPulse ? 'animate-pulse ring-2 ring-emerald-500/20' : ''}`}>
      {icon}
    </div>
    <div className={`text-xs font-mono font-bold mb-1 uppercase tracking-wider text-${color}-500`}>Step {step}</div>
    <h3 className="text-zinc-200 font-semibold mb-1">{title}</h3>
    <p className="text-zinc-500 text-xs">{desc}</p>
  </motion.div>
);

const NodeCard = ({ title, icon, description, features, color }: any) => {
  const colorStyles: any = {
    blue: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40",
    amber: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
    rose: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-6 rounded-xl border transition-all duration-300 ${colorStyles[color]} relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150 transform translate-x-4 -translate-y-4">
        {icon}
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      </div>
      
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-3">
        {features.map((feat: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <ArrowRight size={14} className="mt-1 text-zinc-600 shrink-0" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};