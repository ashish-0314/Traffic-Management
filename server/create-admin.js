const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin already exists:', adminExists.email);
            console.log('You can login with this account.');
            process.exit(0);
        }

        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@traffic.com',
            password: 'adminpassword123',
            role: 'admin',
            licenseNumber: 'ADMIN-001',
            age: 30,
            gender: 'Other',
            address: 'Central Traffic HQ'
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@traffic.com');
        console.log('Password: adminpassword123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
