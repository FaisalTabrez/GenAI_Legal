import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface TranslationResponse {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
}

/**
 * Language mappings
 */
const LANGUAGE_CODES: { [key: string]: string } = {
    'en': 'English',
    'hi': 'Hindi/हिंदी',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'bn': 'Bengali/বাংলা',
    'ta': 'Tamil/தமிழ்',
    'te': 'Telugu/తెలుగు',
    'mr': 'Marathi/मराठी',
    'gu': 'Gujarati/ગુજરાતી',
    'kn': 'Kannada/ಕನ್ನಡ',
    'ml': 'Malayalam/മലയാളം',
    'pa': 'Punjabi/ਪੰਜਾਬੀ',
    'ur': 'Urdu/اردو'
};

/**
 * Translate text with legal context preservation
 */
export async function translateText(
    text: string, 
    targetLanguage: string = 'hi',
    sourceLanguage: string = 'en'
): Promise<TranslationResponse> {
    try {
        console.log(`Translating text from ${sourceLanguage} to ${targetLanguage}`);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const sourceLangName = LANGUAGE_CODES[sourceLanguage] || sourceLanguage;
        const targetLangName = LANGUAGE_CODES[targetLanguage] || targetLanguage;

        const prompt = `
You are a legal translation specialist. Translate the following legal text from ${sourceLangName} to ${targetLangName}.

IMPORTANT GUIDELINES:
1. Preserve legal meaning and nuance
2. Maintain formal legal tone
3. Include explanations for legal terms that don't have direct translations
4. Keep technical terms in brackets if needed: [original term]
5. Ensure cultural and legal context is appropriate for the target language
6. For Indian regional languages, consider Indian legal system context

Text to translate:
${text}

Provide response in JSON format:
{
  "translatedText": "translated text here",
  "confidence": confidence_score_0_to_100,
  "notes": "any important translation notes or explanations"
}

Focus on clarity and legal accuracy over literal word-for-word translation.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Parse JSON response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        return {
            originalText: text,
            translatedText: parsedResponse.translatedText || text,
            sourceLanguage,
            targetLanguage,
            confidence: parsedResponse.confidence || 70
        };

    } catch (error) {
        console.error('Translation error:', error);
        
        // Return fallback response
        return {
            originalText: text,
            translatedText: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            sourceLanguage,
            targetLanguage,
            confidence: 0
        };
    }
}

/**
 * Translate legal document summary with context
 */
export async function translateLegalSummary(
    summary: string,
    documentType: string,
    targetLanguage: string = 'hi'
): Promise<TranslationResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const targetLangName = LANGUAGE_CODES[targetLanguage] || targetLanguage;

        const prompt = `
Translate this legal document summary to ${targetLangName}, keeping in mind it's for ordinary users who need to understand their legal rights and obligations.

Document Type: ${documentType}
Summary: ${summary}

Guidelines:
1. Use simple, accessible language in the target language
2. Explain legal concepts clearly
3. Maintain accuracy while improving comprehension
4. Include cultural context relevant to the target language region
5. For Indian languages, reference Indian legal system when relevant

Provide response in JSON format:
{
  "translatedText": "user-friendly translated summary",
  "confidence": confidence_score_0_to_100
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        return {
            originalText: summary,
            translatedText: parsedResponse.translatedText || summary,
            sourceLanguage: 'en',
            targetLanguage,
            confidence: parsedResponse.confidence || 70
        };

    } catch (error) {
        console.error('Legal summary translation error:', error);
        return await translateText(summary, targetLanguage, 'en');
    }
}

/**
 * Get available language options
 */
export function getAvailableLanguages(): { code: string; name: string }[] {
    return Object.entries(LANGUAGE_CODES).map(([code, name]) => ({
        code,
        name
    }));
}

/**
 * Detect source language of text
 */
export async function detectLanguage(text: string): Promise<string> {
    try {
        // Simple pattern-based detection for common cases
        const patterns = {
            'hi': /[\u0900-\u097F]/, // Devanagari script
            'ar': /[\u0600-\u06FF]/, // Arabic script
            'zh': /[\u4e00-\u9fff]/, // Chinese characters
            'ta': /[\u0B80-\u0BFF]/, // Tamil script
            'te': /[\u0C00-\u0C7F]/, // Telugu script
            'bn': /[\u0980-\u09FF]/, // Bengali script
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                return lang;
            }
        }

        // Default to English if no pattern matches
        return 'en';

    } catch (error) {
        console.error('Language detection error:', error);
        return 'en';
    }
}