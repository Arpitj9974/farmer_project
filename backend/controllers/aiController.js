const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../config/logger').child('AI_ASSISTANT');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    systemInstruction: `You are the FarmerConnect Agriculture Assistant. Your goal is to help Indian farmers and agricultural traders.
    - Provide advice on crop management, soil health, pest control, and weather-related precautions.
    - Explain market trends, MSP (Minimum Support Price) concepts, and trading best practices.
    - Use a helpful, professional, and encouraging tone.
    - Keep responses concise and actionable.
    - If you are asked about specific platform features, refer them to FarmerConnect's bidding and direct selling features.
    - Support multiple Indian contexts (crops like Wheat, Rice, Cotton, Mangoes, etc.).
    - You can communicate in English, and if possible, use simple terms that are easy to understand.`
});

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const chatSession = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        res.json({
            success: true,
            reply: responseText
        });

    } catch (error) {
        logger.error("Gemini Chat Error", { error: error.message });
        res.status(500).json({
            success: false,
            message: "Our AI assistant is temporarily busy. Please try again in a moment.",
            ...(process.env.NODE_ENV === 'development' && { debug: error.message })
        });
    }
};
