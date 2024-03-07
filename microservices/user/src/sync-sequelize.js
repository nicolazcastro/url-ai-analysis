// src/sync-sequelize.js
const sequelize = require('./sequelize');
const User = require('./models/user');
const Role = require('./models/role'); // Import the Role model
const Account = require('./models/account');

(async () => {
    try {
        // Create the tables
        await sequelize.sync({ force: true });
        console.log('All models were synchronized successfully.');

        // Seed roles
        const [adminRole, userRole] = await Promise.all([
            Role.create({ name: 'admin' }),
            Role.create({ name: 'user' })
        ]);
        console.log('Roles seeded successfully.');

        // Define the associations
        User.belongsToMany(Role, { through: 'UserRole' });
        Role.belongsToMany(User, { through: 'UserRole' });
        User.hasOne(Account); // Add association between User and Account
        Account.belongsTo(User); // Add association between Account and User

        // Seed admin user
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('123456', 10); // Hash the password

        console.log("hashedPassword: " + hashedPassword);
        const adminUser = await User.create({ email: 'nicolazcastro@gmail.com', password: hashedPassword });
        await adminUser.addRole(adminRole); // Assign the admin role to the user
        console.log('Admin user seeded successfully.');

        // Seed admin user's account
        const adminAccount = await Account.create({ userId: adminUser.id, credit: 0 }); // Provide userId when creating the account
        console.log('Admin user account seeded successfully for user id: ' + adminUser.id);
    } catch (error) {
        console.error('An error occurred while synchronizing the models:', error);
    }
})();
