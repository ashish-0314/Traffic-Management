const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Report a new incident
// @route   POST /api/incidents
// @access  Private
const imagekit = require('../config/imagekit');


const createIncident = async (req, res) => {
    let { type, location, description } = req.body;

    // Parse location if string
    if (typeof location === 'string') {
        try {
            location = JSON.parse(location);
        } catch (e) {
            console.error('Failed to parse location:', e);
        }
    }

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
            location, // Already parsed
            description,
            vehiclePlate: req.body.vehiclePlate,
            mediaUrl,
            reportedBy: req.user._id,
        });

        const createdIncident = await incident.save();

        // Notify users about Accidents (Location-based filtering)
        if (type === 'Accident' && location && location.lat && location.lng) {
            const allUsers = await User.find({ _id: { $ne: req.user._id } }); // Exclude reporter

            // Haversine formula to calculate distance in km
            const calculateDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371; // Radius of the earth in km
                const dLat = (lat2 - lat1) * (Math.PI / 180);
                const dLon = (lon2 - lon1) * (Math.PI / 180);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c; // Distance in km
                return d;
            };

            const NOTIFICATION_RADIUS_KM = 20;

            const notifications = allUsers
                .filter(user => {
                    if (user.location && user.location.lat && user.location.lng) {
                        const distance = calculateDistance(
                            location.lat,
                            location.lng,
                            user.location.lat,
                            user.location.lng
                        );
                        return distance <= NOTIFICATION_RADIUS_KM;
                    }
                    return false; // Skip users without location
                })
                .map(user => ({
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
