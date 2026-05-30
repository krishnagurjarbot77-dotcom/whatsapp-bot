const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const chromium = require('@sparticuz/chromium');
const express = require('express');

// 1. Render ke liye Web Server (taaki bot crash na ho)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is live and running!'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// 2. Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Bot Client Setup
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

client.on('ready', () => {
    console.log('Bot is ready and online!');
});

// 4. Message Handler
client.on('message', async (msg) => {
    // Sirf !ai se shuru hone wale message ka jawab dega
    if (msg.body.startsWith('!ai')) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = msg.body.slice(4);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            msg.reply(response.text());
        } catch (error) {
            console.error(error);
            msg.reply("Sorry, main abhi jawab nahi de pa raha.");
        }
    }
});

client.initialize();
