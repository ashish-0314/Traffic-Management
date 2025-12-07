const Incident = require('../models/Incident');

// @desc    Report a new incident
// @route   POST /api/incidents
// @access  Private
const createIncident = async (req, res) => {
    const { type, location, description, mediaUrl } = req.body;

    try {
        const incident = new Incident({
            type,
            location,
            description,
            mediaUrl,
            reportedBy: req.user._id, // Assumes auth middleware populates req.user
        });

        const createdIncident = await incident.save();
        res.status(201).json(createdIncident);
    } catch (error) {
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

        const incidents = await Incident.find(filter).populate('reportedBy', 'name');
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
