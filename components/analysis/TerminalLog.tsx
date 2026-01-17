import React, { useEffect, useRef } from 'react';
import { TerminalLogEntry } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalLogProps {
  logs: TerminalLogEntry[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full bg-black rounded-lg border border-zinc-800 overflow-hidden font-mono text-xs md:text-sm shadow-2xl flex flex-col h-[300px]">
      <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
        <span className="text-zinc-400">root@trustlayer-node:~/analysis</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-2">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
              <span className={`break-words ${
                log.status === 'error' ? 'text-rose-500' :
                log.status === 'success' ? 'text-emerald-500' :
                log.status === 'warning' ? 'text-amber-500' :
                'text-zinc-300'
              }`}>
                {'>'} {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
};
