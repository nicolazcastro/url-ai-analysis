const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const userService = require('../services/userService');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_WEB_CLIENT_ID,
    clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ where: { email: email } });
        if (!user) {
            // If the user doesn't exist, register them
            user = await userService.registerUserFromGoogle(email, profile.id);
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findOne({ where: { id } });        
        done(null, user);
    } catch (error) {
        done(error);
    }
});

const googleLoginRedirect = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleLoginCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/' })(req, res, (err) => {
        if (err) {
            return res.redirect('/login');
        }
        // If authentication succeeds, generate JWT token and redirect to main page
        googleLoginCallbackWithToken(req, res);
    });
};

const googleLoginCallbackWithToken = (req, res) => {
    const userId = req.user.id;
    const email = req.user.email; // Assuming you have this field in your User model

    // Generate JWT token
    const token = generateToken(userId, email);

    // Redirect user to main page with token included in the URL
    res.redirect(`/?token=${token}`);
};

const generateToken = (userId, email) => {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const refreshToken = (token) => {
    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Extract payload data from the old token
        const { userId, email } = decodedToken;

        // Check if the token is about to expire (e.g., within the next 5 minutes)
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeToExpire = expirationTime - currentTime;

        // If the token is about to expire (within the next 5 minutes), generate a new token
        if (timeToExpire < 5 * 60 * 1000) {
            console.log('Token is about to expire. Generating a new token...');
            
            // Generate a new token with a renewed expiration time
            const newToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Example: 1 hour expiration
            console.log('New token generated:', newToken);
            
            return newToken;
        } else {
            // Token is still valid, return the same token
            console.log('Token is still valid.');
            return token;
        }
    } catch (error) {
        // Token verification failed, return unauthorized
        console.error('Token verification failed:', error);
        throw new Error('Unauthorized');
    }
};

module.exports = { googleLoginCallback, googleLoginRedirect, generateToken, verifyToken, refreshToken };
