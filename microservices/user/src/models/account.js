const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Account = sequelize.define('Account', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    credit: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Account;
