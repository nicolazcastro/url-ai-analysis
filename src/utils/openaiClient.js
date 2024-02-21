// utils/openaiClient.js
const openai = require('openai');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const openaiClient = new openai.OpenAI(apiKey);

module.exports = openaiClient;
