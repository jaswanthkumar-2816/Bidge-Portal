/**
 * HIERO Bridge Backend - Placement Coordinator Controller
 */

const db = require('../config/database');
const filterService = require('../services/filterService');

class CoordinatorController {
  getMetrics(req, res) {
    const students = db.getStudents();
    const opps = db.getOpportunities();
    const apps = db.getApplications();

    res.json({
      success: true,
      metrics: {
        totalStudents: students.length,
        activeJobs: opps.filter(o => o.state !== 'CLOSED').length,
        totalApplicants: apps.length,
        shortlisted: apps.filter(a => a.status === 'Shortlisted' || a.status === 'Sent to Recruiter').length,
        interviews: apps.filter(a => a.status === 'Interview').length,
        selected: apps.filter(a => a.status === 'Selected').length
      }
    });
  }

  getOpportunities(req, res) {
    const { state, search } = req.query;
    let opps = db.getOpportunities();

    if (state && state !== 'ALL') {
      opps = opps.filter(o => o.state === state);
    }
    if (search) {
      const q = search.toLowerCase();
      opps = opps.filter(o => o.company.toLowerCase().includes(q) || o.title.toLowerCase().includes(q));
    }

    res.json({ success: true, count: opps.length, opportunities: opps });
  }

  getOpportunityDetails(req, res) {
    const { id } = req.params;
    const opp = db.getOpportunityById(id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    const apps = db.getApplications().filter(a => a.oppId === id);
    res.json({ success: true, opportunity: opp, applications: apps });
  }

  updateOpportunityState(req, res) {
    const { id } = req.params;
    const { state } = req.body;
    const updated = db.updateOpportunity(id, { state });
    if (!updated) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, opportunity: updated });
  }

  screenCandidates(req, res) {
    const { id } = req.params;
    try {
      const result = filterService.screenCandidates(id, req.body || {});
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  transmitShortlist(req, res) {
    const { id } = req.params;
    const { studentIds, notes } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one student ID to shortlist' });
    }

    const opp = db.getOpportunityById(id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    const selectedStudents = studentIds.map(sid => db.getStudentById(sid)).filter(Boolean);

    // Update or create applications
    selectedStudents.forEach(s => {
      let app = db.getApplications().find(a => a.oppId === id && a.studentId === s.id);
      if (!app) {
        app = db.addApplication({
          oppId: id,
          studentId: s.id,
          resumeUrl: s.resumeUrl,
          notes: notes || 'Shortlisted and transmitted by Placement Coordinator.'
        });
      }
      db.updateApplication(app.id, {
        status: 'Sent to Recruiter',
        coordinatorNotes: notes || 'Transmitted by Placement Coordinator.',
        recruiterFeedback: 'Under Recruiter Review'
      });
    });

    db.updateOpportunity(id, { state: 'SENT_TO_RECRUITER' });

    res.json({
      success: true,
      message: `Package of ${selectedStudents.length} verified candidates transmitted to ${opp.company} in HIERO Connect!`,
      shortlistedCount: selectedStudents.length,
      opportunityState: 'SENT_TO_RECRUITER'
    });
  }
}

module.exports = new CoordinatorController();
