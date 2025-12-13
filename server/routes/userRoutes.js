const express = require('express');
const router = express.Router();
const { protect, admin, adminOrPolice } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, updateUserPassword, getAllUsers } = require('../controllers/userController');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, adminOrPolice, getAllUsers);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile);

router.route('/profile/password')
    .put(protect, updateUserPassword);

module.exports = router;
