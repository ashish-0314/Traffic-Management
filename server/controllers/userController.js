const User = require('../models/User');
const bcrypt = require('bcryptjs');

const imagekit = require('../config/imagekit');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Handle optional fields
            if (req.body.gender !== undefined) user.gender = req.body.gender;
            if (req.body.age !== undefined) user.age = req.body.age ? Number(req.body.age) : undefined;
            if (req.body.address !== undefined) user.address = req.body.address;
            if (req.body.licenseNumber !== undefined) user.licenseNumber = req.body.licenseNumber;

            // Handle location update
            if (req.body.location) {
                try {
                    const parsedLocation = typeof req.body.location === 'string'
                        ? JSON.parse(req.body.location)
                        : req.body.location;

                    if (parsedLocation.lat && parsedLocation.lng) {
                        user.location = {
                            lat: Number(parsedLocation.lat),
                            lng: Number(parsedLocation.lng),
                            address: parsedLocation.address || user.address
                        };
                    }
                } catch (e) {
                    console.error('Location parsing error', e);
                }
            }

            // Sparse unique field handling
            if (req.body.vehicleNumber !== undefined) {
                if (req.body.vehicleNumber.trim() === '') {
                    user.vehicleNumber = undefined;
                } else {
                    user.vehicleNumber = req.body.vehicleNumber;
                }
            }

            // Image Upload Logic
            if (req.file) {
                try {
                    const uploadResponse = await imagekit.upload({
                        file: req.file.buffer, // multer memory storage
                        fileName: `profile_${user._id}_${Date.now()}`,
                        folder: '/traffic_system/profiles'
                    });
                    user.profilePicture = uploadResponse.url;
                } catch (uploadError) {
                    console.error('ImageKit Upload Error:', uploadError);
                    return res.status(500).json({ message: 'Failed to upload profile picture' });
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                gender: updatedUser.gender,
                age: updatedUser.age,
                address: updatedUser.address,
                profilePicture: updatedUser.profilePicture,
                vehicleNumber: updatedUser.vehicleNumber,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile Update Error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `This ${field} is already in use by another account.` });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                    { vehicleNumber: { $regex: req.query.search, $options: 'i' } },
                ],
            }
            : {};

        const filter = req.query.role ? { role: req.query.role } : {};

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const count = await User.countDocuments({ ...keyword, ...filter });
        const users = await User.find({ ...keyword, ...filter })
            .select('-password')
            .limit(limit)
            .skip(skip);

        res.json({
            users,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// @desc    Approve user (Admin only)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isApproved = true;
            await user.save();
            res.json({ message: 'User approved' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve user' });
    }
};

// @desc    Reject user (Admin only)
// @route   PUT /api/users/:id/reject
// @access  Private/Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User rejected and removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject user' });
    }
};

module.exports = { getUserProfile, updateUserProfile, updateUserPassword, getAllUsers, approveUser, rejectUser };
