import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileUploadProps } from '../types';

export function FileUpload({ 
  onFileUpload, 
  onTextAnalysis, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ]
}: FileUploadProps) {
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false
  });

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextAnalysis(textInput.trim());
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'upload' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📁 Upload Document
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'paste' 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 Paste Text
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary-400 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Upload your legal document'}
                </p>
                <p className="text-gray-600 mt-2">
                  Drag and drop your file here, or click to browse
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Supported formats: PDF, Word, TXT, Images (JPEG, PNG, TIFF)</p>
                <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
              </div>
            </div>
          </div>

          {/* File Rejection Errors */}
          {fileRejections.length > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <h4 className="text-danger-800 font-medium mb-2">Upload Error</h4>
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm text-danger-700">
                  <p className="font-medium">{file.name}</p>
                  <ul className="mt-1 list-disc list-inside">
                    {errors.map((error) => (
                      <li key={error.code}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Supported File Types */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">What we can analyze:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span>📄</span>
                <span>PDF Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span>Word Documents</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📋</span>
                <span>Text Files</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🖼️</span>
                <span>Scanned Images</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Text Input Area */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-3">
              Paste your legal document text here:
            </label>
            <textarea
              id="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Copy and paste the content of your contract, agreement, or any legal document here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                {textInput.length} characters
              </p>
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Analyze Text
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 Tips for better analysis:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include the complete document text for comprehensive analysis</li>
              <li>• Make sure the text is clearly formatted and readable</li>
              <li>• Remove any irrelevant headers, footers, or page numbers</li>
              <li>• For scanned documents, consider uploading the image file instead</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}