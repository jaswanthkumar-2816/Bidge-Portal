/**
 * HIERO BRIDGE - HIERO Connect Ecosystem Sync Simulator
 * Simulates Recruiter publishing opportunities from HIERO Connect, receiving shortlisted candidates,
 * and dispatching candidate feedback back into Bridge and Student timelines.
 */

window.connectSyncModule = (function () {
  function init() {
    // Simulator initialized
  }

  function openConnectSyncModal() {
    renderSyncModal();
  }

  function renderSyncModal() {
    const opps = window.bridgeStore.getOpportunities();
    const apps = window.bridgeStore.getApplications();
    const transmittedCandidates = apps.filter(a => a.status === 'Sent to Recruiter' || a.status === 'Interview' || a.status === 'Selected' || a.status === 'Rejected');

    const modalHtml = `
      <div class="modal-backdrop open" id="connect-sync-modal">
        <div class="modal-content" style="max-width: 860px; background: #0c0c18; border-color: var(--secondary);">
          <button class="modal-close" onclick="connectSyncModule.closeModal('connect-sync-modal')">✕</button>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
            <div>
              <span class="eco-pill" style="margin-bottom: 0.35rem; display: inline-flex;">🌐 HIERO Connect Simulator</span>
              <h2 style="font-size: 1.5rem; font-weight: 800;">Industry Recruiter Ecosystem Terminal</h2>
            </div>
            <span class="badge badge-recruiter">Cross-Portal Gateway</span>
          </div>

          <!-- Section 1: Publish New Opportunity from HIERO Connect (Req 7) -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff;">1. Recruiter Creates Opportunity in HIERO Connect</h4>
              <span style="font-size: 0.75rem; color: var(--text-dim);">Pushes directly to HIERO Bridge & HIERO</span>
            </div>

            <form onsubmit="connectSyncModule.publishNewOpportunity(event)">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Company Name</label>
                  <input type="text" id="rec-company" class="form-control" placeholder="e.g. Google, Apple, Nvidia" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Job / Internship Role</label>
                  <input type="text" id="rec-title" class="form-control" placeholder="e.g. Graduate Software Engineer" required>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">CTC / Compensation</label>
                  <input type="text" id="rec-ctc" class="form-control" placeholder="₹28,00,000 PA" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Minimum CGPA</label>
                  <input type="number" step="0.1" min="6.0" max="10.0" id="rec-mincgpa" class="form-control" placeholder="8.0" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Application Deadline</label>
                  <input type="date" id="rec-deadline" class="form-control" value="2026-09-30" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Required Skills (comma-separated)</label>
                <input type="text" id="rec-skills" class="form-control" placeholder="Python, SQL, Distributed Systems, Docker" required>
              </div>

              <div style="display: flex; justify-content: flex-end;">
                <button type="submit" class="btn btn-accent btn-sm">
                  🚀 Publish to HIERO Bridge
                </button>
              </div>
            </form>
          </div>

          <!-- Section 2: Review Shortlisted Candidates & Provide Recruiter Feedback (Req 17 & 18) -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff;">
                2. Recruiter Shortlist Inbox & Feedback (${transmittedCandidates.length} Received)
              </h4>
              <span style="font-size: 0.75rem; color: var(--text-dim);">Transmitted from College Placement Coordinators</span>
            </div>

            <div style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md);">
              ${renderTransmittedCandidatesList(transmittedCandidates)}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">
            <button class="btn btn-primary" onclick="connectSyncModule.closeModal('connect-sync-modal')">Close Simulator</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function renderTransmittedCandidatesList(transmitted) {
    if (!transmitted || transmitted.length === 0) {
      return `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-dim); font-size: 0.85rem;">
          No candidates have been shortlisted and transmitted by the Placement Coordinator yet.<br>
          Use the <strong>"Filter & Shortlist"</strong> screen in the Placement Coordinator view to send candidates here.
        </div>
      `;
    }

    return `
      <table class="custom-table" style="font-size: 0.85rem;">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Opportunity</th>
            <th>Verified CGPA</th>
            <th>Coordinator Notes</th>
            <th>Status</th>
            <th style="text-align: right;">Recruiter Decision</th>
          </tr>
        </thead>
        <tbody>
          ${transmitted.map(app => {
            const student = window.bridgeStore.getStudentById(app.studentId);
            const opp = window.bridgeStore.getOpportunityById(app.oppId);
            if (!student || !opp) return '';

            return `
              <tr>
                <td>
                  <strong>${student.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">${student.regNo} • ${student.department}</div>
                </td>
                <td>
                  <strong style="color: var(--secondary);">${opp.company}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">${opp.title}</div>
                </td>
                <td><strong style="color: var(--success);">${student.cgpa.toFixed(2)}</strong></td>
                <td style="font-size: 0.75rem; color: var(--text-muted); max-width: 180px;">${app.coordinatorNotes || 'Verified'}</td>
                <td>
                  <span class="badge ${app.status === 'Selected' ? 'badge-selected' : (app.status === 'Interview' ? 'badge-interview' : 'badge-recruiter')}">${app.status}</span>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; justify-content: flex-end; gap: 6px;">
                    <button class="btn btn-secondary btn-sm" onclick="connectSyncModule.updateCandidateFeedback('${app.id}', 'Interview')" title="Invite to AI Interview">
                      🎙️ Interview
                    </button>
                    <button class="btn btn-success btn-sm" onclick="connectSyncModule.updateCandidateFeedback('${app.id}', 'Selected')" title="Select & Offer">
                      ✓ Offer
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="connectSyncModule.updateCandidateFeedback('${app.id}', 'Rejected')" title="Reject & Route to HIERO Practice">
                      ✕ Reject
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function publishNewOpportunity(e) {
    e.preventDefault();
    const company = document.getElementById('rec-company').value.trim();
    const title = document.getElementById('rec-title').value.trim();
    const ctc = document.getElementById('rec-ctc').value.trim();
    const minCGPA = parseFloat(document.getElementById('rec-mincgpa').value);
    const deadline = document.getElementById('rec-deadline').value;
    const skills = document.getElementById('rec-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    const newOpp = window.bridgeStore.addOpportunity({
      company,
      companyLogo: company.slice(0, 2).toUpperCase(),
      industry: 'Technology & Cloud Solutions',
      title,
      description: `Opportunity published from HIERO Connect for ${title} at ${company}. Requires robust fundamental knowledge, problem solving, and project experience.`,
      location: 'Bengaluru / Hyderabad (Hybrid)',
      workMode: 'Hybrid',
      ctc,
      minCGPA,
      eligibleDepts: ['CSE', 'AIML', 'IT', 'ECE'],
      academicYear: '2022-2026',
      requiredSkills: skills,
      preferredSkills: ['Git', 'Docker', 'REST API'],
      minProjects: 2,
      openings: 10,
      deadline,
      state: 'NEW',
      recruiter: {
        name: 'HIERO Connect Recruiter',
        email: `recruiting@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: '+91-9876543210'
      }
    });

    closeModal('connect-sync-modal');
    window.app.showToast(`Opportunity "${title}" by ${company} received in HIERO Bridge under NEW!`, 'success');
    window.coordinatorModule.renderCoordinatorDashboard();
  }

  function updateCandidateFeedback(appId, newStatus) {
    const feedbackMap = {
      'Interview': 'Recruiter Shortlisted: Invited to HIERO AI Mock Interview.',
      'Selected': 'Placement Confirmed: Official Offer Letter Generated via HIERO Connect.',
      'Rejected': 'Recruiter Decision: Not selected for this drive. Routed to HIERO Practice Loop.'
    };

    window.bridgeStore.updateApplicationStatus(appId, newStatus, {
      recruiterFeedback: feedbackMap[newStatus]
    });

    window.app.showToast(`Candidate status updated to "${newStatus}" across Bridge & Student portal.`, 'success');
    renderSyncModal();
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    init,
    openConnectSyncModal,
    publishNewOpportunity,
    updateCandidateFeedback,
    closeModal
  };
})();
