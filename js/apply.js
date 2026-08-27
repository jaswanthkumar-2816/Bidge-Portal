/**
 * HIERO Bridge — Dedicated Public Student Application Controller
 * Handles Opportunity Data Ingestion, Animated CGPA Scale, Drag-and-Drop Resume,
 * Live Eligibility Evaluation, and Application Submission to Central State.
 */

(function () {
  'use strict';

  // State
  let currentOpportunity = null;
  let selectedFile = null;
  let selectedCGPA = 8.50;

  // DOM Elements
  const screenDashboard = document.getElementById('student-dashboard-screen');
  const screenForm = document.getElementById('student-form-screen');
  const screenSuccess = document.getElementById('student-success-screen');

  // Form Elements
  const btnStartApp = document.getElementById('btn-start-app');
  const btnBackToDash = document.getElementById('btn-back-to-dash');
  const studentForm = document.getElementById('student-application-form');
  const inputFullName = document.getElementById('student-full-name');
  const inputRollNumber = document.getElementById('student-roll-number');
  const inputResumeFile = document.getElementById('resume-file-input');
  const dropzone = document.getElementById('resume-dropzone');
  const dropzoneIdle = document.getElementById('dropzone-idle');
  const dropzoneSelected = document.getElementById('dropzone-selected');
  const selectedFileName = document.getElementById('selected-file-name');
  const selectedFileSize = document.getElementById('selected-file-size');
  const btnRemoveResume = document.getElementById('btn-remove-resume');

  // CGPA Slider Elements
  const cgpaSlider = document.getElementById('cgpa-range-slider');
  const cgpaHeroNumber = document.getElementById('cgpa-hero-number');
  const cgpaThresholdLine = document.getElementById('cgpa-threshold-line');
  const cgpaThresholdTag = document.getElementById('cgpa-threshold-tag');
  const eligibilityBox = document.getElementById('cgpa-eligibility-box');
  const eligibilityIcon = document.getElementById('eligibility-icon');
  const eligibilityTitle = document.getElementById('eligibility-status-title');
  const eligibilityDesc = document.getElementById('eligibility-status-desc');

  // Academic Year Elements
  const chkYear3rd = document.getElementById('apply-chk-3rd');
  const chkYearFinal = document.getElementById('apply-chk-final');
  const cardYear3rd = document.getElementById('apply-year-card-3rd');
  const cardYearFinal = document.getElementById('apply-year-card-final');
  const yearError = document.getElementById('year-error');

  // Error Message Elements
  const nameError = document.getElementById('name-error');
  const rollError = document.getElementById('roll-error');
  const resumeError = document.getElementById('resume-error');

  // Init
  window.addEventListener('DOMContentLoaded', () => {
    initParticleNetwork();
    loadOpportunityData();
    setupEventListeners();
  });

  function initParticleNetwork() {
    if (typeof window.initNetworkCanvas === 'function') {
      window.initNetworkCanvas('network-canvas');
    } else if (typeof window.hieroParticles === 'object' && window.hieroParticles.init) {
      window.hieroParticles.init('network-canvas');
    }
  }

  function loadOpportunityData() {
    // 1. Resolve opportunity from query string: ?oppId=...
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('oppId');

    const state = (window.bridgeStore && window.bridgeStore.state) || {};
    const opportunities = state.opportunities || [];

    if (oppId) {
      currentOpportunity = opportunities.find(o => o.id === oppId);
    }

    // Fallback gracefully to first active opportunity if not found
    if (!currentOpportunity && opportunities.length > 0) {
      currentOpportunity = opportunities[0];
    }

    if (!currentOpportunity) {
      // Default fallback mock if store not yet loaded
      currentOpportunity = {
        id: 'OPP-HC-2026-001',
        company: 'Databricks',
        title: 'Associate Software Engineer — Distributed Systems',
        location: 'Bengaluru / Hyderabad',
        workMode: 'Hybrid',
        academicYear: '2022-2026',
        state: 'APPLICATIONS_OPEN',
        minCGPA: 8.50,
        eligibleDepts: ['CSE', 'AIML', 'IT'],
        ctc: '₹28,00,000 – ₹34,00,000 PA',
        deadline: '2026-09-15',
        requiredSkills: ['Python / Go / C++', 'Distributed Systems', 'Cloud Infrastructure', 'SQL / Spark Engine'],
        preferredSkills: ['Kubernetes', 'Raft Consensus Protocol', 'Storage Optimization'],
        description: 'Lead mission-critical distributed data storage engines, query processors, and cloud infrastructure pipelines. You will collaborate directly with global engineering leads to design resilient cloud architectures.'
      };
    }

    renderDashboardDetails();
    renderFormRecap();
    initializeCGPASlider();
  }

  function renderDashboardDetails() {
    const opp = currentOpportunity;
    if (!opp) return;

    // Header & Meta
    document.getElementById('dash-opp-company').textContent = opp.company.toUpperCase();
    document.getElementById('dash-opp-title').textContent = opp.title;
    document.getElementById('dash-opp-location').textContent = `📍 ${opp.location || 'Pan-India'}`;
    document.getElementById('dash-opp-workmode').textContent = `💼 ${opp.workMode || 'Full-time'}`;
    document.getElementById('dash-opp-batch').textContent = `🎓 Batch ${opp.academicYear || '2022-2026'}`;
    
    // Status Badge
    const statusPill = document.getElementById('dash-opp-status');
    const stateStr = (opp.state || 'APPLICATIONS_OPEN').replace(/_/g, ' ');
    statusPill.textContent = stateStr;

    // 4 Matrix Tiles
    document.getElementById('dash-opp-mincgpa').textContent = `≥ ${opp.minCGPA.toFixed(2)}`;
    document.getElementById('dash-opp-depts').textContent = (opp.eligibleDepts || []).join(', ');
    document.getElementById('dash-opp-ctc').textContent = opp.ctc || 'As per norms';
    document.getElementById('dash-opp-deadline').textContent = opp.deadline || '2026-09-30';

    // Skills
    const skillsContainer = document.getElementById('dash-opp-skills');
    const reqPills = (opp.requiredSkills || []).map(s => 
      `<span class="skill-pill matched"><span style="opacity:0.75; font-size:0.65rem; margin-right:4px; font-weight:800;">REQ</span>${s}</span>`
    ).join('');
    const prefPills = (opp.preferredSkills || []).map(s => 
      `<span class="skill-pill"><span style="opacity:0.75; font-size:0.65rem; margin-right:4px; font-weight:800;">PREF</span>${s}</span>`
    ).join('');
    skillsContainer.innerHTML = reqPills + prefPills;

    // Description
    if (opp.description) {
      document.getElementById('dash-opp-desc').textContent = opp.description;
    }
  }

  function renderFormRecap() {
    const opp = currentOpportunity;
    if (!opp) return;

    document.getElementById('form-opp-title-ref').textContent = `${opp.company} — ${opp.title}`;
    document.getElementById('form-opp-company-ref').textContent = opp.company.toUpperCase();
    document.getElementById('form-opp-role-ref').textContent = opp.title;
    document.getElementById('form-opp-cutoff-ref').textContent = `≥ ${opp.minCGPA.toFixed(2)}`;
  }

  function initializeCGPASlider() {
    const minReq = currentOpportunity ? currentOpportunity.minCGPA : 8.50;
    
    // Position the threshold marker line on the slider
    const thresholdPct = (minReq / 10.0) * 100;
    if (cgpaThresholdLine) {
      cgpaThresholdLine.style.left = `${thresholdPct}%`;
      cgpaThresholdTag.textContent = `Req: ${minReq.toFixed(2)}`;
    }

    // Default slider to minReq or 8.50
    selectedCGPA = Math.max(minReq, 8.50);
    cgpaSlider.value = selectedCGPA.toFixed(2);
    updateCGPADisplay(selectedCGPA);
  }

  function updateCGPADisplay(val) {
    val = parseFloat(val);
    selectedCGPA = val;

    // 1. Update prominent animated number
    cgpaHeroNumber.textContent = val.toFixed(2);

    // 2. Compute fill percentage
    const pct = (val / 10.0) * 100;
    cgpaSlider.style.background = `linear-gradient(to right, #00ff66 0%, #00ff66 ${pct}%, rgba(255, 255, 255, 0.1) ${pct}%, rgba(255, 255, 255, 0.1) 100%)`;

    // 3. Highlight tick mark matching range
    const ticks = document.querySelectorAll('.cgpa-tick');
    ticks.forEach(t => {
      const tickVal = parseFloat(t.getAttribute('data-val'));
      if (Math.abs(tickVal - val) <= 0.25) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // 4. Live Intelligent Eligibility Feedback
    const minReq = currentOpportunity ? currentOpportunity.minCGPA : 8.50;
    if (val >= minReq) {
      eligibilityBox.className = 'eligibility-feedback-card eligible';
      eligibilityIcon.textContent = '✓';
      eligibilityTitle.textContent = 'You Meet the Minimum CGPA Requirement';
      eligibilityDesc.textContent = `Your verified CGPA (${val.toFixed(2)}) satisfies the minimum requirement of ≥ ${minReq.toFixed(2)} for ${currentOpportunity.company}.`;
    } else {
      eligibilityBox.className = 'eligibility-feedback-card not-eligible';
      eligibilityIcon.textContent = '⚠️';
      eligibilityTitle.textContent = `Your CGPA is Below the Minimum Requirement of ${minReq.toFixed(2)}`;
      eligibilityDesc.textContent = `Your selected CGPA (${val.toFixed(2)}) is below the cutoff of ${minReq.toFixed(2)}. You may still submit your profile for coordinator review.`;
    }
  }

  function setupEventListeners() {
    // START APPLICATION BUTTON -> Switch to Form
    btnStartApp.addEventListener('click', () => {
      showScreen(screenForm);
    });

    // BACK BUTTON -> Switch to Dashboard
    btnBackToDash.addEventListener('click', () => {
      showScreen(screenDashboard);
    });

    // CGPA Slider Input Event (Smooth live update)
    cgpaSlider.addEventListener('input', (e) => {
      updateCGPADisplay(e.target.value);
    });

    // Clickable ticks on CGPA Scale
    const ticks = document.querySelectorAll('.cgpa-tick');
    ticks.forEach(t => {
      t.addEventListener('click', () => {
        const val = parseFloat(t.getAttribute('data-val'));
        cgpaSlider.value = val.toFixed(2);
        updateCGPADisplay(val);
      });
    });

    // Drag-and-Drop Resume Handlers
    dropzone.addEventListener('click', (e) => {
      if (e.target !== btnRemoveResume && !btnRemoveResume.contains(e.target)) {
        inputResumeFile.click();
      }
    });

    inputResumeFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });

    btnRemoveResume.addEventListener('click', (e) => {
      e.stopPropagation();
      clearSelectedFile();
    });

    // Academic Year Multi-Select Listeners
    if (chkYear3rd) {
      chkYear3rd.addEventListener('change', () => {
        if (chkYear3rd.checked) {
          cardYear3rd?.classList.add('selected');
        } else {
          cardYear3rd?.classList.remove('selected');
        }
        cardYear3rd?.classList.remove('input-invalid');
        cardYearFinal?.classList.remove('input-invalid');
        if (yearError && (chkYear3rd.checked || (chkYearFinal && chkYearFinal.checked))) {
          yearError.style.display = 'none';
        }
      });
    }

    if (chkYearFinal) {
      chkYearFinal.addEventListener('change', () => {
        if (chkYearFinal.checked) {
          cardYearFinal?.classList.add('selected');
        } else {
          cardYearFinal?.classList.remove('selected');
        }
        cardYear3rd?.classList.remove('input-invalid');
        cardYearFinal?.classList.remove('input-invalid');
        if (yearError && (chkYearFinal.checked || (chkYear3rd && chkYear3rd.checked))) {
          yearError.style.display = 'none';
        }
      });
    }

    // Form Submission
    studentForm.addEventListener('submit', handleFormSubmit);

    // Done Button on Success Screen
    const btnDone = document.getElementById('btn-success-done');
    if (btnDone) {
      btnDone.addEventListener('click', () => {
        // Reset form and return to Dashboard
        studentForm.reset();
        clearSelectedFile();
        if (chkYear3rd) chkYear3rd.checked = false;
        if (chkYearFinal) chkYearFinal.checked = false;
        cardYear3rd?.classList.remove('selected', 'input-invalid');
        cardYearFinal?.classList.remove('selected', 'input-invalid');
        if (yearError) yearError.style.display = 'none';
        initializeCGPASlider();
        showScreen(screenDashboard);
      });
    }
  }

  function handleSelectedFile(file) {
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      resumeError.textContent = 'Please upload a PDF or DOCX resume.';
      resumeError.style.display = 'block';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      resumeError.textContent = 'File exceeds maximum limit of 10MB.';
      resumeError.style.display = 'block';
      return;
    }

    resumeError.style.display = 'none';
    selectedFile = file;

    // Show preview
    selectedFileName.textContent = file.name;
    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    selectedFileSize.textContent = `${formattedSize} • Ready for transmission`;

    dropzoneIdle.style.display = 'none';
    dropzoneSelected.style.display = 'flex';
    dropzone.classList.add('has-file');
  }

  function clearSelectedFile() {
    selectedFile = null;
    inputResumeFile.value = '';
    dropzoneIdle.style.display = 'flex';
    dropzoneSelected.style.display = 'none';
    dropzone.classList.remove('has-file');
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    let hasError = false;

    // 1. Validate Full Name
    const nameVal = inputFullName.value.trim();
    if (!nameVal || nameVal.length < 2) {
      nameError.style.display = 'block';
      inputFullName.classList.add('input-invalid');
      hasError = true;
    } else {
      nameError.style.display = 'none';
      inputFullName.classList.remove('input-invalid');
    }

    // 2. Validate Roll Number
    const rollVal = inputRollNumber.value.trim();
    if (!rollVal || rollVal.length < 3) {
      rollError.style.display = 'block';
      inputRollNumber.classList.add('input-invalid');
      hasError = true;
    } else {
      rollError.style.display = 'none';
      inputRollNumber.classList.remove('input-invalid');
    }

    // 3. Validate Academic Year (Required Multi-Select: 3rd Year and/or Final Year)
    const selectedYears = [];
    if (chkYear3rd && chkYear3rd.checked) selectedYears.push('3rd Year');
    if (chkYearFinal && chkYearFinal.checked) selectedYears.push('Final Year');

    if (selectedYears.length === 0) {
      if (yearError) {
        yearError.textContent = 'Please select your current academic year.';
        yearError.style.display = 'block';
      }
      cardYear3rd?.classList.add('input-invalid');
      cardYearFinal?.classList.add('input-invalid');
      hasError = true;
    } else {
      if (yearError) yearError.style.display = 'none';
      cardYear3rd?.classList.remove('input-invalid');
      cardYearFinal?.classList.remove('input-invalid');
    }

    // 4. Validate Resume
    if (!selectedFile) {
      resumeError.textContent = 'Please attach your resume to continue.';
      resumeError.style.display = 'block';
      dropzone.classList.add('dropzone-invalid');
      hasError = true;
    } else {
      resumeError.style.display = 'none';
      dropzone.classList.remove('dropzone-invalid');
    }

    if (hasError) {
      return;
    }

    // 5. Save and Synchronize to Central Store & College Administrator Console
    const resumeName = selectedFile ? selectedFile.name : 'resume.pdf';
    const resumeUrl = `https://hiero.io/resumes/${encodeURIComponent(resumeName)}`;
    const academicYearStr = selectedYears.join(', ');

    let syncResult = null;
    if (window.bridgeStore && typeof window.bridgeStore.recordStudentApplication === 'function') {
      syncResult = window.bridgeStore.recordStudentApplication({
        name: nameVal,
        rollNo: rollVal,
        cgpa: selectedCGPA,
        academicYear: academicYearStr,
        academicYears: selectedYears,
        resumeFileName: resumeName,
        resumeUrl: resumeUrl,
        oppId: currentOpportunity.id,
        oppTitle: currentOpportunity.title,
        company: currentOpportunity.company,
        status: 'Applied'
      });
    } else if (window.bridgeStore && typeof window.bridgeStore.submitApplication === 'function') {
      syncResult = window.bridgeStore.submitApplication({
        oppId: currentOpportunity.id,
        studentId: 'STU-' + rollVal.replace(/[^a-zA-Z0-9]/g, ''),
        notes: `Application by ${nameVal} (${rollVal}) with CGPA ${selectedCGPA.toFixed(2)} [${academicYearStr}]`,
        resumeUrl: resumeUrl
      });
    }

    const newAppId = (syncResult && syncResult.application && syncResult.application.id) 
      || ('APP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));

    // 6. Populate Success Receipt
    document.getElementById('success-opp-title').textContent = currentOpportunity.title;
    document.getElementById('success-opp-company').textContent = currentOpportunity.company;
    document.getElementById('success-app-id').textContent = newAppId;
    document.getElementById('success-candidate-name').textContent = nameVal;
    document.getElementById('success-candidate-roll').textContent = rollVal;
    
    const receiptYearEl = document.getElementById('success-candidate-year');
    if (receiptYearEl) {
      receiptYearEl.textContent = academicYearStr;
    }

    document.getElementById('success-candidate-cgpa').textContent = `${selectedCGPA.toFixed(2)} / 10.0`;
    document.getElementById('success-candidate-resume').textContent = resumeName;

    // 7. Transition to Success Screen
    showScreen(screenSuccess);
  }

  function showScreen(targetScreen) {
    [screenDashboard, screenForm, screenSuccess].forEach(s => {
      s.classList.remove('active');
    });
    targetScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

})();
