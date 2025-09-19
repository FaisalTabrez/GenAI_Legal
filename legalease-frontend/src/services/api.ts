import axios from 'axios';
import type { DocumentAnalysisResult, QAResponse, TranslationResponse } from '../types';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60 seconds timeout for document analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      throw new Error('Service not found. Please check your connection.');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server. Please ensure the backend is running.');
    }
    
    throw new Error(error.response?.data?.error || error.message || 'An unexpected error occurred');
  }
);

/**
 * Analyze a document file
 */
export async function analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await api.post('/analyze-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Document analysis failed:', error);
    throw error;
  }
}

/**
 * Analyze text content
 */
export async function analyzeText(text: string): Promise<DocumentAnalysisResult> {
  try {
    const response = await api.post('/analyze-text', { text });
    return response.data;
  } catch (error) {
    console.error('Text analysis failed:', error);
    throw error;
  }
}

/**
 * Ask a question about the document
 */
export async function askQuestion(
  question: string,
  documentContext: string,
  language: string = 'en'
): Promise<QAResponse> {
  try {
    const response = await api.post('/ask-question', {
      question,
      documentContext,
      language,
    });

    return response.data;
  } catch (error) {
    console.error('Question failed:', error);
    throw error;
  }
}

/**
 * Translate text to target language
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'hi'
): Promise<TranslationResponse> {
  try {
    const response = await api.post('/translate', {
      text,
      targetLanguage,
    });

    return response.data;
  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Get available languages for translation
 */
export function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ];
}