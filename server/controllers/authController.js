const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, password, role, licenseNumber, vehicleNumber, gender, age, address } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Restrict to one admin
        if (role === 'admin') {
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(400).json({ message: 'Admin already exists. Only one admin allowed.' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            licenseNumber,
            vehicleNumber,
            gender,
            age,
            address,
            isApproved: role === 'traffic_police' ? false : true
        });

        if (user) {
            if (user.role === 'traffic_police') {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    message: 'Registration successful. Account pending admin approval.'
                });
            } else {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isApproved) {
            return res.status(403).json({ message: 'Account pending admin approval' });
        }

        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
