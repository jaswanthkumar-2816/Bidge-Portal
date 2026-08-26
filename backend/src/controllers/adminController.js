/**
 * HIERO Bridge Backend - College Admin Controller
 */

const db = require('../config/database');
const csvValidator = require('../services/csvValidatorService');
const fs = require('fs');

class AdminController {
  getCollege(req, res) {
    res.json({ success: true, college: db.getCollege() });
  }

  updateCollege(req, res) {
    const updated = db.updateCollege(req.body);
    res.json({ success: true, college: updated });
  }

  addDepartment(req, res) {
    const { id, name } = req.body;
    if (!id || !name) return res.status(400).json({ success: false, message: 'Missing dept id or name' });
    const college = db.getCollege();
    college.departments.push({ id, code: id, name, totalStudents: 0 });
    db.updateCollege({ departments: college.departments });
    res.json({ success: true, departments: college.departments });
  }

  getStudents(req, res) {
    const { dept, status, search } = req.query;
    let students = db.getStudents();

    if (dept && dept !== 'ALL') {
      students = students.filter(s => s.department === dept);
    }
    if (status && status !== 'ALL') {
      students = students.filter(s => s.placementStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.skills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: students.length, students });
  }

  addStudent(req, res) {
    const student = db.addStudent(req.body);
    res.status(201).json({ success: true, student });
  }

  updateStudent(req, res) {
    const { id } = req.params;
    const updated = db.updateStudent(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student: updated });
  }

  deleteStudent(req, res) {
    const { id } = req.params;
    db.deleteStudent(id);
    res.json({ success: true, message: 'Student removed from pool' });
  }

  async validateBulkImport(req, res) {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    try {
      const report = await csvValidator.validateAndParse(req.file.path);
      // Clean up temp file
      fs.unlink(req.file.path, () => {});
      res.json({ success: true, report });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  confirmBulkImport(req, res) {
    const { students } = req.body;
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid students array provided' });
    }

    db.bulkAddStudents(students);
    res.json({ success: true, importedCount: students.length, message: `Successfully added ${students.length} verified students.` });
  }
}

module.exports = new AdminController();
