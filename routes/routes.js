const express = require('express');
const router = express.Router();
const httpProxy = require('http-proxy');
const dotenv = require('dotenv');

dotenv.config();

const proxy = httpProxy.createProxyServer();
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001'; // user microservice URL
const urlAnalysisServiceUrl = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3002'; // analysis microservice URL
// Define other microservice URLs as needed

// Route definitions
router.post('/user/register', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

router.post('/user/login', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

router.post('/url-analysis/analyze', (req, res) => {
    // Proxy request to URL analysis microservice
    proxy.web(req, res, { target: urlAnalysisServiceUrl }); // URL of the URL analysis microservice
});

// Add more routes for other microservices as needed

module.exports = router;
