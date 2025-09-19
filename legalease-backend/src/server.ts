import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import route handlers
import { analyzeDocument } from './services/documentAnalyzer';
import { askQuestion } from './services/qaService';
import { translateText } from './services/translationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/tiff'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word, TXT, and image files are allowed.'));
        }
    }
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'LegalEase AI Backend is running' });
});

// Document upload and analysis
app.post('/api/analyze-document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        console.log('Analyzing document:', req.file.originalname);
        const analysis = await analyzeDocument(req.file.path, req.file.mimetype);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json(analysis);
    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze document',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Text analysis (for pasted content)
app.post('/api/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text content is required' });
        }

        console.log('Analyzing text content');
        const analysis = await analyzeDocument(text, 'text/plain');
        
        res.json(analysis);
    } catch (error) {
        console.error('Text analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze text',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Q&A endpoint
app.post('/api/ask-question', async (req, res) => {
    try {
        const { question, documentContext, language = 'en' } = req.body;
        
        if (!question || !documentContext) {
            return res.status(400).json({ 
                error: 'Question and document context are required' 
            });
        }

        console.log('Processing Q&A request');
        const answer = await askQuestion(question, documentContext, language);
        
        res.json({ answer });
    } catch (error) {
        console.error('Q&A error:', error);
        res.status(500).json({ 
            error: 'Failed to process question',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLanguage = 'hi' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text to translate is required' });
        }

        console.log('Translating text to:', targetLanguage);
        const translation = await translateText(text, targetLanguage);
        
        res.json({ translation });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            error: 'Failed to translate text',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 LegalEase AI Backend running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/api/health`);
});

export default app;