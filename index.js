import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        res.send('Bot connect ho raha hai, zara rukie...');
    }
});

client.on('qr', (qr) => {
    qrData = qr;
    console.log('--- QR CODE GENERATED ---');
});

client.on('ready', () => {
    console.log('--- BOT IS READY! ---');
});

client.on('message', async (msg) => {
    console.log(`Message received: ${msg.body}`);
    
    // Admin Command
    if (msg.from === ADMIN_NUMBER && msg.body.startsWith('/set_tone')) {
        const newTone = msg.body.replace('/set_tone ', '');
        process.env.AI_TONE = newTone;
        msg.reply('Tone update ho gaya hai: ' + newTone);
        return;
    }

    // Direct AI Reply
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Tum ek friendly school teacher ho. ${process.env.AI_TONE || 'Bachon se dosti se baat karo'}. Sawal: ${msg.body}`;
    
    try {
        const result = await model.generateContent(prompt);
        msg.reply(result.response.text());
    } catch (err) {
        console.error("AI Error:", err);
    }
});

client.initialize();
app.listen(port, () => console.log(`Server running on port ${port}`));
