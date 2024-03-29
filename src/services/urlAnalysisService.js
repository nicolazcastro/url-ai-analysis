
const dotenv = require('dotenv');
const scrape = require('../utils/scraper');
const aiAnalyzer = require('../utils/aiAnalyzer'); // Include the AI analysis module
const jsonProcessor = require('../utils/jsonProcessor'); // Include the JSON processing module
const { createFile, writeAiResult, deleteFileIfExists} = require('../utils/fileWriter'); // Include the fileWriter module

// Load environment variables from .env file
dotenv.config();

const outputDirectory = process.env.OUTPUT_FOLDER || './url-output'; // Output directory
const depth = process.env.DEPTH || 2; // Output directory
const verbose = process.env.VERBOSE || false; // Verbose mode
const maxImages = process.env.MAX_IMAGES || 10; // Max amount of images per page to be analized
const maxLinksPerScrape = process.env.MAX_LINKS || 5; // Max amount of links per page to be analized
const seoImproveFileString = process.env.SEO_IMPROVE_FILE_STRING || '-seo-improve'; 

async function analyze(url, userId, improveSeo){
    await scrape(userId, url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory);
    console.log('URL analyzed successfully.');

    // Preprocess the JSON file
    try {
        const filePath = await createFile(url, outputDirectory);
        await processAndAnalyzeData(url, filePath, outputDirectory, improveSeo);
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

async function processAndAnalyzeData(url, filePath, outputDirectory, improveSeo){
    console.log('Pre processing JSON data.');
    const jsonData = await jsonProcessor.processJson(filePath);

    // Send the JSON data to the AI analyzer for analysis
    console.log('Sending data to AI for analisys.');
    const response = await aiAnalyzer.processUrlData(jsonData);

    console.log('AI analysis:');
    console.log(response);
    await writeFinalResult(url, response, outputDirectory);
    if(improveSeo === true){
        const seoResponse = await aiAnalyzer.processURLDataForSEO(jsonData);
        await writeFinalResult(url + seoImproveFileString, seoResponse, outputDirectory);
    }
}

async function writeFinalResult(url, response, outputDirectory){
    await writeAiResult(response, outputDirectory, url + "-ai-result");
}

async function deleteCachedFileIfExists(userId, outputDirectory){
    await deleteFileIfExists(userId, outputDirectory);
}

module.exports = { analyze, writeFinalResult, deleteCachedFileIfExists };