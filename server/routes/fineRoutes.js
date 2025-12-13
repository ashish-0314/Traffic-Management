const express = require('express');
const { issueFine, getMyFines, payFine, getAllFines, getFineStats } = require('../controllers/fineController');
const { protect, adminOrPolice } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, adminOrPolice, issueFine) // Reusing adminOrPolice for issuing - typically police, but admin ok too
    .get(protect, adminOrPolice, getAllFines);

router.route('/myfines')
    .get(protect, getMyFines);

// @desc    Get fine statistics (Total Collected)
router.route('/stats')
    .get(protect, adminOrPolice, getFineStats); // Using adminOrPolice as logic similar to issuing

router.route('/:id/pay')
    .patch(protect, payFine);

module.exports = router;
