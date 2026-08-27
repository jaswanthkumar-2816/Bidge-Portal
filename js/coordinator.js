/**
 * HIERO BRIDGE - Placement Coordinator Module
 * Handles Opportunity Pipeline, Link Generation, Multi-Criteria Candidate Filtering,
 * Recruiter-Expectation Matching, and Shortlist Dispatch to HIERO Connect.
 */

window.coordinatorModule = (function () {
  let activeTab = 'ALL';
  let selectedOppId = null;
  let selectedCandidateIds = new Set();
  
  // Filter state for candidate screening
  let filterState = {
    minCGPA: 7.0,
    selectedDepts: [],
    requiredSkills: [],
    minProjects: 0,
    status: 'ALL',
    fitOnly: false
  };

  function init() {
    renderCoordinatorDashboard();
  }

  function renderCoordinatorDashboard() {
    const container = document.getElementById('coordinator-view-container');
    if (!container) return;

    const state = window.bridgeStore.state;
    const opps = state.opportunities;
    const apps = state.applications;
    const students = state.students;

    const totalStudents = students.length;
    const activeOpps = opps.filter(o => o.state !== 'CLOSED').length;
    const totalApplicants = apps.length;
    const shortlistedCount = apps.filter(a => a.status === 'Shortlisted' || a.status === 'Sent to Recruiter').length;
    const interviewCount = apps.filter(a => a.status === 'Interview').length;
    const selectedCount = apps.filter(a => a.status === 'Selected').length;

    container.innerHTML = `
      <div class="page-container">
        <!-- Spatial Hero Header -->
        <div class="spatial-hero-banner">
          <div class="hero-tag">ENTERPRISE TALENT CONTROL CENTER</div>
          <h1 class="hero-title">Placement Operations <span>Command Hub</span></h1>
          <p class="hero-desc">
            Orchestrate verified candidate pools, live recruiter-expectation screening filters, and bi-directional candidate pipeline transmission with HIERO Connect.
          </p>
        </div>

        <!-- 3D Interactive Ecosystem Canvas Frame -->
        <div class="spatial-3d-wrapper">
          <div class="spatial-3d-header">
            <div class="spatial-3d-title-block">
              <div class="kpi-icon-box" style="width: 34px; height: 34px;">🌐</div>
              <div>
                <div class="spatial-3d-title">Academia ↔ Talent ↔ Industry 3D Network</div>
                <div class="spatial-3d-sub">Interactive WebGL spatial topology • Hover nodes for live telemetry metrics</div>
              </div>
            </div>
            <div class="spatial-3d-controls">
              <button class="btn-3d-ctrl" onclick="hieroEcosystem3D.toggleRotation()">
                ↻ Toggle Orbit
              </button>
              <button class="btn-3d-ctrl" onclick="app.openEcosystemMapModal()">
                ⛶ Expand Modal
              </button>
            </div>
          </div>
          <div id="dashboard-3d-ecosystem-mount"></div>
        </div>

        <!-- Spatial 4-KPI Metric Grid -->
        <div class="kpi-spatial-grid">
          <div class="kpi-spatial-card">
            <div class="kpi-header-row">
              <div class="kpi-icon-box">👥</div>
              <span class="kpi-badge badge-success">Verified Pool</span>
            </div>
            <div class="kpi-metric-val">${totalStudents}</div>
            <div class="kpi-label">Verified Final-Year Students</div>
            <div class="kpi-subtext">100% Locked & Authenticated by College</div>
            <div class="kpi-micro-bar"><div class="kpi-micro-fill" style="width: 95%;"></div></div>
          </div>

          <div class="kpi-spatial-card">
            <div class="kpi-header-row">
              <div class="kpi-icon-box" style="color: var(--accent-cyan);">🏢</div>
              <span class="kpi-badge badge-info">Active Pipeline</span>
            </div>
            <div class="kpi-metric-val">${activeOpps}</div>
            <div class="kpi-label">Industry Campus Drives</div>
            <div class="kpi-subtext">Synced from HIERO Connect Recruiter Hub</div>
            <div class="kpi-micro-bar"><div class="kpi-micro-fill" style="width: 80%; background: var(--accent-cyan);"></div></div>
          </div>

          <div class="kpi-spatial-card">
            <div class="kpi-header-row">
              <div class="kpi-icon-box" style="color: var(--warning);">⚡</div>
              <span class="kpi-badge badge-warning">Review Ready</span>
            </div>
            <div class="kpi-metric-val" style="color: var(--warning);">${shortlistedCount}</div>
            <div class="kpi-label">Filtered Shortlists</div>
            <div class="kpi-subtext">Passed Recruiter Expectation Thresholds</div>
            <div class="kpi-micro-bar"><div class="kpi-micro-fill" style="width: 70%; background: var(--warning);"></div></div>
          </div>

          <div class="kpi-spatial-card">
            <div class="kpi-header-row">
              <div class="kpi-icon-box" style="color: var(--success);">🏆</div>
              <span class="kpi-badge badge-success">Conversions</span>
            </div>
            <div class="kpi-metric-val" style="color: var(--success);">${selectedCount}</div>
            <div class="kpi-label">Confirmed Placement Offers</div>
            <div class="kpi-subtext">Issued via HIERO Connect Recruiter Stream</div>
            <div class="kpi-micro-bar"><div class="kpi-micro-fill" style="width: 88%;"></div></div>
          </div>
        </div>

        <!-- Opportunity Lifecycle Pipeline Filter Bar -->
        <div class="filter-bar" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div class="pipeline-tabs">
              ${renderPipelineTabs(opps)}
            </div>
            <div class="search-input-wrap" style="width: 280px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" id="opp-search-input" class="form-control" placeholder="Search opportunities..." oninput="coordinatorModule.renderFilteredOpps()">
            </div>
          </div>
        </div>

        <!-- Opportunities Grid / Active Screening View -->
        <div id="opps-view-section">
          ${renderOpportunitiesGrid(opps)}
        </div>
      </div>
    `;

    // Mount Three.js 3D Ecosystem Canvas
    setTimeout(() => {
      if (window.hieroEcosystem3D) {
        hieroEcosystem3D.init('dashboard-3d-ecosystem-mount', { height: 380 });
      }
    }, 50);
  }

  function renderPipelineTabs(opps) {
    const states = [
      { id: 'ALL', label: 'All Opportunities' },
      { id: 'NEW', label: 'New Received' },
      { id: 'APPLICATIONS_OPEN', label: 'Applications Open' },
      { id: 'SHORTLISTING', label: 'Shortlisting' },
      { id: 'SENT_TO_RECRUITER', label: 'Sent to Recruiter' },
      { id: 'INTERVIEW', label: 'Interview' },
      { id: 'CLOSED', label: 'Closed' }
    ];

    return states.map(st => {
      const count = st.id === 'ALL' ? opps.length : opps.filter(o => o.state === st.id).length;
      const isActive = activeTab === st.id;
      return `
        <button class="pipeline-tab ${isActive ? 'active' : ''}" onclick="coordinatorModule.setTab('${st.id}')">
          ${st.label}
          <span class="tab-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  function setTab(tabId) {
    activeTab = tabId;
    renderFilteredOpps();
  }

  function renderFilteredOpps() {
    const opps = window.bridgeStore.getOpportunities();
    const query = (document.getElementById('opp-search-input')?.value || '').toLowerCase().trim();

    const filtered = opps.filter(o => {
      const matchesTab = (activeTab === 'ALL') || (o.state === activeTab);
      const matchesQuery = !query || 
        o.company.toLowerCase().includes(query) ||
        o.title.toLowerCase().includes(query) ||
        o.requiredSkills.some(s => s.toLowerCase().includes(query));
      return matchesTab && matchesQuery;
    });

    const gridContainer = document.getElementById('opps-view-section');
    if (gridContainer) {
      gridContainer.innerHTML = renderOpportunitiesGrid(filtered);
    }
  }

  function renderOpportunitiesGrid(opps) {
    if (!opps || opps.length === 0) {
      return `
        <div style="text-align: center; padding: 4rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border);">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--text-dim); margin-bottom: 1rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">No opportunities in this state</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Opportunities created in HIERO Connect will appear here automatically.</p>
        </div>
      `;
    }

    return `
      <div class="opp-grid">
        ${opps.map(o => {
          const apps = window.bridgeStore.getApplicationsByOpportunity(o.id);
          const shortlisted = apps.filter(a => a.status === 'Shortlisted' || a.status === 'Sent to Recruiter').length;
          
          let stateBadgeClass = 'badge-new';
          if (o.state === 'APPLICATIONS_OPEN') stateBadgeClass = 'badge-open';
          if (o.state === 'SHORTLISTING') stateBadgeClass = 'badge-shortlist';
          if (o.state === 'SENT_TO_RECRUITER') stateBadgeClass = 'badge-recruiter';
          if (o.state === 'INTERVIEW') stateBadgeClass = 'badge-interview';
          if (o.state === 'SELECTION') stateBadgeClass = 'badge-selected';

          return `
            <div class="opp-card">
              <div>
                <div class="opp-card-header">
                  <div>
                    <div class="opp-company">${o.company}</div>
                    <h3 class="opp-title">${o.title}</h3>
                    <div class="opp-meta">
                      <span class="opp-meta-item">📍 ${o.location}</span>
                      <span class="opp-meta-item">💼 ${o.workMode}</span>
                    </div>
                  </div>
                  <span class="badge ${stateBadgeClass}">${o.state.replace(/_/g, ' ')}</span>
                </div>

                <div class="opp-criteria-box">
                  <div class="criteria-item">
                    <span>Min CGPA</span>
                    <strong>≥ ${o.minCGPA.toFixed(2)}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>Eligible Depts</span>
                    <strong>${o.eligibleDepts.join(', ')}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>Compensation</span>
                    <strong>${o.ctc || 'As per norms'}</strong>
                  </div>
                  <div class="criteria-item">
                    <span>Deadline</span>
                    <strong style="color: var(--warning);">${o.deadline}</strong>
                  </div>
                </div>

                <div class="skills-pill-wrap">
                  ${o.requiredSkills.map(sk => `<span class="skill-pill matched"><span style="opacity: 0.7; font-size: 0.62rem; margin-right: 4px; font-weight: 800;">REQ</span>${sk}</span>`).join('')}
                  ${(o.preferredSkills || []).slice(0, 2).map(sk => `<span class="skill-pill"><span style="opacity: 0.7; font-size: 0.62rem; margin-right: 4px; font-weight: 800;">PREF</span>${sk}</span>`).join('')}
                </div>
              </div>

              <div class="opp-card-footer">
                <div class="applicant-stat">
                  <strong>${apps.length}</strong> Applicants • <strong style="color: var(--warning);">${shortlisted}</strong> Shortlisted
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary btn-sm" onclick="coordinatorModule.generateApplicationLink('${o.id}')" title="Generate Shareable Student Link">
                    🔗 Link
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="coordinatorModule.openCandidateScreening('${o.id}')">
                    Filter & Shortlist →
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // === Core Feature: Generate Student Application Link (Req 10) ===
  function generateApplicationLink(oppId) {
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;

    const fullUrl = `${window.location.origin}${window.location.pathname}?view=apply&oppId=${opp.id}`;

    const modalHtml = `
      <div class="modal-backdrop open" id="link-modal">
        <div class="modal-content" style="max-width: 580px; text-align: center;">
          <button class="modal-close" onclick="coordinatorModule.closeModal('link-modal')">✕</button>
          
          <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(93, 93, 255, 0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </div>

          <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.35rem;">Opportunity Application Link Generated</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Share this verified application gateway with eligible final-year students for <strong>${opp.company} - ${opp.title}</strong>
          </p>

          <!-- Eligibility Rules Bound to Link -->
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; text-align: left; margin-bottom: 1.25rem; font-size: 0.8rem;">
            <div style="font-weight: 700; color: #fff; margin-bottom: 0.35rem;">🔒 Enforced Link Eligibility Rules:</div>
            <div>• Minimum CGPA: <strong style="color: var(--success);">${opp.minCGPA.toFixed(2)}</strong></div>
            <div>• Eligible Departments: <strong>${opp.eligibleDepts.join(', ')}</strong></div>
            <div>• Academic Batch: <strong>${opp.academicYear || '2022-2026'}</strong></div>
            <div>• Application Deadline: <strong style="color: var(--warning);">${opp.deadline}</strong></div>
          </div>

          <!-- URL Display Box -->
          <div style="display: flex; gap: 8px; margin-bottom: 1.5rem;">
            <input type="text" id="generated-url-input" class="form-control" value="${fullUrl}" readonly style="font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.4);">
            <button class="btn btn-primary" onclick="coordinatorModule.copyLinkToClipboard()">
              📋 Copy
            </button>
          </div>

          <!-- QR Code Preview Representation -->
          <div style="background: #fff; width: 140px; height: 140px; margin: 0 auto 1.5rem; border-radius: var(--radius-md); padding: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(255,255,255,0.1);">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <rect x="0" y="0" width="30" height="30" fill="#07070c"/>
              <rect x="5" y="5" width="20" height="20" fill="#fff"/>
              <rect x="10" y="10" width="10" height="10" fill="#07070c"/>
              <rect x="70" y="0" width="30" height="30" fill="#07070c"/>
              <rect x="75" y="5" width="20" height="20" fill="#fff"/>
              <rect x="80" y="10" width="10" height="10" fill="#07070c"/>
              <rect x="0" y="70" width="30" height="30" fill="#07070c"/>
              <rect x="5" y="75" width="20" height="20" fill="#fff"/>
              <rect x="10" y="80" width="10" height="10" fill="#07070c"/>
              <rect x="40" y="10" width="10" height="30" fill="#07070c"/>
              <rect x="60" y="40" width="30" height="10" fill="#07070c"/>
              <rect x="35" y="60" width="20" height="20" fill="#07070c"/>
              <rect x="65" y="75" width="25" height="15" fill="#07070c"/>
            </svg>
          </div>

          <div style="display: flex; justify-content: center; gap: 10px;">
            <button class="btn btn-secondary" onclick="coordinatorModule.openStudentPreview('${opp.id}')">
              👤 Open Student View
            </button>
            <button class="btn btn-accent" onclick="coordinatorModule.broadcastToBatch('${opp.id}')">
              📢 Push Notification to Eligible Batch
            </button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function copyLinkToClipboard() {
    const input = document.getElementById('generated-url-input');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      window.app.showToast('Application link copied to clipboard!', 'success');
    }
  }

  function broadcastToBatch(oppId) {
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;
    if (opp.state === 'NEW') {
      window.bridgeStore.updateOpportunityState(oppId, 'APPLICATIONS_OPEN');
    }
    closeModal('link-modal');
    window.app.showToast(`Opportunity broadcasted to all ${opp.eligibleDepts.join('/')} eligible final-year students!`, 'success');
    renderCoordinatorDashboard();
  }

  function openStudentPreview(oppId) {
    closeModal('link-modal');
    window.app.switchRole('student');
    window.studentModule.openOpportunityDetails(oppId);
  }

  // === Core Candidate Screening & Multi-Criteria Filtering Engine (Req 13, 14, 15, 16) ===
  function openCandidateScreening(oppId) {
    selectedOppId = oppId;
    selectedCandidateIds.clear();

    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;

    // Default filter initializations
    filterState.minCGPA = opp.minCGPA;
    filterState.selectedDepts = [...opp.eligibleDepts];
    filterState.requiredSkills = [...opp.requiredSkills];
    filterState.minProjects = opp.minProjects || 1;
    filterState.status = 'ALL';
    filterState.fitOnly = false;

    renderCandidateScreeningScreen(opp);
  }

  function renderCandidateScreeningScreen(opp) {
    const container = document.getElementById('coordinator-view-container');
    if (!container) return;

    const allStudents = window.bridgeStore.getStudents();
    const apps = window.bridgeStore.getApplicationsByOpportunity(opp.id);
    const applicantStudentIds = new Set(apps.map(a => a.studentId));

    // Calculate candidate pool with fit scoring
    const candidateData = allStudents.map(student => {
      const app = apps.find(a => a.studentId === student.id);
      const isApplied = !!app;

      // Fit score computation (Who applied vs Who actually fits)
      let score = 0;
      // 1. CGPA score (30%)
      if (student.cgpa >= opp.minCGPA) score += 30;
      else if (student.cgpa >= opp.minCGPA - 0.5) score += 15;

      // 2. Department eligibility (15%)
      if (opp.eligibleDepts.includes(student.department)) score += 15;

      // 3. Required skills match (40%)
      const reqSkillsMatch = opp.requiredSkills.filter(req => 
        student.skills.some(sk => sk.toLowerCase().includes(req.toLowerCase()))
      );
      score += Math.round((reqSkillsMatch.length / (opp.requiredSkills.length || 1)) * 40);

      // 4. Project depth (15%)
      if ((student.projectCount || student.projects?.length || 0) >= (opp.minProjects || 1)) score += 15;

      return {
        student,
        app,
        isApplied,
        fitScore: Math.min(100, score),
        reqSkillsMatch,
        missingSkills: opp.requiredSkills.filter(req => 
          !student.skills.some(sk => sk.toLowerCase().includes(req.toLowerCase()))
        )
      };
    });

    container.innerHTML = `
      <div class="page-container">
        <!-- Back Navigation & Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="coordinatorModule.renderCoordinatorDashboard()">
            ← Back to Opportunities
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="coordinatorModule.generateApplicationLink('${opp.id}')">
              🔗 Application Link
            </button>
            <span class="badge badge-open">${opp.state}</span>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="opp-company">${opp.company}</span>
              <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 2px;">${opp.title}</h2>
              <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 4px;">
                ${opp.location} • CTC: <strong style="color: var(--success);">${opp.ctc}</strong> • Openings: <strong>${opp.openings}</strong>
              </div>
            </div>
            <div style="display: flex; gap: 1rem; text-align: right;">
              <div>
                <div style="font-size: 1.5rem; font-weight: 800; color: #fff;">${apps.length}</div>
                <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Direct Applicants</div>
              </div>
              <div style="border-left: 1px solid var(--border); padding-left: 1rem;">
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--warning);">${apps.filter(a => a.status === 'Shortlisted' || a.status === 'Sent to Recruiter').length}</div>
                <div style="font-size: 0.7rem; color: var(--warning); text-transform: uppercase;">Shortlisted</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recruiter Expectation Filters Box (Req 14 & 15) -->
        <div class="filter-bar">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              Recruiter-Expectation Matching & Candidate Filters
            </div>
            <button class="btn btn-secondary btn-sm" onclick="coordinatorModule.resetCandidateFilters('${opp.id}')">
              Reset Filters
            </button>
          </div>

          <div class="filter-row" style="margin-top: 0.5rem;">
            <!-- CGPA Threshold Slider -->
            <div style="min-width: 180px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px;">
                <span>Min CGPA:</span>
                <strong id="cgpa-slider-val" style="color: var(--success);">${filterState.minCGPA.toFixed(1)}</strong>
              </div>
              <input type="range" min="6.0" max="9.5" step="0.1" value="${filterState.minCGPA}" class="form-control" style="padding: 0; height: 6px;" oninput="coordinatorModule.updateCGPAFilter(this.value, '${opp.id}')">
            </div>

            <!-- Department Multi-select Filter -->
            <div style="min-width: 160px;">
              <label class="form-label" style="margin-bottom: 2px;">Department</label>
              <select class="form-control" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" onchange="coordinatorModule.updateDeptFilter(this.value, '${opp.id}')">
                <option value="ALL">All Eligible Depts</option>
                ${opp.eligibleDepts.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>

            <!-- Min Projects Filter -->
            <div style="min-width: 130px;">
              <label class="form-label" style="margin-bottom: 2px;">Min Projects</label>
              <select class="form-control" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" onchange="coordinatorModule.updateProjectsFilter(this.value, '${opp.id}')">
                <option value="0">Any Projects</option>
                <option value="1">≥ 1 Project</option>
                <option value="2" selected>≥ 2 Projects</option>
                <option value="3">≥ 3 Projects</option>
              </select>
            </div>

            <!-- Application Status Filter -->
            <div style="min-width: 150px;">
              <label class="form-label" style="margin-bottom: 2px;">Application State</label>
              <select class="form-control" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;" onchange="coordinatorModule.updateStatusFilter(this.value, '${opp.id}')">
                <option value="ALL">All Candidates</option>
                <option value="Applied">Direct Applicants</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Sent to Recruiter">Sent to Recruiter</option>
              </select>
            </div>

            <!-- Who actually fits toggle -->
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 18px;">
              <input type="checkbox" id="fit-only-toggle" ${filterState.fitOnly ? 'checked' : ''} onchange="coordinatorModule.toggleFitOnly(this.checked, '${opp.id}')">
              <label for="fit-only-toggle" style="font-size: 0.8rem; font-weight: 600; color: var(--secondary); cursor: pointer;">
                🔥 High Match Only (Fit ≥ 70%)
              </label>
            </div>
          </div>
        </div>

        <!-- Candidate Screening Table -->
        <div class="table-wrapper">
          <div class="table-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="select-all-candidates" onchange="coordinatorModule.toggleSelectAll(this.checked)">
              <label for="select-all-candidates" style="font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                Select All Matching Candidates
              </label>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);" id="matching-candidates-count">
              Showing matching final-year pool
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="custom-table" id="screening-table">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  <th>Candidate</th>
                  <th>CGPA</th>
                  <th>Department</th>
                  <th>Skills & Projects</th>
                  <th>Expectation Fit</th>
                  <th>Application Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="screening-tbody">
                ${renderScreeningRows(candidateData, opp)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Floating Shortlist Dispatch Bar (Req 16 & 17) -->
        <div class="shortlist-bar" id="shortlist-dispatch-bar" style="display: ${selectedCandidateIds.size > 0 ? 'flex' : 'none'};">
          <div class="shortlist-summary">
            <div>
              <span class="shortlist-badge-count" id="shortlist-count-val">${selectedCandidateIds.size}</span>
              <span style="font-weight: 700; color: #fff; margin-left: 8px;">Candidates Selected for Shortlist</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-dim);">
              Target: <strong>${opp.company}</strong> (${opp.openings} Openings)
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="coordinatorModule.openReviewShortlistModal('${opp.id}')">
              👁️ Review Shortlist
            </button>
            <button class="btn btn-accent" onclick="coordinatorModule.sendCandidatesToConnect('${opp.id}')">
              🚀 Send to Recruiter (HIERO Connect)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderScreeningRows(candidateData, opp) {
    // Apply filters
    const filtered = candidateData.filter(item => {
      const s = item.student;
      const app = item.app;

      if (s.cgpa < filterState.minCGPA) return false;
      if (filterState.selectedDepts.length > 0 && !filterState.selectedDepts.includes(s.department)) return false;
      if ((s.projectCount || s.projects?.length || 0) < filterState.minProjects) return false;
      if (filterState.fitOnly && item.fitScore < 70) return false;

      if (filterState.status !== 'ALL') {
        if (!app || app.status !== filterState.status) return false;
      }

      return true;
    });

    // Update count in UI
    setTimeout(() => {
      const countEl = document.getElementById('matching-candidates-count');
      if (countEl) countEl.innerText = `${filtered.length} candidates matching recruiter specifications`;
    }, 10);

    if (filtered.length === 0) {
      return `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-dim);">
            No candidates match the active filter combination. Try lowering the CGPA slider or broadening skills.
          </td>
        </tr>
      `;
    }

    return filtered.map(item => {
      const s = item.student;
      const app = item.app;
      const isSelected = selectedCandidateIds.has(s.id);

      const statusBadge = app 
        ? `<span class="badge ${app.status === 'Selected' ? 'badge-selected' : (app.status === 'Sent to Recruiter' ? 'badge-recruiter' : 'badge-open')}">${app.status}</span>`
        : `<span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-dim);">Eligible Pool</span>`;

      const fitColor = item.fitScore >= 80 ? 'var(--success)' : (item.fitScore >= 60 ? 'var(--warning)' : 'var(--danger)');

      return `
        <tr style="${isSelected ? 'background: rgba(93, 93, 255, 0.08);' : ''}">
          <td>
            <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="coordinatorModule.toggleCandidateSelection('${s.id}', this.checked)">
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="avatar">${s.avatar || 'ST'}</div>
              <div>
                <div class="candidate-name">${s.name}</div>
                <div class="candidate-id">${s.regNo} • ${s.email}</div>
              </div>
            </div>
          </td>
          <td><strong style="color: var(--success); font-size: 0.95rem;">${Number(s.cgpa).toFixed(2)}</strong></td>
          <td><span class="badge badge-new">${s.department}</span></td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${s.skills.map(sk => {
                  const isReq = opp.requiredSkills.some(r => r.toLowerCase() === sk.toLowerCase());
                  return `<span class="skill-pill ${isReq ? 'matched' : ''}">${sk}</span>`;
                }).join('')}
              </div>
              <span style="font-size: 0.75rem; color: var(--text-dim);">${s.projectCount || s.projects?.length || 0} projects (${(s.projects || []).map(p => p.title).slice(0, 1).join(', ')}...)</span>
            </div>
          </td>
          <td>
            <div class="fit-meter">
              <div class="fit-bar-wrap">
                <div class="fit-bar-fill" style="width: ${item.fitScore}%; background: ${fitColor};"></div>
              </div>
              <span class="fit-pct" style="color: ${fitColor};">${item.fitScore}%</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 2px;">
              ${item.reqSkillsMatch.length}/${opp.requiredSkills.length} skills
            </div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="adminModule.viewStudentProfile('${s.id}')">
                Profile
              </button>
              <button class="btn ${isSelected ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="coordinatorModule.toggleCandidateSelection('${s.id}', ${!isSelected})">
                ${isSelected ? 'Remove' : '+ Shortlist'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateCGPAFilter(val, oppId) {
    filterState.minCGPA = parseFloat(val);
    const label = document.getElementById('cgpa-slider-val');
    if (label) label.innerText = Number(val).toFixed(1);
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (opp) renderCandidateScreeningScreen(opp);
  }

  function updateDeptFilter(dept, oppId) {
    filterState.selectedDepts = dept === 'ALL' ? [] : [dept];
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (opp) renderCandidateScreeningScreen(opp);
  }

  function updateProjectsFilter(count, oppId) {
    filterState.minProjects = parseInt(count);
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (opp) renderCandidateScreeningScreen(opp);
  }

  function updateStatusFilter(status, oppId) {
    filterState.status = status;
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (opp) renderCandidateScreeningScreen(opp);
  }

  function toggleFitOnly(checked, oppId) {
    filterState.fitOnly = checked;
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (opp) renderCandidateScreeningScreen(opp);
  }

  function resetCandidateFilters(oppId) {
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;
    filterState.minCGPA = opp.minCGPA;
    filterState.selectedDepts = [...opp.eligibleDepts];
    filterState.requiredSkills = [...opp.requiredSkills];
    filterState.minProjects = 0;
    filterState.status = 'ALL';
    filterState.fitOnly = false;
    renderCandidateScreeningScreen(opp);
  }

  function toggleCandidateSelection(studentId, isSelected) {
    if (isSelected) {
      selectedCandidateIds.add(studentId);
    } else {
      selectedCandidateIds.delete(studentId);
    }
    updateShortlistDispatchBar();
  }

  function toggleSelectAll(checked) {
    const opp = window.bridgeStore.getOpportunityById(selectedOppId);
    if (!opp) return;

    const allStudents = window.bridgeStore.getStudents();
    if (checked) {
      allStudents.forEach(s => {
        if (s.cgpa >= filterState.minCGPA) {
          selectedCandidateIds.add(s.id);
        }
      });
    } else {
      selectedCandidateIds.clear();
    }
    renderCandidateScreeningScreen(opp);
  }

  function updateShortlistDispatchBar() {
    const bar = document.getElementById('shortlist-dispatch-bar');
    const countVal = document.getElementById('shortlist-count-val');
    if (bar && countVal) {
      countVal.innerText = selectedCandidateIds.size;
      bar.style.display = selectedCandidateIds.size > 0 ? 'flex' : 'none';
    }
    // Also re-render rows to update selection style
    const opp = window.bridgeStore.getOpportunityById(selectedOppId);
    if (opp) {
      const tbody = document.getElementById('screening-tbody');
      if (tbody) {
        const apps = window.bridgeStore.getApplicationsByOpportunity(opp.id);
        const allStudents = window.bridgeStore.getStudents();
        const candidateData = allStudents.map(student => {
          const app = apps.find(a => a.studentId === student.id);
          return {
            student,
            app,
            fitScore: 85,
            reqSkillsMatch: opp.requiredSkills,
            missingSkills: []
          };
        });
        tbody.innerHTML = renderScreeningRows(candidateData, opp);
      }
    }
  }

  // === Shortlist Review Modal (Req 16) ===
  function openReviewShortlistModal(oppId) {
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;

    const selectedStudents = Array.from(selectedCandidateIds).map(id => window.bridgeStore.getStudentById(id)).filter(Boolean);

    const modalHtml = `
      <div class="modal-backdrop open" id="shortlist-review-modal">
        <div class="modal-content" style="max-width: 700px;">
          <button class="modal-close" onclick="coordinatorModule.closeModal('shortlist-review-modal')">✕</button>
          
          <div style="margin-bottom: 1.25rem;">
            <span class="opp-company">${opp.company}</span>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin-top: 2px;">Review Final-Year Shortlist (${selectedStudents.length} Candidates)</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">
              Inspect verified candidate credentials before transmitting candidate package to recruiter in HIERO Connect.
            </p>
          </div>

          <div style="max-height: 260px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.5rem; margin-bottom: 1.5rem;">
            ${selectedStudents.map((s, idx) => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 6px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-weight: 800; color: var(--primary-light); width: 24px;">#${idx + 1}</span>
                  <div>
                    <div style="font-weight: 700; color: #fff;">${s.name} <span style="font-size: 0.75rem; color: var(--text-dim);">(${s.regNo})</span></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${s.department} • CGPA: <strong style="color: var(--success);">${s.cgpa.toFixed(2)}</strong> • Skills: ${s.skills.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="coordinatorModule.removeFromShortlistModal('${s.id}', '${opp.id}')">✕</button>
              </div>
            `).join('')}
          </div>

          <div class="form-group">
            <label class="form-label">Placement Coordinator Endorsement Notes for Recruiter</label>
            <textarea id="coordinator-dispatch-notes" class="form-control" rows="2" placeholder="e.g. All 35 shortlisted candidates meet the 8.5 CGPA threshold and have completed verifiable microservices projects.">All candidates verified by College Placement Cell. 100% compliant with ${opp.company} criteria.</textarea>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border);">
            <button class="btn btn-secondary" onclick="coordinatorModule.closeModal('shortlist-review-modal')">Back to Filter</button>
            <button class="btn btn-accent btn-lg" onclick="coordinatorModule.sendCandidatesToConnect('${opp.id}')">
              🚀 Transmit to Recruiter (HIERO Connect)
            </button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function removeFromShortlistModal(studentId, oppId) {
    selectedCandidateIds.delete(studentId);
    openReviewShortlistModal(oppId);
  }

  // === Core Action: Send Candidates to HIERO Connect (Req 17) ===
  function sendCandidatesToConnect(oppId) {
    const opp = window.bridgeStore.getOpportunityById(oppId);
    if (!opp) return;

    if (selectedCandidateIds.size === 0) {
      window.app.showToast('Please select at least one candidate for the shortlist.', 'warning');
      return;
    }

    const notes = document.getElementById('coordinator-dispatch-notes')?.value || 'Transmitted by Placement Coordinator.';
    const selectedStudents = Array.from(selectedCandidateIds).map(id => window.bridgeStore.getStudentById(id)).filter(Boolean);

    // Create or update applications in state
    selectedStudents.forEach(s => {
      let app = window.bridgeStore.getApplications().find(a => a.oppId === oppId && a.studentId === s.id);
      if (!app) {
        const res = window.bridgeStore.submitApplication({
          oppId: oppId,
          studentId: s.id,
          resumeUrl: s.resumeUrl,
          notes: notes
        });
        app = res.application;
      }
      if (app) {
        window.bridgeStore.updateApplicationStatus(app.id, 'Sent to Recruiter', {
          coordinatorNotes: notes,
          recruiterFeedback: 'Under Recruiter Review'
        });
      }
    });

    // Update Opportunity state to SENT_TO_RECRUITER
    window.bridgeStore.updateOpportunityState(oppId, 'SENT_TO_RECRUITER');

    // Also sync to live Backend REST API if online
    if (window.bridgeApi && typeof window.bridgeApi.transmitShortlist === 'function') {
      window.bridgeApi.transmitShortlist(oppId, {
        studentIds: Array.from(selectedCandidateIds),
        notes: notes
      }).catch(err => console.warn('Backend sync deferred:', err));
    }

    const count = selectedStudents.length;
    selectedCandidateIds.clear();
    closeModal('shortlist-review-modal');

    window.app.showToast(`Package of ${count} verified candidates transmitted to ${opp.company} in HIERO Connect!`, 'success');
    renderCoordinatorDashboard();
  }

  function openRecruiterSyncModal() {
    window.connectSyncModule.openConnectSyncModal();
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    init,
    render: renderCoordinatorDashboard,
    renderCoordinatorDashboard,
    setTab,
    renderFilteredOpps,
    generateApplicationLink,
    copyLinkToClipboard,
    broadcastToBatch,
    openStudentPreview,
    openCandidateScreening,
    updateCGPAFilter,
    updateDeptFilter,
    updateProjectsFilter,
    updateStatusFilter,
    toggleFitOnly,
    resetCandidateFilters,
    toggleCandidateSelection,
    toggleSelectAll,
    openReviewShortlistModal,
    removeFromShortlistModal,
    sendCandidatesToConnect,
    openRecruiterSyncModal,
    closeModal
  };
})();
