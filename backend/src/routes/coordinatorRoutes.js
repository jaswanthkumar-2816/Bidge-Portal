const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');

router.get('/metrics', (req, res) => coordinatorController.getMetrics(req, res));
router.get('/opportunities', (req, res) => coordinatorController.getOpportunities(req, res));
router.get('/opportunities/:id', (req, res) => coordinatorController.getOpportunityDetails(req, res));
router.patch('/opportunities/:id/state', (req, res) => coordinatorController.updateOpportunityState(req, res));

router.post('/opportunities/:id/screen', (req, res) => coordinatorController.screenCandidates(req, res));
router.post('/opportunities/:id/shortlist', (req, res) => coordinatorController.transmitShortlist(req, res));

module.exports = router;
