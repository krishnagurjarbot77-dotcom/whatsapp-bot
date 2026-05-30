import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium';
import express from 'express';

// Web Server for Render
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
    console.log('--- QR CODE DETECTED ---');
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
