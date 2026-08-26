const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');

router.get('/profile/:id', (req, res) => studentController.getProfile(req, res));
router.get('/drives', (req, res) => studentController.getAvailableDrives(req, res));
router.post('/apply', upload.single('resume'), (req, res) => studentController.apply(req, res));
router.get('/applications/:studentId', (req, res) => studentController.getMyApplications(req, res));

module.exports = router;
