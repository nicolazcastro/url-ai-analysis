const dotenv = require('dotenv');
const scrape = require('./utils/scraper');

// Load environment variables from .env file
dotenv.config();

const url = process.argv[2]; // URL as command line argument
const depth = process.env.DEPTH || 2; // Depth of sublink analysis
const verbose = process.env.VERBOSE === 'true'; // Verbose mode
const maxImages = process.env.MAX_IMAGES || 5; // Maximum number of images to analyze
const outputDirectory = process.env.OUTPUT_FOLDER || './url-output'; // Maximum number of images to analyze
const maxLinksPerScrape = process.env.MAX_LINKS_PER_SCRAPE || 5; // Maximum number of links to analyze per scrape

if (!url) {
    console.error('Please provide a URL as an argument when running the script.');
    process.exit(1);
}

async function analyzeUrl(url) {
    await scrape(url, depth, verbose, maxImages, maxLinksPerScrape, outputDirectory);
    console.log('URL analyzed successfully.');
}

analyzeUrl(url)
    .catch(error => console.error('Error during analysis:', error));
