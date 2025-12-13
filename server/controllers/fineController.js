const Fine = require('../models/Fine');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Issue a fine (Traffic Police only)
// @route   POST /api/fines
// @access  Private/TrafficPolice
const issueFine = async (req, res) => {
    const { email, vehicleNumber, amount, reason } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (vehicleNumber) {
            user = await User.findOne({ vehicleNumber });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found (check email or vehicle number)' });
        }

        const fine = await Fine.create({
            user: user._id,
            amount,
            reason,
            issuedBy: req.user._id
        });

        // Create Notification
        await Notification.create({
            user: user._id,
            type: 'FINE',
            message: `You have received a new traffic fine of ₹${amount} for ${reason}.`,
            referenceId: fine._id
        });

        res.status(201).json(fine);
    } catch (error) {
        res.status(500).json({ message: 'Failed to issue fine', error: error.message });
    }
};

// @desc    Get my fines (User)
// @route   GET /api/fines/myfines
// @access  Private
const getMyFines = async (req, res) => {
    try {
        const fines = await Fine.find({ user: req.user._id }).sort({ date: -1 });
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch fines' });
    }
};

// @desc    Pay a fine
// @route   PATCH /api/fines/:id/pay
// @access  Private
const payFine = async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.id);

        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        // Ensure the fine belongs to the user trying to pay
        if (fine.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (fine.status === 'Paid') {
            return res.status(400).json({ message: 'Fine is already paid' });
        }

        fine.status = 'Paid';
        const updatedFine = await fine.save();
        res.json(updatedFine);
    } catch (error) {
        res.status(500).json({ message: 'Failed to pay fine' });
    }
};

// @desc    Get all fines (Admin/Police)
// @route   GET /api/fines
// @access  Private/Admin/Police
const getAllFines = async (req, res) => {
    try {
        const fines = await Fine.find({})
            .populate('user', 'name email licenseNumber')
            .populate('issuedBy', 'name')
            .sort({ date: -1 });
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all fines' });
    }
};

// @desc    Get fine statistics (Total Collected)
// @route   GET /api/fines/stats
// @access  Private/Admin/Police
const getFineStats = async (req, res) => {
    try {
        const stats = await Fine.aggregate([
            { $match: { status: 'Paid' } },
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: '$amount' }
                }
            }
        ]);

        const totalCollected = stats.length > 0 ? stats[0].totalCollected : 0;
        res.json({ totalCollected });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch fine statistics' });
    }
};

module.exports = { issueFine, getMyFines, payFine, getAllFines, getFineStats };
