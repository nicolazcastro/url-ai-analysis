const express = require('express');
const router = express.Router();
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer();
const userServiceUrl = 'http://localhost:3001'; // URL of the user microservice
const urlAnalysisServiceUrl = 'http://localhost:3002'; // URL of the user microservice
// Define other microservice URLs as needed

// Route definitions
router.post('/users/register', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

router.post('/users/login', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

router.post('/url-analysis/analyze', (req, res) => {
    // Proxy request to URL analysis microservice
    proxy.web(req, res, { target: urlAnalysisServiceUrl }); // URL of the URL analysis microservice
});

// Add more routes for other microservices as needed

module.exports = router;
