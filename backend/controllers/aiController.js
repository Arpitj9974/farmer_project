const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require('../config/logger').child('AI_ASSISTANT');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_INSTRUCTION = `You are the FarmerConnect Agriculture Assistant. Your goal is to help Indian farmers and agricultural traders.
    - Provide advice on crop management, soil health, pest control, and weather-related precautions.
    - Explain market trends, MSP (Minimum Support Price) concepts, and trading best practices.
    - Use a helpful, professional, and encouraging tone.
    - Keep responses concise and actionable.
    - If you are asked about specific platform features, refer them to FarmerConnect's bidding and direct selling features.
    - Support multiple Indian contexts (crops like Wheat, Rice, Cotton, Mangoes, etc.).
    - You can communicate in English, and if possible, use simple terms that are easy to understand.`;

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        console.log("AI Chat Request:", { message, historyLength: history?.length });

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // List of models to fallback on if one fails due to 503 Overloaded or 404 Region locks
        const modelsToTry = [
            process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-pro'
        ];

        let lastError = null;
        let responseText = null;
        let successfulModel = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: SYSTEM_INSTRUCTION
                });

                const chatSession = model.startChat({
                    history: history || [],
                    generationConfig: {
                        maxOutputTokens: 1000,
                    },
                });

                const result = await chatSession.sendMessage(message);
                responseText = result.response.text();
                successfulModel = modelName;

                // Successfully got response, break out of loop
                break;
            } catch (err) {
                lastError = err;
                console.log(`Model ${modelName} failed, trying next... Error: ${err.message.substring(0, 50)}`);
                continue;
            }
        }

        if (!responseText) {
            throw lastError || new Error("All fallback models failed");
        }

        res.json({
            success: true,
            reply: responseText,
            debug_model_used: successfulModel
        });

    } catch (error) {
        logger.error("Gemini Chat Error", { error: error.message });
        console.error("FULL AI ERROR:", error);

        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../ai_error_log.json');
            fs.writeFileSync(logPath, JSON.stringify({
                message: error.message,
                stack: error.stack,
                time: new Date().toISOString()
            }, null, 2));
        } catch (fileErr) {
            console.error("Failed to write error log file", fileErr);
        }

        res.status(500).json({
            success: false,
            message: "Our AI assistant is temporarily busy. Please try again in a moment.",
            ...(process.env.NODE_ENV === 'development' && { debug: error.message })
        });
    }
};
