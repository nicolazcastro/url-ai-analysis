const User = require('../models/user');
const Role = require('../models/role');
const Account = require('../models/account');
const bcrypt = require('bcrypt');

const registerUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    
    // Create associated account with default credit value of 0
    await Account.create({ user_id: user.id, credit: 0 });

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

const updateCredit = async (userId, credit) => {
    // Find the user's account and update the credit
    const account = await Account.findOne({ where: { userId: userId } });
    if (!account) {
        throw new Error('Account not found');
    }
    account.credit = credit;
    await account.save();
};

const getCredit = async (userId) => {
    try {
        // Find the user by userId
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Find the corresponding account for the user
        const account = await Account.findOne({ where: { userId: userId } });
        if (!account) {
            throw new Error('Account not found');
        }

        // Return the credit from the account
        return account.credit;
    } catch (error) {
        throw new Error(`Error getting credit: ${error.message}`);
    }
};

module.exports = { registerUser, loginUser, checkUserExistence, updateCredit, getCredit };
