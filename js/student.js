/**
 * HIERO BRIDGE - Final-Year Student Module
 * Handles Opportunity Discovery, Pre-filled Application Workflow, Eligibility Verification,
 * Application Tracking Timeline, and HIERO AI Practice Triggers.
 */

window.studentModule = (function () {
  let currentStudentId = 'STU-001'; // Default: Aarav Sharma
  let activeApplyOppId = null;
  let applicationStep = 1;

  function init() {
    renderStudentDashboard();
  }

  function setStudent(studentId) {
    currentStudentId = studentId;
    if (window.bridgeStore && typeof window.bridgeStore.setActiveStudent === 'function') {
      window.bridgeStore.setActiveStudent(studentId);
    }
    if (window.app && typeof window.app.updateHeaderUserBadge === 'function') {
      window.app.updateHeaderUserBadge('student');
    }
    renderStudentDashboard();
  }

  function renderStudentDashboard() {
    const container = document.getElementById('student-view-container');
    if (!container) return;

    const student = window.bridgeStore.getStudentById(currentStudentId) || window.bridgeStore.getStudents()[0];
    if (!student) return;

    const allStudents = window.bridgeStore.getStudents();
    const opps = window.bridgeStore.getOpportunities();
    const myApps = window.bridgeStore.getApplicationsByStudent(student.id);

    container.innerHTML = `
      <div class="page-container">
        <!-- Student Header & Switcher -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Final-Year Talent Gateway</h1>
            <p class="page-subtitle">Verified industry placement pipeline for collegiate graduating candidates</p>
          </div>

          <!-- Quick Test Profile Switcher -->
          <div style="display: flex; align-items: center; gap: 10px; background: var(--bg-card); padding: 0.5rem 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border);">
            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Switch Profile:</span>
            <select class="form-control" style="width: auto; padding: 0.35rem 0.75rem; font-size: 0.85rem;" onchange="studentModule.setStudent(this.value)">
              ${allStudents.map(s => `
                <option value="${s.id}" ${s.id === student.id ? 'selected' : ''}>
                  ${s.name} (${s.department} • CGPA ${s.cgpa.toFixed(2)})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Student Profile Overview Card (Req 22) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-active); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 2.5rem; position: relative; overflow: hidden;">
          <div style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.03; font-weight: 900; pointer-events: none;">HIERO</div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div class="avatar" style="width: 64px; height: 64px; font-size: 1.5rem; border: 2px solid var(--primary);">${student.avatar || 'ST'}</div>
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h2 style="font-size: 1.5rem; font-weight: 800;">${student.name}</h2>
                  <span class="badge badge-open">✓ ${student.verificationStatus}</span>
                  <span class="badge ${student.placementStatus === 'Placed' ? 'badge-selected' : 'badge-new'}">${student.placementStatus}</span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 3px;">
                  ${student.regNo} • ${student.department} (${student.academicYear}) • ${student.email}
                </div>
              </div>
            </div>

            <!-- Profile Summary Metrics -->
            <div style="display: flex; gap: 2rem;">
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Verified CGPA</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: var(--success);">${student.cgpa.toFixed(2)}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Projects</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: #fff;">${student.projectCount || student.projects?.length || 0}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Applications</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary-light);">${myApps.length}</div>
              </div>
            </div>
          </div>

          <!-- Skills tags -->
          <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Verified Competencies:</span>
              ${student.skills.map(sk => `<span class="skill-pill matched">${sk}</span>`).join('')}
            </div>
            <a href="${student.resumeUrl}" target="_blank" class="btn btn-secondary btn-sm" onclick="event.preventDefault(); window.app.showToast('Accessing college verified master resume', 'info');">
              📄 Master Resume
            </a>
          </div>
        </div>

        <!-- Section 1: My Submitted Applications Timeline (Req 12) -->
        <div style="margin-bottom: 3rem;">
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">My Active Placement Pipeline</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Track real-time status updates across college screening, recruiter review, and AI interviews.
          </p>

          ${renderMyApplicationsTimeline(myApps, student)}
        </div>

        <!-- Section 2: Available Industry Opportunities & Eligibility (Req 26) -->
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">Campus Placement Drives</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Explore verified opportunities received from HIERO Connect. Eligibility is automatically computed based on institutional records.
          </p>

          ${renderAvailableOpportunities(opps, student, myApps)}
        </div>
      </div>
    `;
  }

  function renderMyApplicationsTimeline(myApps, student) {
    if (!myApps || myApps.length === 0) {
      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.9rem;">You haven't submitted any applications yet. Explore the eligible drives below!</p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${myApps.map(app => {
          const opp = window.bridgeStore.getOpportunityById(app.oppId);
          if (!opp) return '';

          // Timeline steps: Applied -> Under Review -> Shortlisted -> Sent to Recruiter -> Interview -> Selected
          const steps = [
            { id: 'Applied', label: 'Submitted' },
            { id: 'Under Review', label: 'College Screening' },
            { id: 'Shortlisted', label: 'Shortlisted' },
            { id: 'Sent to Recruiter', label: 'In HIERO Connect' },
            { id: 'Interview', label: 'AI Voice Interview' },
            { id: 'Selected', label: 'Placement Offer' }
          ];

          const statusOrder = ['Applied', 'Under Review', 'Shortlisted', 'Sent to Recruiter', 'Interview', 'Selected'];
          const currentIndex = statusOrder.indexOf(app.status);

          return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-active); border-radius: var(--radius-lg); padding: 1.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                  <span class="opp-company">${opp.company}</span>
                  <h4 style="font-size: 1.25rem; font-weight: 700; color: #fff;">${opp.title}</h4>
                  <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 2px;">
                    Applied on: ${new Date(app.appliedAt).toLocaleDateString()} • Application ID: <span style="color: var(--primary-light);">${app.id}</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="badge ${app.status === 'Selected' ? 'badge-selected' : 'badge-open'}">${app.status}</span>
                  ${app.status === 'Interview' ? `
                    <button class="btn btn-accent btn-sm" onclick="studentModule.startAIInterview('${app.id}', '${opp.id}')">
                      🎙️ Launch AI Mock Interview
                    </button>
                  ` : ''}
                  ${app.interviewResult ? `
                    <button class="btn btn-secondary btn-sm" onclick="studentModule.viewInterviewReport('${app.id}')">
                      📊 View Scorecard (${app.interviewResult.overallScore}/100)
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Visual 6-Step Timeline Tracker -->
              <div class="timeline-tracker">
                ${steps.map((step, idx) => {
                  let stepClass = '';
                  if (currentIndex > idx) stepClass = 'completed';
                  else if (currentIndex === idx) stepClass = 'current';

                  return `
                    <div class="timeline-step ${stepClass}">
                      <div class="step-circle">${idx + 1}</div>
                      <div class="step-label">${step.label}</div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Recruiter / Coordinator Feedback Box if available -->
              ${app.coordinatorNotes || app.recruiterFeedback ? `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem 1rem; font-size: 0.8rem; margin-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <strong style="color: #fff;">Placement Updates:</strong> 
                    <span style="color: var(--text-muted);">${app.recruiterFeedback || app.coordinatorNotes}</span>
                  </div>
                  ${app.status === 'Rejected' ? `
                    <button class="btn btn-danger btn-sm" onclick="studentModule.openPracticeLoop('${app.id}')">
                      ⚡ AI Personalized Practice Drill
                    </button>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderAvailableOpportunities(opps, student, myApps) {
    const appliedOppIds = new Set(myApps.map(a => a.oppId));

    return `
      <div class="opp-grid">
        ${opps.map(opp => {
          const isApplied = appliedOppIds.has(opp.id);

          // Compute Eligibility
          const meetsCGPA = student.cgpa >= opp.minCGPA;
          const meetsDept = opp.eligibleDepts.includes(student.department);
          const isEligible = meetsCGPA && meetsDept;

          let eligibilityReason = '';
          if (!meetsCGPA) eligibilityReason = `Requires CGPA ≥ ${opp.minCGPA.toFixed(2)} (Yours: ${student.cgpa.toFixed(2)})`;
          else if (!meetsDept) eligibilityReason = `Eligible: ${opp.eligibleDepts.join('/')} (Yours: ${student.department})`;

          return `
            <div class="opp-card">
              <div>
                <div class="opp-card-header">
                  <div>
                    <span class="opp-company">${opp.company}</span>
                    <h4 class="opp-title">${opp.title}</h4>
                    <div class="opp-meta">
                      <span>📍 ${opp.location}</span>
                      <span>💼 ${opp.workMode}</span>
                    </div>
                  </div>
                  <div>
                    ${isApplied ? '<span class="badge badge-open">Applied</span>' : (isEligible ? '<span class="badge badge-open">✓ Eligible</span>' : '<span class="badge badge-rejected">✕ Ineligible</span>')}
                  </div>
                </div>

                <div class="opp-criteria-box">
                  <div class="criteria-item">
                    <span>Min CGPA</span>
                    <strong style="color: ${meetsCGPA ? 'var(--success)' : 'var(--danger)'};">≥ ${opp.minCGPA.toFixed(2)}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>Depts</span>
                    <strong style="color: ${meetsDept ? 'var(--success)' : 'var(--danger)'};">${opp.eligibleDepts.join(', ')}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>CTC</span>
                    <strong>${opp.ctc}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>Deadline</span>
                    <strong style="color: var(--warning);">${opp.deadline}</strong>
                  </div>
                </div>

                <div class="skills-pill-wrap">
                  ${opp.requiredSkills.map(sk => {
                    const hasSkill = student.skills.some(s => s.toLowerCase().includes(sk.toLowerCase()));
                    return `<span class="skill-pill ${hasSkill ? 'matched' : ''}">${sk}</span>`;
                  }).join('')}
                </div>
              </div>

              <div class="opp-card-footer">
                <div style="font-size: 0.75rem; color: var(--text-dim);">
                  ${!isEligible ? `<span style="color: #f87171;">${eligibilityReason}</span>` : 'Pre-verified by College'}
                </div>

                <div>
                  ${isApplied ? `
                    <button class="btn btn-secondary btn-sm" disabled>✓ Application Submitted</button>
                  ` : (isEligible ? `
                    <button class="btn btn-primary btn-sm" onclick="studentModule.openApplyModal('${opp.id}')">
                      Apply Now →
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" disabled title="${eligibilityReason}">
                      Not Eligible
                    </button>
                  `)}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // === 5-Step Application Modal Flow (Req 11) ===
  function openApplyModal(oppId) {
    activeApplyOppId = oppId;
    applicationStep = 1;
    renderApplyModal();
  }

  function renderApplyModal() {
    const opp = window.bridgeStore.getOpportunityById(activeApplyOppId);
    const student = window.bridgeStore.getStudentById(currentStudentId);
    if (!opp || !student) return;

    let stepContent = '';

    if (applicationStep === 1) {
      stepContent = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Step 1: Role Overview & Job Specifications</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
            ${opp.description}
          </p>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem;">
            <div><span style="color: var(--text-dim);">Position:</span> <strong>${opp.title}</strong></div>
            <div><span style="color: var(--text-dim);">Location:</span> <strong>${opp.location}</strong></div>
            <div><span style="color: var(--text-dim);">Stipend/CTC:</span> <strong style="color: var(--success);">${opp.ctc}</strong></div>
            <div><span style="color: var(--text-dim);">Openings:</span> <strong>${opp.openings} Positions</strong></div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary" onclick="studentModule.closeModal('apply-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="studentModule.setStep(2)">Proceed to Step 2 →</button>
        </div>
      `;
    } else if (applicationStep === 2) {
      stepContent = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Step 2: Verified Collegiate Information</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Your academic credentials are pre-verified and locked by the College Administration.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" value="${student.name}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Registration Number</label>
              <input type="text" class="form-control" value="${student.regNo}" readonly>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" value="${student.department}" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Verified CGPA</label>
              <input type="text" class="form-control" value="${student.cgpa.toFixed(2)}" readonly style="color: var(--success); font-weight: 700;">
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button class="btn btn-secondary" onclick="studentModule.setStep(1)">← Back</button>
          <button class="btn btn-primary" onclick="studentModule.setStep(3)">Next: Resume Submission →</button>
        </div>
      `;
    } else if (applicationStep === 3) {
      stepContent = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Step 3: Resume Submission</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Select your verified campus resume or upload a role-targeted version.
          </p>

          <div style="background: rgba(93, 93, 255, 0.05); border: 1px solid var(--border-active); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.5rem;">📄</span>
              <div>
                <strong style="color: #fff;">${student.name.replace(/\s+/g, '_')}_Official_Placement_Resume.pdf</strong>
                <div style="font-size: 0.75rem; color: var(--success);">✓ Verified by College Placement Cell</div>
              </div>
            </div>
            <span class="badge badge-open">Active</span>
          </div>

          <div class="dropzone" style="padding: 1.5rem;" onclick="window.app.showToast('Resume attachment updated with custom version.', 'info')">
            <div style="font-size: 0.85rem; font-weight: 600; color: #fff;">+ Click to upload custom targeted resume (PDF, max 5MB)</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button class="btn btn-secondary" onclick="studentModule.setStep(2)">← Back</button>
          <button class="btn btn-primary" onclick="studentModule.setStep(4)">Next: Projects & Experience →</button>
        </div>
      `;
    } else if (applicationStep === 4) {
      stepContent = `
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">Step 4: Additional Project Evidence & Notes</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Highlight projects matching <strong>${opp.requiredSkills.join(', ')}</strong>.
          </p>

          <div class="form-group">
            <label class="form-label">Featured Projects</label>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(student.projects || []).map(p => `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
                  <strong>${p.title}</strong> <span style="color: var(--text-dim); font-size: 0.75rem;">(${p.tech})</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Note for Placement Coordinator & Recruiter (Optional)</label>
            <textarea id="app-student-notes" class="form-control" rows="2" placeholder="e.g. Completed distributed caching capstone using Go and Redis."></textarea>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button class="btn btn-secondary" onclick="studentModule.setStep(3)">← Back</button>
          <button class="btn btn-primary" onclick="studentModule.setStep(5)">Review & Submit →</button>
        </div>
      `;
    } else if (applicationStep === 5) {
      stepContent = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">
            ✓
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff;">Confirm Application Submission</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 450px; margin: 0.5rem auto 1.5rem;">
            You are submitting your application for <strong>${opp.title}</strong> at <strong>${opp.company}</strong>. Your verified credentials and resume will be reviewed by the Placement Coordinator.
          </p>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; max-width: 450px; margin: 0 auto 1.5rem;">
            <div>• Candidate: <strong>${student.name} (${student.regNo})</strong></div>
            <div>• Verified CGPA: <strong style="color: var(--success);">${student.cgpa.toFixed(2)}</strong></div>
            <div>• Department: <strong>${student.department}</strong></div>
            <div>• Status: <strong>Lock-in on Submission</strong></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px;">
          <button class="btn btn-secondary" onclick="studentModule.setStep(4)">← Back</button>
          <button class="btn btn-accent btn-lg" onclick="studentModule.confirmSubmission()">Confirm & Submit Application</button>
        </div>
      `;
    }

    const modalHtml = `
      <div class="modal-backdrop open" id="apply-modal">
        <div class="modal-content" style="max-width: 600px;">
          <button class="modal-close" onclick="studentModule.closeModal('apply-modal')">✕</button>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
            <div>
              <span class="opp-company">${opp.company}</span>
              <h2 style="font-size: 1.3rem; font-weight: 800;">${opp.title}</h2>
            </div>
            <span class="badge badge-new">Step ${applicationStep} of 5</span>
          </div>

          ${stepContent}
        </div>
      </div>
    `;

    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function setStep(step) {
    applicationStep = step;
    renderApplyModal();
  }

  function confirmSubmission() {
    const opp = window.bridgeStore.getOpportunityById(activeApplyOppId);
    const student = window.bridgeStore.getStudentById(currentStudentId);
    if (!opp || !student) return;

    const notes = document.getElementById('app-student-notes')?.value || '';

    const res = window.bridgeStore.submitApplication({
      oppId: opp.id,
      studentId: student.id,
      resumeUrl: student.resumeUrl,
      notes: notes
    });

    closeModal('apply-modal');

    if (res.success) {
      window.app.showToast(`Application successfully submitted for ${opp.company}!`, 'success');
      renderStudentDashboard();
    } else {
      window.app.showToast(res.message, 'warning');
    }
  }

  function startAIInterview(appId, oppId) {
    window.interviewModule.launchInterview(appId, oppId);
  }

  function viewInterviewReport(appId) {
    window.interviewModule.showScorecard(appId);
  }

  function openPracticeLoop(appId) {
    window.interviewModule.showPracticeHub(appId);
  }

  function openOpportunityDetails(oppId) {
    activeApplyOppId = oppId;
    openApplyModal(oppId);
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    init,
    render: renderStudentDashboard,
    setStudent,
    renderStudentDashboard,
    openApplyModal,
    setStep,
    confirmSubmission,
    startAIInterview,
    viewInterviewReport,
    openPracticeLoop,
    openOpportunityDetails,
    closeModal
  };
})();
