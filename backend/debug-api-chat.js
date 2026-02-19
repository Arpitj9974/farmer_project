const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugApiChat() {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
    // Create a dummy user token
    const token = jwt.sign({ id: 1, role: 'farmer' }, secret, { expiresIn: '1h' });

    console.log("Generated Token:", token.substring(0, 20) + "...");

    const url = 'http://localhost:5002/api/ai/chat';
    const body = {
        message: "Hello, recommend a crop for winter.",
        history: []
    };

    console.log(`Sending POST to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Response Body:", text);

        if (response.status !== 200) {
            console.log("Check ai_error_log.json for server-side details if 500.");
        }

    } catch (e) {
        console.error("Network/Fetch Error:", e);
    }
}

debugApiChat();
