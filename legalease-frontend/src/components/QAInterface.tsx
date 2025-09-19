import React, { useState } from 'react';
import type { QAInterfaceProps, QAResponse } from '../types';
import { askQuestion } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

export function QAInterface({ documentContext, language }: QAInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<QAResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setLoading(true);

    try {
      const response = await askQuestion(userQuestion, documentContext, language);
      setConversation(prev => [...prev, response]);
    } catch (error) {
      console.error('Q&A error:', error);
      // Add error response to conversation
      const errorResponse: QAResponse = {
        question: userQuestion,
        answer: 'Sorry, I encountered an error processing your question. Please try again.',
        relatedClauses: [],
        confidence: 0,
        followUpQuestions: []
      };
      setConversation(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are my main obligations under this agreement?",
    "How can this agreement be terminated?",
    "What penalties or fees might I face?",
    "Are there any unusual or risky clauses?",
    "What are my rights if the other party breaches?"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          💬 Ask Questions About Your Document
        </h2>
        <p className="text-gray-600">
          Get instant answers about specific clauses, your rights, and obligations.
        </p>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
          {conversation.map((qa, index) => (
            <div key={index} className="space-y-3">
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-primary-600 text-white rounded-lg px-4 py-2 max-w-3xl">
                  <p className="text-sm">{qa.question}</p>
                </div>
              </div>
              
              {/* Answer */}
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-3xl">
                  <p className="text-sm text-gray-800 mb-2">{qa.answer}</p>
                  {qa.confidence > 0 && (
                    <div className="text-xs text-gray-500">
                      Confidence: {qa.confidence}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about your document..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <LoadingSpinner size="small" /> : 'Ask'}
          </button>
        </div>
      </form>

      {/* Suggested Questions */}
      {conversation.length === 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Suggested Questions:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggested, index) => (
              <button
                key={index}
                onClick={() => setQuestion(suggested)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}