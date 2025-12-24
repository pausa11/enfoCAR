const https = require('https');
const fs = require('fs');
const path = require('path');

let apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/) || envContent.match(/GOOGLE_API_KEY=(.*)/);
            if (match) {
                apiKey = match[1].trim();
            }
        }
    } catch (e) {
        // ignore
    }
}

if (!apiKey) {
    console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY not found in environment or .env file.');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.error) {
                console.error('API Error:', response.error.message);
            } else if (response.models) {
                console.log('Available Gemini Models:');
                response.models.filter(m => m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent'))
                    .forEach(model => {
                        console.log(`- ${model.name.replace('models/', '')}`);
                    });
            } else {
                console.log('No models found or unexpected format.', data);
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw response:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
