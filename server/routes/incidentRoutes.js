const express = require('express');
const { createIncident, getIncidents, updateIncidentStatus, getIncidentStats } = require('../controllers/incidentController');
const { protect, adminOrPolice } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createIncident)
  .get(getIncidents);

router.route('/stats')
  .get(protect, adminOrPolice, getIncidentStats);

router.route('/:id/status')
  .patch(protect, adminOrPolice, updateIncidentStatus);

module.exports = router;
