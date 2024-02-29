const { validationResult } = require('express-validator');
const userService = require('../services/userService');

// Controller to update user's credit
const updateCredit = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { credit } = req.body;
        const userId = req.user.id; // Assuming userId is available in the request

        await userService.updateCredit(userId, credit);

        return res.status(200).json({ message: 'Credit updated successfully' });
    } catch (error) {
        console.error('Error updating credit:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller to get user's credit
const getCredit = async (req, res) => {
    try {
        const userId = req.params.userId;
        const credit = await userService.getCredit(userId);

        return res.status(200).json({ credit });
    } catch (error) {
        console.error('Error fetching credit:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { updateCredit, getCredit };
