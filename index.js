import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ADMIN_NUMBER = '918619986957@c.us';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

let qrData = '';

app.get('/', (req, res) => {
    if (qrData) {
        qrcode.toDataURL(qrData, (err, url) => {
            res.send(`<h1>SkillFlow AI Bot</h1><img src="${url}">`);
        });
    } else {
        res.send('<h1>Bot initialize ho raha hai...</h1>');
    }
});

client.on('qr', (qr) => {
    qrData = qr;
    console.log('--- QR CODE READY ---');
});

client.on('ready', () => {
    console.log('--- BOT IS READY! ---');
});

client.on('message', async (msg) => {
    console.log(`Message received: ${msg.body}`);
    
    if (msg.from === ADMIN_NUMBER && msg.body.startsWith('/set_tone')) {
        process.env.AI_TONE = msg.body.replace('/set_tone ', '');
        msg.reply('Tone update ho gaya!');
        return;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Teacher persona: ${process.env.AI_TONE || 'Friendly teacher'}. User: ${msg.body}`;
        const result = await model.generateContent(prompt);
        msg.reply(result.response.text());
    } catch (err) {
        console.error("AI Error:", err);
    }
});

client.initialize();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
