import React from 'react';
import type { RiskMeterProps } from '../types';

export function RiskMeter({ score, size = 'medium' }: RiskMeterProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'stroke-danger-500';
    if (score >= 40) return 'stroke-warning-500';
    return 'stroke-success-500';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 70) return 'text-danger-600';
    if (score >= 40) return 'text-warning-600';
    return 'text-success-600';
  };

  // Calculate the circumference and stroke offset
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={getRiskColor(score)}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeOffset,
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      
      {/* Score text */}
      <div className={`relative text-center ${getRiskBgColor(score)}`}>
        <div className={`font-bold ${textSizeClasses[size]}`}>
          {score}
        </div>
        <div className="text-xs text-gray-500">
          Risk
        </div>
      </div>
    </div>
  );
}