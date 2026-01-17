import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Monitor, Shield, KeyRound, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApiKeys } from '../../hooks/useApiKeys';

export const SettingsPanel: React.FC = () => {
  const { keys: savedKeys, saveKeys } = useApiKeys();
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  const [localKeys, setLocalKeys] = useState(savedKeys);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalKeys(savedKeys);
  }, [savedKeys]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };
  
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalKeys({ ...localKeys, [e.target.name]: e.target.value });
  };

  const handleSaveKeys = () => {
    saveKeys(localKeys);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">System Configuration</h1>
        <p className="text-zinc-500 text-lg">Manage interface preferences and security protocols.</p>
      </motion.div>

      <div className="grid gap-6">
        
        {/* API Keys Section */}
        <Section title="API Configuration" icon={<KeyRound className="text-rose-500" />}>
           <div className="p-6 space-y-4">
               <div className="p-4 bg-rose-900/30 border border-rose-500/30 rounded-md text-rose-300 text-sm flex gap-3">
                  <AlertTriangle className="text-rose-400 w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-bold">Action Required:</strong> A Groq API key is mandatory for the analysis engine to function. The application will not work without it.
                  </div>
               </div>
              <p className="text-sm text-zinc-400 !mt-6">
                The Google Gemini API key is configured securely in the environment. The analysis pipeline also requires a <span className="font-bold text-indigo-400">Groq key</span> for reasoning. The Serp key is optional for enhanced market data.
              </p>
              <ApiKeyInput name="groq" label="Groq API Key" value={localKeys.groq} onChange={handleKeyChange} placeholder="Begins with 'gsk_...'" />
              <ApiKeyInput name="serp" label="SerpAPI Key (Optional)" value={localKeys.serp} onChange={handleKeyChange} placeholder="32-character hexadecimal string" />
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveKeys}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-all flex items-center gap-2"
                >
                  {isSaved ? <Check size={16} /> : null}
                  {isSaved ? 'Saved!' : 'Save Keys'}
                </button>
              </div>
           </div>
        </Section>

        {/* Appearance Section */}
        <Section title="Appearance" icon={<Monitor className="text-indigo-500" />}>
          <SettingRow 
            label="Interface Theme" 
            desc="Toggle between dark 'Cyber-Intelligence' mode and light mode."
            control={
              <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ease-in-out ${isDark ? 'translate-x-7' : 'translate-x-1'} flex items-center justify-center`}>
                  {isDark ? <Moon size={14} className="text-zinc-800" /> : <Sun size={14} className="text-amber-500" />}
                </span>
              </button>
            }
          />
        </Section>

        {/* Notifications Section */}
        <Section title="Notifications" icon={<Bell className="text-amber-500" />}>
          <SettingRow 
            label="Real-time Alerts" 
            desc="Receive immediate notifications for high-risk fraud flags."
            control={
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            }
          />
        </Section>

      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: any) => (
  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
      {icon}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
    </div>
    <div>
      {children}
    </div>
  </div>
);

const ApiKeyInput = ({ name, label, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}</label>
    <input 
      type="password"
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
    />
  </div>
);

const SettingRow = ({ label, desc, control }: any) => (
  <div className="px-6 py-4 flex items-center justify-between">
    <div>
      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{label}</h4>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{desc}</p>
    </div>
    <div className="ml-4">
      {control}
    </div>
  </div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${checked ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);