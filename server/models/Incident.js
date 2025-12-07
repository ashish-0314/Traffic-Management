const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Accident', 'Crime', 'Speeding', 'RedLightViolation', 'Congestion', 'Other'],
        required: true,
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: String,
    },
    description: {
        type: String,
        required: true,
    },
    mediaUrl: {
        type: String, // URL to image/video
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected', 'Resolved'],
        default: 'Pending',
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
