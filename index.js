const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve favicon.ico without giving an error
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
});
