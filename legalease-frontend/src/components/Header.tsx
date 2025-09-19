import React from 'react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LegalEase AI</h1>
              <p className="text-sm text-gray-600">Legal Document Demystification</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </a>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Get Started
            </button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}