import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Bot Client setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(),
        headless: true,
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// QR code ko web link mein convert karne ke liye
let qrLink = '';
app.get('/', (req, res) => {
    if (qrLink) {
        qrcode.toDataURL(qrLink, (err, url) => {
            res.send(`<h1>WhatsApp Bot Scan</h1><img src="${url}">`);
        });
    } else {
        res.send('Bot shuru ho raha hai, zara rukie...');
    }
});

client.on('qr', (qr) => {
    qrLink = qr;
    console.log('--- QR CODE READY ---');
    console.log('Apne browser mein ye link kholein scan karne ke liye: https://whatsapp-gemini-bot-uwya.onrender.com');
});

client.on('ready', () => console.log('Bot is ready!'));

client.on('message', async (msg) => {
    if (msg.body.startsWith('!ai')) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(msg.body.slice(4));
        msg.reply(result.response.text());
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
client.initialize();
