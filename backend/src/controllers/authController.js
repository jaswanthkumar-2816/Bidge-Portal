/**
 * HIERO Bridge Backend - Auth & Session Controller
 */

const db = require('../config/database');

class AuthController {
  login(req, res) {
    const { role, email } = req.body;

    const personas = {
      admin: {
        role: 'admin',
        name: 'Dr. V. Prasad (Principal/Admin)',
        email: 'principal@college.edu',
        institution: db.getCollege().name
      },
      coordinator: {
        role: 'coordinator',
        name: 'Dr. Ramesh Kulkarni (TPO)',
        email: 'ramesh.tpo@college.edu',
        institution: db.getCollege().name
      },
      student: {
        role: 'student',
        studentId: 'STU-001',
        name: 'Aarav Sharma',
        regNo: '2022CSE045',
        department: 'CSE',
        email: 'aarav.sharma@college.edu'
      }
    };

    const user = personas[role] || personas['coordinator'];
    res.json({
      success: true,
      token: 'jwt_mock_' + Buffer.from(JSON.stringify(user)).toString('base64'),
      user
    });
  }

  getCurrentUser(req, res) {
    res.json({
      success: true,
      college: db.getCollege()
    });
  }
}

module.exports = new AuthController();
