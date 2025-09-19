import React, { useState } from 'react';
import type { DocumentAnalysisProps } from '../types';
import { RiskMeter } from './RiskMeter';
import { ClauseCard } from './ClauseCard';

export function DocumentAnalysis({ analysis, language }: DocumentAnalysisProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<number>>(new Set());

  const toggleClause = (index: number) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedClauses(newExpanded);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-danger-600';
    if (score >= 40) return 'text-warning-600';
    return 'text-success-600';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const highRiskClauses = analysis.clauses.filter(c => c.riskLevel === 'high');
  const mediumRiskClauses = analysis.clauses.filter(c => c.riskLevel === 'medium');
  const lowRiskClauses = analysis.clauses.filter(c => c.riskLevel === 'low');

  return (
    <div className="space-y-8">
      {/* Document Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Document Analysis Overview
            </h2>
            <p className="text-gray-600">
              {analysis.documentType} • {analysis.language === 'hi' ? 'Hindi' : 'English'}
            </p>
          </div>
          <div className="text-center">
            <RiskMeter score={analysis.overallRiskScore} size="large" />
            <p className={`mt-2 font-semibold ${getRiskColor(analysis.overallRiskScore)}`}>
              {getRiskLabel(analysis.overallRiskScore)}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Document Summary</h3>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{analysis.clauses.length}</div>
            <div className="text-sm text-gray-600">Total Clauses</div>
          </div>
          <div className="bg-danger-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-danger-600">{highRiskClauses.length}</div>
            <div className="text-sm text-danger-600">High Risk</div>
          </div>
          <div className="bg-warning-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{mediumRiskClauses.length}</div>
            <div className="text-sm text-warning-600">Medium Risk</div>
          </div>
          <div className="bg-success-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{lowRiskClauses.length}</div>
            <div className="text-sm text-success-600">Low Risk</div>
          </div>
        </div>

        {/* Key Insights */}
        {analysis.keyInsights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Key Insights</h3>
            <ul className="space-y-2">
              {analysis.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Actions */}
        {analysis.recommendedActions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Recommended Actions</h3>
            <ul className="space-y-2">
              {analysis.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-2 h-2 bg-warning-500 rounded-full mt-2"></span>
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Clause Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Clause-by-Clause Analysis</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedClauses(new Set(Array.from({ length: analysis.clauses.length }, (_, i) => i)))}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedClauses(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {analysis.clauses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📄</div>
            <p className="text-gray-600">No clauses identified in this document.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* High Risk Clauses First */}
            {highRiskClauses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-danger-600 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  High Risk Clauses ({highRiskClauses.length})
                </h3>
                <div className="space-y-3">
                  {analysis.clauses.map((clause, index) => 
                    clause.riskLevel === 'high' ? (
                      <ClauseCard
                        key={index}
                        clause={clause}
                        index={index}
                        language={language}
                        isExpanded={expandedClauses.has(index)}
                        onToggle={() => toggleClause(index)}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Medium Risk Clauses */}
            {mediumRiskClauses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-warning-600 mb-3 flex items-center">
                  <span className="mr-2">⚡</span>
                  Medium Risk Clauses ({mediumRiskClauses.length})
                </h3>
                <div className="space-y-3">
                  {analysis.clauses.map((clause, index) => 
                    clause.riskLevel === 'medium' ? (
                      <ClauseCard
                        key={index}
                        clause={clause}
                        index={index}
                        language={language}
                        isExpanded={expandedClauses.has(index)}
                        onToggle={() => toggleClause(index)}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Low Risk Clauses */}
            {lowRiskClauses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-success-600 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Low Risk Clauses ({lowRiskClauses.length})
                </h3>
                <div className="space-y-3">
                  {analysis.clauses.map((clause, index) => 
                    clause.riskLevel === 'low' ? (
                      <ClauseCard
                        key={index}
                        clause={clause}
                        index={index}
                        language={language}
                        isExpanded={expandedClauses.has(index)}
                        onToggle={() => toggleClause(index)}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}