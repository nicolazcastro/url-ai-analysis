const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcrypt');

const registerUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const defaultRole = await Role.findOne({ where: { name: 'user' } });
    await user.addRole(defaultRole);
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    return user;
};

const checkUserExistence = async (email) => {
    const user = await User.findOne({ where: { email } });
    return !!user;
};

module.exports = { registerUser, loginUser, checkUserExistence };
