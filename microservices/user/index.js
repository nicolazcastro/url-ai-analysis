const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const proxy = httpProxy.createProxyServer();
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001'; 

app.use('/users', (req, res) => {
    proxy.web(req, res, { target: userServiceUrl });
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});
