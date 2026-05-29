const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    }
});

client.on('qr', qr => {
    console.log('--- NEW QR CODE GENERATED ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Bot is fully ready and online!');
});

client.on('message', async msg => {
    if (msg.fromMe) return;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: msg.body,
        });
        msg.reply(response.text);
    } catch (error) {
        console.error('Error with Gemini:', error);
    }
});

client.initialize();
