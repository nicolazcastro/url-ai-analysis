const User = require('../models/user');
const Role = require('../models/role');
const Account = require('../models/account');
const bcrypt = require('bcrypt');

require('dotenv').config();

const apiKey = process.env.DB_RETRIES;

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
    if (isNaN(credit) || credit < 0) {
        throw new Error('Invalid credit value');
    }

    let retries = process.env.DB_RETRIES || 3; // Number of retries
    let success = false;

    while (retries > 0 && !success) {
        try {
            // Find the user's account and update the credit
            const account = await Account.findOne({ where: { userId: userId } });

            if (!account) {
                throw new Error('Account not found');
            }

            account.credit = credit;
            await account.save();
            success = true; // Mark success if the operation completes without errors
        } catch (error) {
            if (error.name === 'SequelizeConnectionError' && retries > 0) {
                console.error('Connection error occurred. Retrying...');
                retries--;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
            } else {
                // Handle other errors or if all retries are exhausted
                throw error;
            }
        }
    }

    if (!success) {
        throw new Error('Failed to update credit after multiple retries');
    }
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
