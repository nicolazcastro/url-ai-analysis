const userService = require('../services/userService');
const { generateToken, verifyToken, refreshToken } = require('../services/authService');
const { googleLoginCallback } = require('../services/authService'); // Import Google login callback function from authService


const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await userService.checkUserExistence(email);
        if (userExists) {
            return res.status(409).send({ error: error.message });
        }
        await userService.registerUser(email, password);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userService.loginUser(email, password);
        if (!user) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }
        const token = generateToken(user.id, user.email);
        res.send({ token });
    } catch (error) {
        res.status(401).send({ message: error.message });
    }
};

const verifyUserToken = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    try {
        const decodedToken = verifyToken(token);
        // If the token is about to expire, generate a new one
        if (decodedToken.exp * 1000 - Date.now() < 5 * 60 * 1000) {
            const newToken = refreshToken(token);
            res.send({ token: newToken });
        } else {
            // Token is still valid, return the same token
            res.send({ token });
        }
    } catch (error) {
        res.status(401).send({ message: 'Unauthorized' });
    }
};

const refreshUserToken = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    try {
        // Generate a new token if the existing token is about to expire
        const newToken = refreshToken(token);
        res.send({ token: newToken });
    } catch (error) {
        res.status(401).send({ message: 'Unauthorized' });
    }
};

module.exports = { registerUser, loginUser, googleLoginCallback, verifyUserToken, refreshUserToken };
