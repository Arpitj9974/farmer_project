const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
    console.log("Checking API Key: " + (process.env.GEMINI_API_KEY ? "Present" : "Missing"));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels method on the client in some versions, 
        // but we can try a simple generation with a known stable model.
        // Or we can just log the error with full JSON to see the body.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting to generate content...");
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error Details:", JSON.stringify(e, null, 2));
        if (e.response) {
            console.error("Response Status:", e.response.status);
            console.error("Response Status Text:", e.response.statusText);
        }
    }
}

checkModels();
