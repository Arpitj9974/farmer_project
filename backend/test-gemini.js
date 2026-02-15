const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("ping");
        console.log("Gemini 1.5 Flash Response successful");
    } catch (e) {
        console.log("Gemini 1.5 Flash failed:", e.message);
    }

    try {
        // Alternative name
        const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("ping");
        console.log("Gemini Pro Response successful");
    } catch (e) {
        console.log("Gemini Pro failed:", e.message);
    }
}

listModels();
