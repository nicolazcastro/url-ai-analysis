
const dotenv = require('dotenv');
const scrape = require('../utils/scraper');
const aiAnalyzer = require('../utils/aiAnalyzer'); // Include the AI analysis module
const jsonProcessor = require('../utils/jsonProcessor'); // Include the JSON processing module
const { createFile, writeAiResult} = require('../utils/fileWriter'); // Include the fileWriter module

// Load environment variables from .env file
dotenv.config();

const outputDirectory = process.env.OUTPUT_FOLDER || './url-output'; // Output directory
const depth = process.env.DEPTH || 2; // Output directory
const verbose = process.env.VERBOSE || false; // Verbose mode
const maxImages = process.env.MAX_IMAGES || 10; // 
const maxLinksPerScrape = process.env.MAX_LINKS || 5; // Max amount of links per page to be analized

async function analyze(url, userId){
    await scrape(userId, url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory);
    console.log('URL analyzed successfully.');

    // Preprocess the JSON file
    try {
        const filePath = await createFile(url, outputDirectory);
        await processAndAnalyzeData(filePath, outputDirectory);
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

async function processAndAnalyzeData(filePath, outputDirectory){
    console.log('Pre processing JSON data.');
    const jsonData = await jsonProcessor.processJson(filePath);

    // Send the JSON data to the AI analyzer for analysis
    console.log('Sending data to AI for analisys.');
    const response = await aiAnalyzer.processUrlData(jsonData);

    console.log('AI analysis:');
    console.log(response);
    await writeFinalResult(response, outputDirectory);
}

async function writeFinalResult(response, outputDirectory){
    // Store the AI analysis result in a file
    await writeAiResult(response, outputDirectory, url + "-ai-result");
}

module.exports = { analyze, writeFinalResult };