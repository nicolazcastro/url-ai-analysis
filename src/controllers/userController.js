const userService = require('../services/userService');
const { generateToken } = require('../services/authService');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await userService.checkUserExistence(email);
        if (userExists) {
            return res.status(409).send({ error: error.message });
        }
        await userService.registerUser(email, password);
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userService.loginUser(email, password);
        if (!user) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }
        const token = generateToken(user.id, user.email);
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

module.exports = { registerUser, loginUser };
