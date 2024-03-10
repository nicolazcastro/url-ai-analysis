// index.js del frontend

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración del proxy
const proxy = httpProxy.createProxyServer();
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001'; // user microservice URL
const urlAnalysisServiceUrl = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3002'; // analysis microservice URL

// Redirigir las solicitudes relacionadas con usuarios al microservicio correspondiente
app.use('/users', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

app.use('/analysis', (req, res) => {
    proxy.web(req, res, { target: urlAnalysisServiceUrl });
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});
