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

        // Prevent fining Admin or Traffic Police
        if (user.role === 'admin' || user.role === 'traffic_police') {
            return res.status(400).json({ message: 'Cannot issue fine to Admin or Traffic Police' });
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
// Razorpay Configuration
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
// IMPORTANT: Use environment variables for keys in production
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder'
});

// @desc    Create Razorpay Order
// @route   POST /api/fines/order
// @access  Private
const createPaymentOrder = async (req, res) => {
    const { amount } = req.body;

    // Razorpay expects amount in paise (multiply by 100)
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// @desc    Verify Payment and Mark Fine as Paid
// @route   POST /api/fines/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fineId } = req.body;

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder')
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Payment Verified, Update Fine Status
        try {
            const fine = await Fine.findById(fineId);
            if (!fine) {
                return res.status(404).json({ message: 'Fine not found' });
            }

            if (fine.status === 'Paid') {
                return res.status(400).json({ message: 'Fine is already paid' });
            }

            fine.status = 'Paid';
            fine.paymentId = razorpay_payment_id; // Store payment ref if needed (make sure to add to Schema if strict)
            const updatedFine = await fine.save();

            res.json({ message: 'Payment verified and fine updated', fine: updatedFine });
        } catch (error) {
            res.status(500).json({ message: 'Failed to update fine status' });
        }
    } else {
        res.status(400).json({ message: 'Invalid payment signature' });
    }
};



// @desc    Get all fines (Admin/Police)
// @route   GET /api/fines
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

        const pendingCount = await Fine.countDocuments({ status: 'Unpaid' });

        const totalCollected = stats.length > 0 ? stats[0].totalCollected : 0;
        res.json({ totalCollected, pendingCount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch fine statistics' });
    }
};

module.exports = { issueFine, getMyFines, createPaymentOrder, verifyPayment, getAllFines, getFineStats };
