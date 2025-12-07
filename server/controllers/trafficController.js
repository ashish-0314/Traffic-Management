const axios = require('axios');

const getTrafficIncidents = async (req, res) => {
    const { bbox } = req.query; // Bounding box: minLon,minLat,maxLon,maxLat

    if (!bbox) {
        return res.status(400).json({ message: 'Bounding box (bbox) is required' });
    }

    try {
        const apiKey = process.env.TOMTOM_API_KEY;
        const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory}}}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching traffic incidents:', error.message);
        res.status(500).json({ message: 'Failed to fetch traffic data' });
    }
};

const getTrafficFlow = async (req, res) => {
    // Implementation for flow tiles can be direct from frontend or proxied here if needed.
    // For now, we'll focus on incidents as flow is usually a tile layer.
    res.status(501).json({ message: 'Not implemented yet' });
};

module.exports = { getTrafficIncidents, getTrafficFlow };
