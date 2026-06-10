const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Aboqreno AI', 
        creator: 'Mohamed Marghany',
        api_key_set: GEMINI_API_KEY ? 'yes' : 'no',
        api_key_length: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0
    });
});

// GET chat - for browser testing
app.get('/api/chat/gemini', async (req, res) => {
    try {
        const message = req.query.message || 'مرحبا';

        console.log('Received message:', message);
        console.log('API Key present:', GEMINI_API_KEY ? 'yes' : 'no');
        console.log('API Key length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key not configured',
                creator: 'Mohamed Marghany'
            });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        console.log('Calling Gemini API...');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        console.log('Response status:', response.status);

        const data = await response.json();

        console.log('Response data:', JSON.stringify(data).substring(0, 500));

        if (data.error) {
            console.error('API Error:', data.error);
            throw new Error(data.error.message || 'Unknown API error');
        }

        if (!data.candidates || !data.candidates[0]) {
            throw new Error('No response from AI');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        res.json({
            success: true,
            response: aiResponse,
            model: 'gemini-2.0-flash',
            creator: 'Mohamed Marghany'
        });

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            creator: 'Mohamed Marghany'
        });
    }
});

// POST chat - for the app
app.post('/api/chat/gemini', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key not configured'
            });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'Unknown API error');
        }

        if (!data.candidates || !data.candidates[0]) {
            throw new Error('No response from AI');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        res.json({
            success: true,
            response: aiResponse,
            model: 'gemini-2.0-flash',
            creator: 'Mohamed Marghany'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🧠 Aboqreno AI Server Running');
    console.log(`👤 Created by: Mohamed Marghany`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
});