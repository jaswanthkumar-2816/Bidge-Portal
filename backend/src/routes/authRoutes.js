const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', (req, res) => authController.getCurrentUser(req, res));

module.exports = router;
