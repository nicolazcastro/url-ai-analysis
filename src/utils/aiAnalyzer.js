const { OpenAI } = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI(apiKey);

async function analyzeText(text) {
    const question = "Please analyze this data which was extracted from a URL and provide an interpretation of its purpose and main features.";
    const response = await openai.chat.completions.create({
        messages: [{ role: "system", content: question + '\n\n' + text }],
        model: "gpt-3.5-turbo-0125",
      });
    return response;
}

function generateTextForAnalysis(data, accumulatedText = '') {
    let text = accumulatedText;
    for (const node of data) {
        if (node.title) {
            text += node.title + ' ';
        }
        if (node.description) {
            text += node.description + ' ';
        }
        if (node.url) {
            text += node.url + ' ';
        }
        if (node.description) {
            text += node.description + ' ';
        }
        if (node.images && node.images.length > 0) {
            for (const image of node.images) {
                if (image.src) {
                    text += image.src + ' ';
                }
                if (image.description && image.description.length > 0) {
                    for (const desc of image.description) {
                        if (desc.className) {
                            text += desc.className + ' ';
                        }
                    }
                }
            }
        }
        if (node.sublinks && node.sublinks.length > 0) {
            text += generateTextForAnalysis(node.sublinks, text);
        }
    }
    return text;
}

async function processUrlData(data) {
    const text = generateTextForAnalysis([data]);
    return await analyzeText(text);
}

module.exports = { processUrlData };
