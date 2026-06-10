const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==================== GOOGLE GEMINI (مجاني) ====================
async function askGemini(message, history = []) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // بناء المحادثة
    const contents = [];

    // إضافة تعليمات النظام بالعربي
    contents.push({
        role: 'user',
        parts: [{ text: `أنت عبقرينو، مساعد ذكي عربي. قواعدك:
- تحدث بالعربية الفصحى بشكل رئيسي
- يمكنك استخدام العامية المصرية أو الخليجية عند الطلب
- قدم إجابات دقيقة ومفيدة
- اشرح المفاهيم المعقدة ببساطة
- احترم المستخدم وكن ودوداً
- إذا سألك عن الرياضيات، أعطِ الخطوات بالتفصيل
- إذا طلب كود برمجي، اكتبه نظيفاً مع تعليقات
- إذا طلب ترجمة، ترجم بشكل دقيق وسلس
- موقعك: تم إنشاؤك بواسطة Mohamed Marghany` }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: 'تمام! أنا عبقرينو، مساعدك الذكي بالعربية. جاهز أساعدك في أي حاجة تحتاجها! 🧠' }]
    });

    // إضافة تاريخ المحادثة
    for (const msg of history) {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        });
    }

    // إضافة الرسالة الحالية
    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                topP: 0.95
            }
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.candidates[0].content.parts[0].text;
}

// ==================== OPENAI GPT-4o ====================
async function askOpenAI(message, history = [], model = 'gpt-4o-mini') {
    const API_KEY = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const messages = [
        {
            role: 'system',
            content: `أنت عبقرينو، مساعد ذكي عربي. تم إنشاؤك بواسطة Mohamed Marghany.
قواعدك:
- تحدث بالعربية الفصحى بشكل رئيسي
- يمكنك استخدام العامية المصرية أو الخليجية عند الطلب
- قدم إجابات دقيقة ومفيدة
- اشرح المفاهيم المعقدة ببساطة
- احترم المستخدم وكن ودوداً
- أعطِ خطوات الرياضيات بالتفصيل
- اكتب الكود البرمجي نظيفاً مع تعليقات
- ترجم بشكل دقيق وسلس`
        }
    ];

    // إضافة تاريخ المحادثة
    for (const msg of history) {
        messages.push({
            role: msg.role,
            content: msg.content
        });
    }

    messages.push({
        role: 'user',
        content: message
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
}

// ==================== API Routes ====================

// GET support for testing (so you can test in browser)
app.get('/api/chat/gemini', async (req, res) => {
    try {
        const message = req.query.message || 'مرحبا';
        const response = await askGemini(message, []);
        res.json({
            success: true,
            response: response,
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

app.get('/api/chat/openai', async (req, res) => {
    try {
        const message = req.query.message || 'مرحبا';
        const response = await askOpenAI(message, [], 'gpt-4o-mini');
        res.json({
            success: true,
            response: response,
            model: 'gpt-4o-mini',
            creator: 'Mohamed Marghany'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



// GET support for testing (so you can test in browser)
app.get('/api/chat/gemini', async (req, res) => {
    try {
        const message = req.query.message || 'مرحبا';
        const response = await askGemini(message, []);
        res.json({
            success: true,
            response: response,
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

app.get('/api/chat/openai', async (req, res) => {
    try {
        const message = req.query.message || 'مرحبا';
        const response = await askOpenAI(message, [], 'gpt-4o-mini');
        res.json({
            success: true,
            response: response,
            model: 'gpt-4o-mini',
            creator: 'Mohamed Marghany'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// الصحة
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Aboqreno AI', creator: 'Mohamed Marghany' });
});

// محادثة مع Gemini
app.post('/api/chat/gemini', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'الرسالة فارغة' });
        }

        const response = await askGemini(message, history || []);

        res.json({
            success: true,
            response: response,
            model: 'gemini-2.0-flash',
            creator: 'Mohamed Marghany'
        });

    } catch (error) {
        console.error('Gemini Error:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في المعالجة. جرب مرة تانية.',
            details: error.message
        });
    }
});

// محادثة مع OpenAI
app.post('/api/chat/openai', async (req, res) => {
    try {
        const { message, history, model } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'الرسالة فارغة' });
        }

        const response = await askOpenAI(message, history || [], model || 'gpt-4o-mini');

        res.json({
            success: true,
            response: response,
            model: model || 'gpt-4o-mini',
            creator: 'Mohamed Marghany'
        });

    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في المعالجة. جرب مرة تانية.',
            details: error.message
        });
    }
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 3000;

// ⚠️ ملاحظة مهمة: لو بتستخدم Render free tier
// السيرفر بينام بعد 15 دقيقة من عدم الاستخدام
// أول طلب بعد النوم ممكن ياخد 30 ثانية
// الحل: اشتري paid plan ($7/شهر) أو استخدم Railway/Render paid
app.listen(PORT, () => {
    console.log('🧠 عبقرينو شغال!');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log('👤 Created by: Mohamed Marghany');
    console.log('');
    console.log('اختبر الـ API:');
    console.log(`curl -X POST http://localhost:${PORT}/api/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "مرحبا"}'`);
});

module.exports = app;
