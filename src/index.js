// index.js

const dotenv = require('dotenv');
const fs = require('fs').promises;
const scrape = require('./utils/scraper');
const aiAnalyzer = require('./utils/aiAnalyzer'); // Include the AI analysis module
const jsonProcessor = require('./utils/jsonProcessor'); // Include the JSON processing module
const fileWriter = require('./utils/fileWriter'); // Include the fileWriter module

// Load environment variables from .env file
dotenv.config();

const url = process.argv[2] || 'https://github.com/nicolazcastro/url-ai-analysis'; // URL as command line argument
const outputDirectory = process.env.OUTPUT_FOLDER || './url-output'; // Output directory
const depth = process.env.DEPTH || 2; // Output directory
const verbose = process.env.VERBOSE || false; // Verbose mode
const maxImages = process.env.MAX_IMAGES || 10; // 
const maxLinksPerScrape = process.env.MAX_LINKS || 5; // Max amount of links per page to be analized

if (!url) {
    console.error('Please provide a URL as an argument when running the script.');
    process.exit(1);
}

async function analyzeUrl(url) {
    await scrape(url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory);
    console.log('URL analyzed successfully.');

    // Preprocess the JSON file
    try {
        console.log('Pre processing JSON data.');
        const filePath = `${outputDirectory}/${encodeURIComponent(url)}.json`;
        const jsonData = await jsonProcessor.processJson(filePath);

        // Send the JSON data to the AI analyzer for analysis
        console.log('Sending data to AI for analisys.');
        const response = await aiAnalyzer.analyzeText(jsonData);

        console.log('AI analysis:');
        console.log(response);

        // Store the AI analysis result in a file
        await fileWriter.writeAiResult(response, outputDirectory, url);
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

analyzeUrl(url)
    .catch(error => console.error('Error during analysis:', error));
