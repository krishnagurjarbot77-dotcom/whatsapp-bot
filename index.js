const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pino = require('pino');

// Tumhari API key yahan set hai
const genAI = new GoogleGenerativeAI("AIzaSyBwP3gJ-YyFm1d9tO4j-Kq4kM5pX6_zYwA");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('QR Code generated, please scan!');
        }
        if (connection === 'open') {
            console.log('--- AI TEACHER IS LIVE ---');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Tum ek smart school AI teacher ho. Humesha HINGLISH mein jawab do aur simple words use karo. User: ${text}`;
            
            const result = await model.generateContent(prompt);
            await sock.sendMessage(msg.key.remoteJid, { text: result.response.text() });
        } catch (err) {
            console.error("AI Error:", err);
        }
    });
}

connectToWhatsApp();
