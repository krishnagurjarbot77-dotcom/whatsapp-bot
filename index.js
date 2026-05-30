import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode'; // QR code image ke liye
import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(),
        headless: true,
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// QR Code storage
let qrData = '';

// Web server setup: Ye wala part 'Cannot GET /' error ko fix karega
app.get('/', (req, res) => {
    if (qrData) {
        qrcode.toDataURL(qrData, (err, url) => {
            res.send(`<h1>Scan this QR to connect Bot</h1><img src="${url}">`);
        });
    } else {
        res.send('Bot shuru ho raha hai, zara rukie...');
    }
});

client.on('qr', (qr) => {
    qrData = qr; // QR data save kar liya
    console.log('--- QR CODE READY ---');
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
app.listen(port, () => console.log(`Server running on port ${port}`));
