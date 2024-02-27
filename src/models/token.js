// src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Token = sequelize.define('Token', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Token;
