const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const bcrypt = require('bcrypt');

const Role = require('./role');
const Account = require('./account');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

User.belongsToMany(Role, { through: 'UserRole' });
Role.belongsToMany(User, { through: 'UserRole' });
User.hasOne(Account, {
    foreignKey: {
        name: 'userId',
        allowNull: false,
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION'
    }
});

module.exports = User;
