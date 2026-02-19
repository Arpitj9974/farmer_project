require('dotenv').config();

async function testRestApi() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Testing key ending in ...${key.slice(-4)}`);

    // Test 1: List Models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const text = await response.text();
            console.log("Error Body:", text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            const fs = require('fs');
            fs.writeFileSync('models_list.json', JSON.stringify(data.models, null, 2));
            console.log("Models saved to models_list.json");
        } else {
            console.log("No models returned?", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testRestApi();
