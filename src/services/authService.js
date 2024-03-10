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
        expiresIn: '7d'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { googleLoginCallback, googleLoginRedirect, generateToken, verifyToken };
