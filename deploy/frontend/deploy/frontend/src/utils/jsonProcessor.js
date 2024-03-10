// utils/jsonProcessor.js

const fs = require('fs').promises;

async function processJson(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error processing JSON file:', error);
        throw error;
    }
}

module.exports = { processJson };
