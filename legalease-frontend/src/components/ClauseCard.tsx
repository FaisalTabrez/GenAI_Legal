import React from 'react';
import type { ClauseAnalysis } from '../types';

interface ClauseCardProps {
  clause: ClauseAnalysis;
  index: number;
  language: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ClauseCard({ clause, index, language, isExpanded = false, onToggle }: ClauseCardProps) {
  const getRiskBorderColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'border-danger-200 bg-danger-50';
      case 'medium': return 'border-warning-200 bg-warning-50';
      case 'low': return 'border-success-200 bg-success-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '✅';
      default: return '📄';
    }
  };

  return (
    <div className={`border rounded-lg ${getRiskBorderColor(clause.riskLevel)} transition-all duration-200`}>
      <div 
        className="p-4 cursor-pointer hover:bg-opacity-70"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getRiskIcon(clause.riskLevel)}</span>
              <span className="font-medium text-gray-900 capitalize">
                {clause.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                clause.riskLevel === 'high' ? 'bg-danger-100 text-danger-700' :
                clause.riskLevel === 'medium' ? 'bg-warning-100 text-warning-700' :
                'bg-success-100 text-success-700'
              }`}>
                {clause.riskLevel} risk
              </span>
            </div>
            <p className="text-gray-700 mb-2">{clause.summary}</p>
            {clause.riskFactors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {clause.riskFactors.slice(0, 3).map((factor, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button className="ml-4 text-gray-400 hover:text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📜 Original Clause</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border italic">
                {clause.text}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💡 Detailed Explanation</h4>
              <p className="text-sm text-gray-700">{clause.explanation}</p>
            </div>
            {clause.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">⚠️ Risk Factors</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {clause.riskFactors.map((factor, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}