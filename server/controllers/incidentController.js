const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Report a new incident
// @route   POST /api/incidents
// @access  Private
const imagekit = require('../config/imagekit');
const fs = require('fs');
const path = require('path');

// Helper to log errors to file
const logError = (err) => {
    const logPath = path.join(__dirname, '../incident_errors.log');
    const msg = `[${new Date().toISOString()}] ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(logPath, msg);
};

const createIncident = async (req, res) => {
    const { type, location, description } = req.body;
    let mediaUrl = req.body.mediaUrl;

    try {
        if (req.file) {
            try {
                // Convert buffer to base64 as SDK requires it or URL
                const fileBase64 = req.file.buffer.toString('base64');

                const uploadResponse = await imagekit.upload({
                    file: fileBase64, // required
                    fileName: `incident-${Date.now()}-${req.file.originalname}`, // required
                    folder: '/incidents',
                });
                mediaUrl = uploadResponse.url;
            } catch (uploadError) {
                console.error('ImageKit Upload Failed:', uploadError);
                logError(uploadError);
                return res.status(500).json({ message: 'Failed to upload image. Please try again or report without image.' });
            }
        }

        const incident = new Incident({
            type,
            location: typeof location === 'string' ? JSON.parse(location) : location,
            description,
            vehiclePlate: req.body.vehiclePlate,
            mediaUrl,
            reportedBy: req.user._id,
        });

        const createdIncident = await incident.save();

        // Notify users about Accidents (Broadcasting to all users for now)
        if (type === 'Accident') {
            const allUsers = await User.find({ _id: { $ne: req.user._id } }); // Exclude reporter
            const notifications = allUsers.map(user => ({
                user: user._id,
                type: 'INCIDENT',
                message: `Alert: An accident has been reported at ${location.address || 'a nearby location'}. Drive carefully!`,
                referenceId: createdIncident._id
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json(createdIncident);
    } catch (error) {
        console.error('Create Incident Error:', error);
        logError(error);
        res.status(500).json({ message: 'Failed to report incident', error: error.message });
    }
};

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Public (or Private based on filter)
const getIncidents = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {}; // Allow filtering by status (e.g., only Verified for maps)

        // Also support bbox filtering for map efficiency later

        const incidents = await Incident.find(filter).populate('reportedBy', 'name email').sort({ createdAt: -1 });
        res.json(incidents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch incidents' });
    }
};

// @desc    Update incident status (Admin/Police)
// @route   PATCH /api/incidents/:id/status
// @access  Private/Admin/Police
const updateIncidentStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        const incident = await Incident.findById(id);

        if (incident) {
            incident.status = status;
            const updatedIncident = await incident.save();
            res.json(updatedIncident);
        } else {
            res.status(404).json({ message: 'Incident not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update incident' });
    }
};

// @desc    Get incident statistics
// @route   GET /api/incidents/stats
// @access  Private/Admin/Police
const getIncidentStats = async (req, res) => {
    try {
        const stats = await Incident.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
};

module.exports = { createIncident, getIncidents, updateIncidentStatus, getIncidentStats };
