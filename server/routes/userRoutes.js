const express = require('express');
const router = express.Router();
const { protect, admin, adminOrPolice } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, updateUserPassword, getAllUsers, approveUser, rejectUser } = require('../controllers/userController');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, adminOrPolice, getAllUsers);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile);

router.route('/profile/password')
    .put(protect, updateUserPassword);

router.route('/:id/approve')
    .put(protect, admin, approveUser);

router.route('/:id/reject')
    .put(protect, admin, rejectUser);

module.exports = router;
