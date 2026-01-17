import { useState, useCallback } from 'react';
import { CaseRecord, AnalysisResult } from '../types';

export const useAudit = () => {
  // Initialize with an empty array for a fresh state
  const [cases, setCases] = useState<CaseRecord[]>([]);

  const initCase = useCallback((fileName: string) => {
    const id = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: CaseRecord = {
      id,
      timestamp: new Date().toISOString(),
      fileName,
      aiVerdict: 'Processing...',
      aiRecommendation: 'Pending',
      supervisorDecision: 'PENDING',
      status: 'PROCESSING'
    };
    setCases(prev => [newCase, ...prev]);
    return id;
  }, []);

  const updateCaseAI = useCallback((id: string, result: AnalysisResult, imageSrc: string | null) => {
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          aiVerdict: `Risk: ${result.fraud.riskScore}%`,
          aiRecommendation: result.summary.recommendation,
          status: 'WAITING_REVIEW',
          analysisData: result,
          evidenceImage: imageSrc || undefined
        };
      }
      return c;
    }));
  }, []);

  const updateCaseDecision = useCallback((id: string, decision: 'APPROVED' | 'FLAGGED') => {
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          supervisorDecision: decision,
          status: 'CLOSED'
        };
      }
      return c;
    }));
  }, []);

  const deleteCase = useCallback((id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  }, []);

  return { cases, initCase, updateCaseAI, updateCaseDecision, deleteCase };
};