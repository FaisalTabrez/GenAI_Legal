import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { QAInterface } from './components/QAInterface';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LanguageSelector } from './components/LanguageSelector';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { analyzeDocument, analyzeText } from './services/api';
import type { DocumentAnalysisResult } from './types';

function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Uploading file:', file.name);
      const result = await analyzeDocument(file);
      setAnalysis(result);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  const handleTextAnalysis = async (text: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log('Analyzing text content');
      const result = await analyzeText(text);
      setAnalysis(result);
    } catch (err) {
      console.error('Text analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze text');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Language Selector */}
          <div className="mb-6 flex justify-end">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>

          {/* Hero Section */}
          {!analysis && !loading && (
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-primary-600">LegalEase AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform complex legal documents into plain, actionable insights. 
                Upload your contract, agreement, or legal document to get started.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    📄
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plain Language Summary</h3>
                  <p className="text-gray-600 text-sm">Get easy-to-understand explanations of complex legal terms</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    ⚠️
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Risk Assessment</h3>
                  <p className="text-gray-600 text-sm">Identify potentially risky clauses and understand their implications</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    💬
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interactive Q&A</h3>
                  <p className="text-gray-600 text-sm">Ask questions about your document and get instant answers</p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Section */}
          {!analysis && !loading && (
            <FileUpload 
              onFileUpload={handleFileUpload}
              onTextAnalysis={handleTextAnalysis}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <p className="text-gray-600 mt-4 text-lg">Analyzing your document...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-danger-600 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-danger-800 font-medium">Analysis Failed</h3>
                  <p className="text-danger-700 mt-1">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-danger-700 underline hover:text-danger-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-gray-900">Document Analysis</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Analyze New Document
                </button>
              </div>
              
              <DocumentAnalysis 
                analysis={analysis} 
                language={selectedLanguage}
              />
              
              <QAInterface 
                documentContext={JSON.stringify(analysis)}
                language={selectedLanguage}
              />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
