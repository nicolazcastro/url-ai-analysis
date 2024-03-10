// index.js del frontend

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración del proxy
const proxy = httpProxy.createProxyServer();
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001'; // URL del microservicio de usuarios

// Redirigir las solicitudes relacionadas con usuarios al microservicio correspondiente
app.use('/users', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});
