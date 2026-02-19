const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkEnvModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL;

    console.log(`Testing Model: ${modelName}`);

    if (!modelName) {
        console.error("GEMINI_MODEL not set in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    try {
        console.log("Generating content...");
        const result = await model.generateContent("Hello friend");
        console.log("Success!");
        console.log("Response:", result.response.text());
    } catch (e) {
        require('fs').writeFileSync('error_log.json', JSON.stringify(e, null, 2));
        console.error("Error logged to error_log.json");
    }
}

checkEnvModel();
