const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const trafficRoutes = require('./routes/trafficRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Traffic Management System API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/incidents', incidentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
