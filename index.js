const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const chromium = require('@sparticuz/chromium');
const express = require('express');

// 1. रेंडर को 'Timed Out' से बचाने के लिए वेब सर्वर
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running smooth!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// 2. AI और बॉट सेटअप
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(),
        headless: true,
        args: chromium.args,
    }
});

client.on('qr', (qr) => {
    console.log('--- SCAN THIS QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready and online!');
});

client.on('message', async (msg) => {
    if (msg.body.startsWith('!ai')) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(msg.body.slice(4));
        msg.reply(result.response.text());
    }
});

client.initialize();
