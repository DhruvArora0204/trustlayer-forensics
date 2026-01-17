import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { UploadZone } from './components/dashboard/UploadZone';
import { TerminalLog } from './components/analysis/TerminalLog';
import { ResultsAccordion } from './components/analysis/ResultsAccordion';
import { ImageViewer, ImageViewerHandle } from './components/analysis/ImageViewer';
import { ClaimsReportSheet } from './components/sheets/ClaimsReportSheet';
import { AuditTrail } from './components/dashboard/AuditTrail';
import { ForensicLab } from './components/dashboard/ForensicLab';
import { SettingsPanel } from './components/dashboard/SettingsPanel';
import { LoginScreen } from './components/auth/LoginScreen';
import { useAnalysis } from './hooks/useAnalysis';
import { useAudit } from './hooks/useAudit';
import { useAuth } from './hooks/useAuth';
import { generatePDF } from './services/pdfGenerator';
import { AppState, CaseRecord, AuthUser } from './types';
import { FileText, Loader } from 'lucide-react';

const App: React.FC = () => {
  const { state, logs, image, result, uploadFile, loadAnalysis, reset } = useAnalysis();
  const { cases, initCase, updateCaseAI, updateCaseDecision, deleteCase } = useAudit();
  const auth = useAuth();
  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit' | 'lab' | 'settings'>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  const hasLoggedCompletion = useRef(false);
  const imageViewerRef = useRef<ImageViewerHandle>(null);

  useEffect(() => {
    if (state === AppState.COMPLETE && !hasLoggedCompletion.current && result && activeCaseId) {
      updateCaseAI(activeCaseId, result, image);
      hasLoggedCompletion.current = true;
    }
    if (state === AppState.IDLE) {
      hasLoggedCompletion.current = false;
    }
  }, [state, result, activeCaseId, updateCaseAI, image]);

  const handleUpload = (file: File) => {
    const newCaseId = initCase(file.name);
    setActiveCaseId(newCaseId);
    uploadFile(file);
    setCurrentView('dashboard'); 
  };

  const handleLoadCase = (record: CaseRecord) => {
    if (record.analysisData && record.evidenceImage) {
      setActiveCaseId(record.id);
      loadAnalysis(record.analysisData, record.evidenceImage);
      setCurrentView('dashboard');
    } else {
      alert("Case data incomplete or archived without image.");
    }
  };

  const handleDecision = (type: 'APPROVE' | 'REJECT') => {
    if (activeCaseId) {
      updateCaseDecision(activeCaseId, type === 'APPROVE' ? 'APPROVED' : 'FLAGGED');
    }
    setIsReportOpen(false);
  };

  const handleReset = () => {
    setActiveCaseId(null);
    reset();
  };

  const handleDownloadPDF = async () => {
    if (!result || !activeCaseId) return;
    let finalImage = image;
    if (imageViewerRef.current) {
       const annotated = await imageViewerRef.current.exportAnnotatedImage();
       if (annotated) finalImage = annotated;
    }
    generatePDF(activeCaseId, result, finalImage);
  };
  
  const handleSearchSubmit = () => {
    setCurrentView('audit');
  };

  const pendingCases = cases.filter(c => c.status === 'WAITING_REVIEW');

  if (!auth.isInitialized) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <LoginScreen auth={auth} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={auth.logout}
        user={auth.user}
      />
      
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header 
          pendingCases={pendingCases} 
          onOpenCase={handleLoadCase}
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />
        
        <main className="flex-1 p-6 overflow-x-hidden">
          
          {currentView === 'settings' && <SettingsPanel />}
          {currentView === 'audit' && (
            <AuditTrail 
              logs={cases} 
              onOpenCase={handleLoadCase} 
              onDeleteCase={deleteCase}
              searchTerm={globalSearchTerm}
              onSearchChange={setGlobalSearchTerm}
            />
          )}
          {currentView === 'lab' && <ForensicLab />}
          {currentView === 'dashboard' && (
            <>
              {state === AppState.IDLE && (
                <UploadZone onFileSelect={handleUpload} />
              )}

              {(state === AppState.ANALYZING || state === AppState.COMPLETE) && image && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="flex flex-col gap-6">
                     <div className="h-[400px] lg:h-[600px]">
                        <ImageViewer ref={imageViewerRef} imageSrc={image} />
                     </div>
                     {state === AppState.COMPLETE && (
                       <div className="hidden lg:block">
                         <button 
                          onClick={() => setIsReportOpen(true)}
                          className="w-full py-4 bg-emerald-900/10 border border-emerald-900/40 hover:bg-emerald-900/20 text-emerald-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-sm"
                         >
                           <FileText size={20} className="group-hover:scale-110 transition-transform" />
                           Review Final Adjudication
                         </button>
                       </div>
                     )}
                  </div>
                  <div className="flex flex-col">
                    <TerminalLog logs={logs} />
                    {result && (
                      <ResultsAccordion 
                        results={result} 
                        onViewReport={() => setIsReportOpen(true)}
                      />
                    )}
                    {state === AppState.COMPLETE && (
                       <div className="mt-8 flex justify-end">
                          <button onClick={handleReset} className="text-zinc-500 hover:text-emerald-500 text-xs font-mono transition-colors">
                            {'>>'} INITIALIZE_NEW_CASE
                          </button>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <ClaimsReportSheet 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        data={result} 
        onDecision={handleDecision}
        onDownload={handleDownloadPDF}
        caseId={activeCaseId || "UNKNOWN"}
      />
    </div>
  );
};

export default App;