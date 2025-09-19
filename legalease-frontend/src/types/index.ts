// Document analysis types
export interface ClauseAnalysis {
  text: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  explanation: string;
  category: string;
  isStandard: boolean;
}

export interface DocumentAnalysisResult {
  summary: string;
  clauses: ClauseAnalysis[];
  overallRiskScore: number;
  keyInsights: string[];
  recommendedActions: string[];
  language: string;
  documentType: string;
}

// Q&A types
export interface QAResponse {
  question: string;
  answer: string;
  relatedClauses: string[];
  confidence: number;
  followUpQuestions: string[];
}

// Translation types
export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Language options
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

// File upload types
export interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onTextAnalysis: (text: string) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

// Component props types
export interface DocumentAnalysisProps {
  analysis: DocumentAnalysisResult;
  language: string;
}

export interface QAInterfaceProps {
  documentContext: string;
  language: string;
}

export interface ClauseCardProps {
  clause: ClauseAnalysis;
  index: number;
  language: string;
}

export interface RiskMeterProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

// Error types
export interface ErrorInfo {
  componentStack: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}