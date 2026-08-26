const express = require('express');
const router = express.Router();
const connectSyncController = require('../controllers/connectSyncController');

router.post('/opportunities/publish', (req, res) => connectSyncController.publishOpportunity(req, res));
router.get('/shortlists', (req, res) => connectSyncController.getTransmittedShortlists(req, res));
router.patch('/applications/:id/status', (req, res) => connectSyncController.updateCandidateStatus(req, res));

module.exports = router;
