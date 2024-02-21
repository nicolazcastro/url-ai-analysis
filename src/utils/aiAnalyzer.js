const openaiClient = require('./openaiClient');

async function analyzeText(data) {
    const documents = [];
    documents.push(data.title);
    documents.push(data.description);
    documents.push(data.text);

    // Flatten sublinks and images into a single array for analysis
    const sublinks = flattenSublinks(data.sublinks);
    const images = flattenImages(data.images);

    // Add sublinks and images to the documents array
    sublinks.forEach(sublink => {
        documents.push(sublink.title);
        documents.push(sublink.description);
    });
    images.forEach(image => {
        documents.push(image.description);
    });

    const question = "Please analyze the following data and provide a summary of its purpose and main characteristics.";
    const response = await openaiClient.completions.create({
        model: 'text-davinci-003',
        documents: documents,
        question: question,
        max_tokens: 150
    });

    return response.data;
}

function flattenSublinks(sublinks) {
    let flattened = [];
    sublinks.forEach(sublink => {
        flattened.push(sublink);
        if (sublink.sublinks) {
            flattened.push(...flattenSublinks(sublink.sublinks));
        }
    });
    return flattened;
}

function flattenImages(images) {
    let flattened = [];
    images.forEach(image => {
        flattened.push(image);
    });
    return flattened;
}

module.exports = { analyzeText };
