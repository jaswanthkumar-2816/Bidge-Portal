/**
 * HIERO Bridge - Unified Single-Port Gateway
 * Runs Frontend & REST API together on single Port 2410
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2410;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === 1. Mount Backend REST API Endpoints ===
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'HIERO Bridge Unified Gateway',
    version: '3.0.0',
    port: PORT,
    unified: true,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./backend/src/routes/authRoutes'));
app.use('/api/admin', require('./backend/src/routes/adminRoutes'));
app.use('/api/coordinator', require('./backend/src/routes/coordinatorRoutes'));
app.use('/api/student', require('./backend/src/routes/studentRoutes'));
app.use('/api/interview', require('./backend/src/routes/interviewRoutes'));
app.use('/api/connect', require('./backend/src/routes/connectSyncRoutes'));

// === 2. Serve Static Uploads (PDF Resumes, CSVs) ===
app.use('/uploads', express.static(uploadsDir));

// === 3. Serve Frontend Assets (CSS, JS, Assets, Sample CSV) ===
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));

// === 4. Route HTML Entrypoints ===
app.get('/academic-portal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'academic-portal.html'));
});

app.get('/academic-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'academic-portal.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'academic-portal.html'));
});

// Global Error Handler for API
app.use((err, req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    console.error('Gateway API Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
  next(err);
});

// Start Unified Gateway
app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`🌿 HIERO Bridge Unified Gateway is LIVE on Port ${PORT}`);
  console.log(`🚀 Academic Portal : http://localhost:${PORT}/academic-portal.html`);
  console.log(`⚙️  REST API Base   : http://localhost:${PORT}/api`);
  console.log(`📊 API Healthcheck : http://localhost:${PORT}/api/health`);
  console.log(`=================================================================`);
});

module.exports = app;
