const express = require('express');
const { getTrafficIncidents, getTrafficFlow } = require('../controllers/trafficController');

const router = express.Router();

router.get('/incidents', getTrafficIncidents);
router.get('/flow', getTrafficFlow);

module.exports = router;
