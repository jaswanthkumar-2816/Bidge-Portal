/**
 * HIERO Bridge Backend - Production REST API Server
 * Port: 5050
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for frontend running on port 2410 or local dev
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (PDF resumes, CSVs)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'HIERO Bridge REST API',
    version: '3.0.0',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/coordinator', require('./routes/coordinatorRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/connect', require('./routes/connectSyncRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Backend Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 HIERO Bridge REST API running on http://localhost:${PORT}`);
  console.log(`🌿 Connecting Academia (Bridge) to Industry (Connect)`);
  console.log(`=======================================================`);
});

module.exports = app;
