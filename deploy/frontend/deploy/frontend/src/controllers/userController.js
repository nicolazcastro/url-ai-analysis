const userService = require('../services/userService');
const { generateToken } = require('../services/authService');
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

module.exports = { registerUser, loginUser, googleLoginCallback };
