require('dotenv').config();

async function checkModel() {
    const key = process.env.GEMINI_API_KEY;
    const modelName = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${key}`;
    console.log(`Checking ${modelName}...`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log("Model found:", data.name);
        } else {
            console.log("Model NOT found or error:", await response.text());
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

checkModel();
