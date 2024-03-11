const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const routes = require('./routes/routes');
const session = require('express-session');
const passport = require('passport');
const crypto = require('crypto');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Generate a secure random string of 32 characters
const secretKey = crypto.randomBytes(32).toString('hex');

app.use(cors());

// Configure express-session middleware
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/', routes); // Use the routes defined in the routes folder

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
