const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const routes = require('./routes/routes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/', routes); // Use the routes defined in the routes folder

app.get('/favicon.ico', (req, res) => res.status(204));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
