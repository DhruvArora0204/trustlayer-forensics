import { useState, useCallback, useRef } from 'react';
import { AppState, TerminalLogEntry, AnalysisResult } from '../types';
import { analyzeImage } from '../services/geminiService';
import { extractForensics } from '../services/forensicTool';

const MOCK_LOGS_TEMPLATE = [
  "Mounting volume /dev/disk1s1...",
  "Analyzing file header hex signature...",
  "Extracting EXIF/XMP metadata...",
  "Submitting to Gemini Vision for analysis...",
  "Receiving visual damage report...",
  "Compiling forensic & visual data...",
  "Submitting to Groq Llama3 for reasoning...",
  "Generating final forensic report..."
];

export const useAnalysis = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [logs, setLogs] = useState<TerminalLogEntry[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const logInterval = useRef<number | null>(null);

  const addLog = (message: string, status: TerminalLogEntry['status'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 3 } as any),
        status
      }
    ]);
  };

  const uploadFile = useCallback(async (file: File) => {
    setState(AppState.UPLOADING);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Clean = base64.split(',')[1]; // Remove data:image/...;base64,
      setImage(base64);
      
      setState(AppState.ANALYZING);
      
      setLogs([]);
      let logIndex = 0;
      const startTime = Date.now();
      
      addLog("Initializing TrustLayer Agent (Groq Enabled)...", 'success');
      
      if (logInterval.current) clearInterval(logInterval.current);
      logInterval.current = window.setInterval(() => {
        if (logIndex < MOCK_LOGS_TEMPLATE.length) {
          addLog(MOCK_LOGS_TEMPLATE[logIndex], 'info');
          logIndex++;
        }
      }, 800);

      try {
        addLog("Reading binary file stream...", "info");
        const forensicData = await extractForensics(file);
        
        if (forensicData.magicBytesVerified) {
             addLog(`Signature Verified: ${forensicData.fileType}`, "success");
        } else {
             addLog("Warning: File Signature Mismatch", "warning");
        }
        
        if (forensicData.make) {
            addLog(`Device Identified: ${forensicData.make} ${forensicData.model}`, "success");
        } else {
            addLog("No Device Metadata Found in EXIF", "warning");
        }

        const data = await analyzeImage(base64Clean, forensicData);
        setResult(data);
        
        const elapsedTime = Date.now() - startTime;
        const totalAnimationTime = MOCK_LOGS_TEMPLATE.length * 800;
        const remainingTime = Math.max(500, totalAnimationTime - elapsedTime);

        setTimeout(() => {
            if (logInterval.current) clearInterval(logInterval.current);
            
            if (data.summary.recommendation === 'Review' && data.summary.finalConclusion === 'Analysis failed.') {
              addLog(data.fraud.details, 'error');
            } else {
              addLog("Analysis Complete. Report generated.", 'success');
            }
            setState(AppState.COMPLETE);
        }, remainingTime);

      } catch (err: any) {
        console.error(err);
        if (logInterval.current) clearInterval(logInterval.current);
        const errorMessage = err.message || "Critical Failure in Analysis Module.";
        addLog(errorMessage, 'error');
        
        // Check for the specific API key error
        if (errorMessage.includes("Groq API key is missing")) {
            addLog("Please navigate to the Settings page to add your key.", 'warning');
        }
        
        // Stop the process and show the error to the user
        setState(AppState.COMPLETE); 
        // Set result to null so the accordion doesn't show up with partial/error data
        setResult(null); 
      }
    };

    reader.readAsDataURL(file);
  }, []);

  const loadAnalysis = useCallback((data: AnalysisResult, imageSrc: string) => {
    if (logInterval.current) clearInterval(logInterval.current);
    setImage(imageSrc);
    setResult(data);
    setLogs([
      {
        id: 'archive-init',
        message: 'Accessing archived case data...',
        timestamp: new Date().toLocaleTimeString(),
        status: 'info'
      },
      {
        id: 'archive-load',
        message: 'Historical analysis result restored successfully.',
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      }
    ]);
    setState(AppState.COMPLETE);
  }, []);

  const reset = useCallback(() => {
    setState(AppState.IDLE);
    setLogs([]);
    setImage(null);
    setResult(null);
    if (logInterval.current) clearInterval(logInterval.current);
  }, []);

  return {
    state,
    logs,
    image,
    result,
    uploadFile,
    loadAnalysis,
    reset
  };
};