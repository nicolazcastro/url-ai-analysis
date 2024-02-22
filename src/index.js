
const { analyzeUrl } = require('./ai-analisys');

analyzeUrl(url)
    .catch(error => console.error('Error during analysis:', error));