const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

router.get('/college', (req, res) => adminController.getCollege(req, res));
router.put('/college', (req, res) => adminController.updateCollege(req, res));
router.post('/departments', (req, res) => adminController.addDepartment(req, res));

router.get('/students', (req, res) => adminController.getStudents(req, res));
router.post('/students', (req, res) => adminController.addStudent(req, res));
router.put('/students/:id', (req, res) => adminController.updateStudent(req, res));
router.delete('/students/:id', (req, res) => adminController.deleteStudent(req, res));

router.post('/students/bulk-import', upload.single('file'), (req, res) => adminController.validateBulkImport(req, res));
router.post('/students/confirm-import', (req, res) => adminController.confirmBulkImport(req, res));

module.exports = router;
