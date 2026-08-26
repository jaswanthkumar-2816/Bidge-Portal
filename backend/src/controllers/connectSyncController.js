/**
 * HIERO Bridge Backend - HIERO Connect Cross-Portal Sync Controller
 */

const db = require('../config/database');

class ConnectSyncController {
  publishOpportunity(req, res) {
    const { company, title, ctc, minCGPA, deadline, requiredSkills, openings, eligibleDepts } = req.body;

    if (!company || !title) {
      return res.status(400).json({ success: false, message: 'Missing company or title' });
    }

    const newOpp = db.addOpportunity({
      company,
      companyLogo: company.slice(0, 2).toUpperCase(),
      industry: 'Technology & Enterprise Cloud',
      title,
      description: `Opportunity published from HIERO Connect for ${title} at ${company}. Requires verified student qualifications and project experience.`,
      location: 'Bengaluru / Hyderabad (Hybrid)',
      workMode: 'Hybrid',
      ctc: ctc || '₹25,00,000 PA',
      minCGPA: minCGPA ? parseFloat(minCGPA) : 8.0,
      eligibleDepts: eligibleDepts || ['CSE', 'AIML', 'IT', 'ECE'],
      academicYear: '2022-2026',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : ['Python', 'SQL']),
      preferredSkills: ['Docker', 'REST API'],
      minProjects: 2,
      openings: openings || 10,
      deadline: deadline || '2026-09-30',
      state: 'NEW',
      recruiter: {
        name: 'HIERO Connect Recruiter',
        email: `recruiting@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '+91-9876543210'
      }
    });

    res.status(201).json({
      success: true,
      message: `Opportunity "${title}" by ${company} published from HIERO Connect to HIERO Bridge!`,
      opportunity: newOpp
    });
  }

  getTransmittedShortlists(req, res) {
    const apps = db.getApplications().filter(a => 
      a.status === 'Sent to Recruiter' || a.status === 'Interview' || a.status === 'Selected' || a.status === 'Rejected'
    );

    const enriched = apps.map(a => ({
      ...a,
      student: db.getStudentById(a.studentId),
      opportunity: db.getOpportunityById(a.oppId)
    }));

    res.json({ success: true, count: enriched.length, candidates: enriched });
  }

  updateCandidateStatus(req, res) {
    const { id } = req.params;
    const { status, notes } = req.body;

    const feedbackMap = {
      'Interview': 'Recruiter Shortlisted: Invited to HIERO AI Mock Interview.',
      'Selected': 'Placement Confirmed: Official Offer Letter Generated via HIERO Connect.',
      'Rejected': 'Recruiter Decision: Not selected for this drive. Routed to HIERO Practice Loop.'
    };

    const updated = db.updateApplication(id, {
      status,
      recruiterFeedback: notes || feedbackMap[status] || `Status updated to ${status}`
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Application record not found' });

    res.json({ success: true, application: updated });
  }
}

module.exports = new ConnectSyncController();
