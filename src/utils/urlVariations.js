async function analyzeUrlWithVariations(url, userId, analyze) {
    const variations = [
        url, // Original URL
        `http://${url}`, // Add "http://" protocol
        `https://${url}`, // Add "https://" protocol
        `http://www.${url}`, // Add "http://" protocol with "www"
        `https://www.${url}`, // Add "https://" protocol with "www"
        `${url}.com`, // Add common top-level domain ".com"
        `www.${url}`, // Add "www" prefix
        `http://www.${url}.com`, // Add "http://" protocol with "www" and ".com"
        `https://www.${url}.com`, // Add "https://" protocol with "www" and ".com"
    ];

    let error = null;
    for (const variation of variations) {
        try {
            await analyze(variation, userId);
            return variation;
        } catch (err) {
            error = err;
        }
    }

    throw error;
}

module.exports = { analyzeUrlWithVariations };
