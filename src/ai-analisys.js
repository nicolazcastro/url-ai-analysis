const urlAnalysisService = require('./services/urlAnalysisService');

const url = process.argv[2] || 'https://github.com/nicolazcastro/url-ai-analysis'; // URL as command line argument

if (!url) {
    console.error('Please provide an URL as an argument when running the script.');
    process.exit(1);
}

await urlAnalysisService.analyze(url);
process.exit(1);
