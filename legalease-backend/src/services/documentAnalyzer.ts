import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ClauseAnalysis {
    text: string;
    summary: string;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    explanation: string;
    category: string;
    isStandard: boolean;
}

export interface DocumentAnalysis {
    summary: string;
    clauses: ClauseAnalysis[];
    overallRiskScore: number;
    keyInsights: string[];
    recommendedActions: string[];
    language: string;
    documentType: string;
}

/**
 * Extract text from various document formats
 */
async function extractText(filePath: string, mimeType: string): Promise<string> {
    try {
        switch (mimeType) {
            case 'application/pdf':
                const pdfBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(pdfBuffer);
                return pdfData.text;

            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                const docBuffer = fs.readFileSync(filePath);
                const docResult = await mammoth.extractRawText({ buffer: docBuffer });
                return docResult.value;

            case 'text/plain':
                // If filePath is actually text content (not a file path)
                if (fs.existsSync(filePath)) {
                    return fs.readFileSync(filePath, 'utf-8');
                } else {
                    return filePath; // Assume it's the text content itself
                }

            case 'image/jpeg':
            case 'image/png':
            case 'image/tiff':
                // Use OCR for images
                const worker = await createWorker('eng');
                const { data: { text } } = await worker.recognize(filePath);
                await worker.terminate();
                return text;

            default:
                throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text from document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Identify and categorize legal clauses using AI
 */
async function identifyClauses(text: string): Promise<ClauseAnalysis[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are a legal AI assistant specializing in contract analysis. Analyze the following legal document text and identify distinct clauses or sections. For each clause, provide:

1. The original clause text
2. A plain English summary (1-2 sentences)
3. Risk level (low/medium/high) with justification
4. Category (e.g., "Termination", "Payment", "Liability", "Confidentiality", "Dispute Resolution", etc.)
5. Whether it's a standard clause or unusual
6. Key risk factors or concerns

Document text:
${text}

Return your analysis in the following JSON format:
{
  "clauses": [
    {
      "text": "original clause text",
      "summary": "plain English explanation",
      "riskLevel": "low|medium|high",
      "riskFactors": ["list of specific risk factors"],
      "explanation": "detailed explanation of implications",
      "category": "clause category",
      "isStandard": true/false
    }
  ]
}

Focus on identifying clauses that could impact ordinary users' rights, obligations, or financial liability.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text_response = response.text();

        // Parse JSON response
        const jsonMatch = text_response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        return parsedResponse.clauses || [];

    } catch (error) {
        console.error('Clause identification error:', error);
        // Return a fallback analysis if AI fails
        return [{
            text: text.substring(0, 500) + '...',
            summary: 'Unable to analyze clauses automatically. Please review document manually.',
            riskLevel: 'medium' as const,
            riskFactors: ['Automatic analysis failed'],
            explanation: 'The AI analysis service encountered an error. Consider consulting a legal professional for detailed review.',
            category: 'Unknown',
            isStandard: false
        }];
    }
}

/**
 * Generate overall document analysis and insights
 */
async function generateDocumentInsights(text: string, clauses: ClauseAnalysis[]): Promise<Partial<DocumentAnalysis>> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
Based on the following legal document analysis, provide:

1. Overall document summary (2-3 sentences)
2. Document type identification
3. Key insights for ordinary users
4. Recommended actions
5. Overall risk assessment (0-100 scale)

Document contains ${clauses.length} clauses with the following risk levels:
- High risk: ${clauses.filter(c => c.riskLevel === 'high').length}
- Medium risk: ${clauses.filter(c => c.riskLevel === 'medium').length}
- Low risk: ${clauses.filter(c => c.riskLevel === 'low').length}

Sample clauses categories: ${clauses.map(c => c.category).join(', ')}

Provide response in JSON format:
{
  "summary": "overall document summary",
  "documentType": "contract type (e.g., Employment Agreement, Rental Agreement, etc.)",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "recommendedActions": ["action 1", "action 2", "action 3"],
  "overallRiskScore": numeric_value_0_to_100
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text_response = response.text();

        const jsonMatch = text_response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('Document insights generation error:', error);
        // Return fallback insights
        const highRiskCount = clauses.filter(c => c.riskLevel === 'high').length;
        const riskScore = Math.min(90, 30 + (highRiskCount * 20));

        return {
            summary: 'This document contains legal terms and conditions that require careful review.',
            documentType: 'Legal Document',
            keyInsights: [
                `Document contains ${clauses.length} identifiable clauses`,
                `${highRiskCount} clauses marked as high risk`,
                'Consider professional legal review for complex terms'
            ],
            recommendedActions: [
                'Review all high-risk clauses carefully',
                'Seek clarification on unclear terms',
                'Consider legal consultation if needed'
            ],
            overallRiskScore: riskScore
        };
    }
}

/**
 * Main document analysis function
 */
export async function analyzeDocument(input: string, mimeType: string): Promise<DocumentAnalysis> {
    try {
        console.log('Starting document analysis...');

        // Extract text from document
        const text = await extractText(input, mimeType);
        
        if (!text || text.trim().length === 0) {
            throw new Error('No text content found in document');
        }

        console.log(`Extracted ${text.length} characters of text`);

        // Identify and analyze clauses
        const clauses = await identifyClauses(text);
        console.log(`Identified ${clauses.length} clauses`);

        // Generate overall insights
        const insights = await generateDocumentInsights(text, clauses);

        // Detect document language (simple heuristic)
        const language = detectLanguage(text);

        const analysis: DocumentAnalysis = {
            summary: insights.summary || 'Document analysis completed',
            clauses,
            overallRiskScore: insights.overallRiskScore || 50,
            keyInsights: insights.keyInsights || [],
            recommendedActions: insights.recommendedActions || [],
            language,
            documentType: insights.documentType || 'Legal Document'
        };

        console.log('Document analysis completed successfully');
        return analysis;

    } catch (error) {
        console.error('Document analysis failed:', error);
        throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Simple language detection
 */
function detectLanguage(text: string): string {
    // Simple heuristic - check for common Hindi/Devanagari characters
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
        return 'hi'; // Hindi
    }
    return 'en'; // Default to English
}