

// FIX: Add global declaration for window.google to satisfy TypeScript compiler.
// The Google Sign-In library is loaded via a script tag and attaches itself to the window object.
declare global {
  interface Window {
    google: any;
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, User, Mail, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthUser } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  auth: ReturnType<typeof useAuth>;
}

// Simple client-side JWT decoder to extract payload.
// Note: This does NOT verify the token signature. Verification should happen on a server.
const decodeJwtResponse = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};


export const LoginScreen: React.FC<LoginScreenProps> = ({ auth }) => {
  const signInButtonRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, loginWithPassword, signup } = auth;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !signInButtonRef.current) {
      return;
    }

    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        const userObject = decodeJwtResponse(response.credential);
        if (userObject) {
          const user: AuthUser = {
            name: userObject.name,
            email: userObject.email,
            avatar: userObject.picture,
          };
          login(user);
        } else {
          console.error("Failed to decode user information from Google's response.");
          setError("Could not process Google Sign-In. Please try again.");
        }
      },
    });

    window.google.accounts.id.renderButton(
      signInButtonRef.current,
      { theme: "outline", size: "large", type: "standard", text: "signin_with", width: "300" } 
    );
  }, [login]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signUp') {
      const result = signup(name, email, password);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      const result = loginWithPassword(email, password);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  const toggleMode = () => {
    setError(null);
    setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl border border-emerald-500/30 mb-6 shadow-inner">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">TrustLayer</h1>
          <p className="text-zinc-500 text-sm font-medium">Enterprise Claims Forensics & Deepfake Detection</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === 'signUp' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <InputWithIcon icon={<User size={16} />} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              </motion.div>
            )}
          </AnimatePresence>
          <InputWithIcon icon={<Mail size={16} />} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          <InputWithIcon icon={<KeyRound size={16} />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          
          {error && <p className="text-xs text-rose-500/80 text-center font-mono bg-rose-500/10 p-2 rounded-md border border-rose-500/20">{error}</p>}
          
          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all shadow-md shadow-emerald-900/20">
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
          <div className="relative flex justify-center text-xs"><span className="bg-zinc-950 px-2 text-zinc-600 font-mono">OR</span></div>
        </div>

        <div ref={signInButtonRef} className="flex justify-center"></div>

        <div className="mt-6 text-center text-xs text-zinc-500">
          {mode === 'signIn' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode} className="font-semibold text-emerald-500 hover:underline ml-1">
            {mode === 'signIn' ? "Sign Up" : "Sign In"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900/50 flex flex-col items-center">
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-mono mb-4">
            <Lock size={10} /> AES-256 ENCRYPTED SESSION
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InputWithIcon = (props: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
      {props.icon}
    </div>
    <input
      {...props}
      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-md pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
    />
  </div>
);