const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// तुम्हारी जेमिनी एआई की असली API Key
const GEMINI_API_KEY = 'AIzaSyAZWsUq3_02sE_HO23tZo5gfqlogDKRgug'; 
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

const client = new Client({
    authStrategy: new RemoteAuth({
        clientId: 'whatsapp-bot-session',
        backupSyncIntervalMs: 60000
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('QR_CODE_START');
    qrcode.generate(qr, { small: true });
    console.log('QR_CODE_END');
});

client.on('ready', () => {
    console.log('✅ BOT_READY: जेमिनी एआई बॉट अब क्लाउड पर लाइव है!');
});

client.on('message', async (msg) => {
    try {
        if (msg.from.endsWith('@g.us')) return;

        const text = msg.body.trim();
        if (text.length === 0) return;

        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `तुम एक helpful WhatsApp AI assistant हो। सरल और friendly हिंदी में जवाब do। User का सवाल: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        await msg.reply(response.text());
        
    } catch (error) {
        console.error('Error:', error);
    }
});

client.initialize();
