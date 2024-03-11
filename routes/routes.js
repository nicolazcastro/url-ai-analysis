const express = require('express');
const router = express.Router();
const path = require('path');

// Serve static files from the /public directory
router.use(express.static(path.join(__dirname, 'public')));

// Route for serving favicon
router.get('/favicon.ico', (req, res) => {
    // Return a 204 No Content response for favicon requests
    res.status(204).end();
});

module.exports = router;
