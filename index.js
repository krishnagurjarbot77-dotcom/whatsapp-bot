import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, LocalAuth } = require('whatsapp-web.js');
import qrcode from 'qrcode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import chromium from '@sparticuz/chromium'; // Ye zaroori hai
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: await chromium.executablePath(), // Ye line fix karegi
        headless: chromium.headless,
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox']
    }
});

// ... (Baaki QR code aur Message logic waisa hi rahega)
