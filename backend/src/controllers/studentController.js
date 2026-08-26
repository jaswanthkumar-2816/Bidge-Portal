/**
 * HIERO Bridge Backend - Student Controller
 */

const db = require('../config/database');

class StudentController {
  getProfile(req, res) {
    const { id } = req.params;
    const student = db.getStudentById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    const applications = db.getApplications().filter(a => a.studentId === student.id);
    res.json({ success: true, student, applications });
  }

  getAvailableDrives(req, res) {
    const { studentId } = req.query;
    const student = db.getStudentById(studentId) || db.getStudents()[0];
    const opps = db.getOpportunities();
    const myApps = db.getApplications().filter(a => a.studentId === student?.id);
    const appliedOppIds = new Set(myApps.map(a => a.oppId));

    const evaluatedOpps = opps.map(opp => {
      const isApplied = appliedOppIds.has(opp.id);
      const meetsCGPA = student ? student.cgpa >= opp.minCGPA : true;
      const meetsDept = student ? opp.eligibleDepts.includes(student.department) : true;
      const isEligible = meetsCGPA && meetsDept;

      return {
        ...opp,
        isApplied,
        isEligible,
        eligibilityReason: !meetsCGPA 
          ? `Requires CGPA ≥ ${opp.minCGPA.toFixed(2)} (Yours: ${student?.cgpa.toFixed(2)})`
          : (!meetsDept ? `Eligible: ${opp.eligibleDepts.join('/')} (Yours: ${student?.department})` : 'Eligible')
      };
    });

    res.json({ success: true, opportunities: evaluatedOpps });
  }

  apply(req, res) {
    const { oppId, studentId, notes } = req.body;
    if (!oppId || !studentId) {
      return res.status(400).json({ success: false, message: 'Missing oppId or studentId' });
    }

    const existing = db.getApplications().find(a => a.oppId === oppId && a.studentId === studentId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied for this drive' });
    }

    let resumeUrl = 'https://hiero.io/resumes/verified-master.pdf';
    if (req.file) {
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    const student = db.getStudentById(studentId);
    if (student && !req.file) {
      resumeUrl = student.resumeUrl;
    }

    const newApp = db.addApplication({
      oppId,
      studentId,
      resumeUrl,
      notes: notes || 'Direct student application via Bridge portal.'
    });

    res.status(201).json({ success: true, application: newApp, message: 'Application submitted successfully' });
  }

  getMyApplications(req, res) {
    const { studentId } = req.params;
    const apps = db.getApplications().filter(a => a.studentId === studentId);
    const enriched = apps.map(app => {
      const opp = db.getOpportunityById(app.oppId);
      return { ...app, opportunity: opp };
    });
    res.json({ success: true, count: enriched.length, applications: enriched });
  }
}

module.exports = new StudentController();
