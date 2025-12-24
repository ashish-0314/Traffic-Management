const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'traffic_police'],
        default: 'user',
        index: true,
    },
    licenseNumber: {
        type: String,
    },
    vehicleNumber: {
        type: String,
        unique: true,
        sparse: true,
    },

    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
        default: ''
    },
    age: {
        type: Number,
    },
    address: {
        type: String,
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: String
    },
    profilePicture: {
        type: String, // URL
        default: ''
    },
    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
