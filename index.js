import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium';
import express from 'express';

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tumhara admin number
const ADMIN_NUMBER = '918619986957@c.us'; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(),
        headless: true,
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();

    // 1. ADMIN COMMANDS (Sirf tumhare liye)
    if (msg.from === ADMIN_NUMBER) {
        if (msg.body.startsWith('/set_tone')) {
            // Yahan se tum bot ka tone change karoge
            const newTone = msg.body.replace('/set_tone ', '');
            process.env.AI_TONE = newTone;
            msg.reply('Admin, tone update ho gaya hai: ' + newTone);
            return;
        }
    }

    // 2. DIRECT AI REPLY (Bina !ai prefix ke)
    // Agar tum chaho ki bot sirf tumhare aur bacchon ke message ka jawab de
    const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        // System instructions: AI Teacher ka persona
        generationConfig: {
            candidateCount: 1,
            maxOutputTokens: 200,
        }
    });

    const prompt = `Tum ek friendly school teacher ho. ${process.env.AI_TONE || 'Bachon se dosti se baat karo'}. Sawal: ${msg.body}`;
    
    const result = await model.generateContent(prompt);
    msg.reply(result.response.text());
});

client.initialize();
app.listen(process.env.PORT || 3000);
