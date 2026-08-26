const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.get('/questions/:oppId', (req, res) => interviewController.getQuestions(req, res));
router.post('/evaluate', (req, res) => interviewController.evaluateInterview(req, res));

module.exports = router;
