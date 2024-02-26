const db = require('../db');

const registerUser = async (username, password) => {
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await db.query(query, [username, password]);
};

const loginUser = async (username, password) => {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const result = await db.query(query, [username, password]);
    return result[0];
};

const checkUserExistence = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    const result = await db.query(query, [username]);
    return result.length > 0;
};

module.exports = { registerUser, loginUser, checkUserExistence };
