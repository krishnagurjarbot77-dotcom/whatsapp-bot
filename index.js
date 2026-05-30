import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Ab hum 'require' use kar sakte hain un libraries ke liye jo CommonJS hain
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Baki libraries ko 'import' ke saath rakho
import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium';
import express from 'express';

// Server Setup
const app = express();
app.get('/', (req, res) => res.send('Bot is live!'));
app.listen(process.env.PORT || 3000);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(),
        headless: true,
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('Bot is ready!'));

client.on('message', async (msg) => {
    if (msg.body.startsWith('!ai')) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(msg.body.slice(4));
        msg.reply(result.response.text());
    }
});

client.initialize();
