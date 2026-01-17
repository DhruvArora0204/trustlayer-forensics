

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
}

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface TerminalLogEntry {
  id: string;
  message: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'error' | 'pending';
}

export interface ForensicData {
  deviceModel: string;
  software: string;
  gpsCoordinates: string;
  captureTime: string;
  visualEnvironment: string; // Weather, daylight, location type
}

export interface InsuranceData {
  vehicleId: string;
  impactType: string; // e.g., 'Front-end collision', 'Side-swipe'
  damageClass: 'Minor' | 'Moderate' | 'Major' | 'Total Loss';
  damagedParts: Array<{ part: string; estimatedCost: number }>;
  totalEstimatedCost: number;
  notes: string;
}

export interface FraudData {
  riskScore: number; // 0-100
  anomalies: string[];
  isAiGenerated: boolean;
  conclusion: 'Verified' | 'Suspicious' | 'High Risk';
  details: string;
}

export interface AnalysisSummary {
  confidenceScore: number; // 0-100 (AI confidence in its own analysis)
  finalConclusion: string;
  recommendation: 'Approve' | 'Review' | 'Reject';
  sources?: Array<{ title: string; uri: string }>;
}

export interface AnalysisResult {
  forensics: ForensicData;
  insurance: InsuranceData;
  fraud: FraudData;
  summary: AnalysisSummary;
  isMock?: boolean;
}

export interface CaseRecord {
  id: string;
  timestamp: string;
  fileName: string;
  aiVerdict: string; // e.g., "High Risk (85%)"
  aiRecommendation: string; // "Reject" | "Approve" | "Review"
  supervisorDecision: 'PENDING' | 'APPROVED' | 'FLAGGED';
  status: 'PROCESSING' | 'WAITING_REVIEW' | 'CLOSED';
  analysisData?: AnalysisResult;
  evidenceImage?: string;
}