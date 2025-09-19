import React from 'react';
import type { LanguageSelectorProps } from '../types';
import { getAvailableLanguages } from '../services/api';

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const languages = getAvailableLanguages();

  return (
    <div className="relative inline-block">
      <label htmlFor="language-select" className="sr-only">
        Select Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name} ({language.nativeName})
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}