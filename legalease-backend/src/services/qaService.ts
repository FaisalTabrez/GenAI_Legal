import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface QAResponse {
    question: string;
    answer: string;
    relatedClauses: string[];
    confidence: number;
    followUpQuestions: string[];
}

/**
 * Process user questions about legal documents
 */
export async function askQuestion(
    question: string, 
    documentContext: string, 
    language: string = 'en'
): Promise<QAResponse> {
    try {
        console.log('Processing Q&A request:', { question, language });
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const languageInstruction = language === 'hi' 
            ? 'Respond in Hindi/हिंदी language.' 
            : 'Respond in English.';

        const prompt = `
You are a legal AI assistant helping ordinary users understand legal documents. 
${languageInstruction}

Document Context:
${documentContext}

User Question: ${question}

Please provide:
1. A clear, comprehensive answer in plain language
2. Specific references to relevant clauses/sections
3. Any important implications or warnings
4. 2-3 helpful follow-up questions the user might want to ask

Guidelines:
- Use simple, non-technical language
- Explain legal terms when necessary
- Be specific about risks or benefits
- Include relevant Indian law context when applicable
- If you cannot answer definitively, clearly state limitations

Format your response as JSON:
{
  "answer": "comprehensive answer in plain language",
  "relatedClauses": ["clause 1 text", "clause 2 text"],
  "confidence": confidence_score_0_to_100,
  "followUpQuestions": ["question 1", "question 2", "question 3"]
}
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
            question,
            answer: parsedResponse.answer || 'I apologize, but I could not generate a proper response to your question.',
            relatedClauses: parsedResponse.relatedClauses || [],
            confidence: parsedResponse.confidence || 50,
            followUpQuestions: parsedResponse.followUpQuestions || []
        };

    } catch (error) {
        console.error('Q&A processing error:', error);
        
        // Return fallback response
        return {
            question,
            answer: `I apologize, but I encountered an error while processing your question. Please try rephrasing your question or contact support if the issue persists. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            relatedClauses: [],
            confidence: 0,
            followUpQuestions: [
                'Can you explain this in simpler terms?',
                'What are the main risks I should be aware of?',
                'Are there any standard alternatives to this clause?'
            ]
        };
    }
}

/**
 * Generate contextual follow-up questions based on document analysis
 */
export async function generateContextualQuestions(documentContext: string): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
Based on the following legal document, generate 5-7 important questions that ordinary users should ask to better understand their rights and obligations:

Document Context:
${documentContext}

Generate practical questions that focus on:
- Key rights and obligations
- Potential risks or penalties
- Important deadlines or conditions
- Financial implications
- Termination or cancellation procedures

Return as JSON array:
{
  "questions": ["question 1", "question 2", "question 3", ...]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return getDefaultQuestions();
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);
        return parsedResponse.questions || getDefaultQuestions();

    } catch (error) {
        console.error('Question generation error:', error);
        return getDefaultQuestions();
    }
}

/**
 * Default questions for fallback
 */
function getDefaultQuestions(): string[] {
    return [
        'What are my main obligations under this agreement?',
        'How can this agreement be terminated?',
        'What penalties or fees might I face?',
        'What happens if I want to cancel early?',
        'Are there any unusual or risky clauses I should know about?',
        'What are my rights if the other party breaches the agreement?',
        'Are there any important deadlines I need to remember?'
    ];
}