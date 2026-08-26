/**
 * HIERO BRIDGE - College Administrator Module
 * Handles College Onboarding, Departments, Batches, Bulk Student Import & Verification Engine
 */

window.adminModule = (function () {
  let pendingImportData = null;

  function init() {
    renderAdminDashboard();
  }

  function renderAdminDashboard() {
    const container = document.getElementById('admin-view-container');
    if (!container) return;

    const state = window.bridgeStore.state;
    const college = state.college;
    const students = state.students;

    const totalStudents = students.length;
    const verifiedCount = students.filter(s => s.verificationStatus === 'Verified').length;
    const placedCount = students.filter(s => s.placementStatus === 'Placed').length;
    const activePool = students.filter(s => s.placementStatus === 'Active').length;

    container.innerHTML = `
      <div class="page-container">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">College Administrator Console</h1>
            <p class="page-subtitle">Manage institution profile, departments, batches, and verified final-year talent pool</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" onclick="adminModule.openCollegeModal()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              College Profile
            </button>
            <button class="btn btn-primary" onclick="adminModule.openImportModal()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Bulk Import Students
            </button>
            <button class="btn btn-secondary" onclick="adminModule.openAddStudentModal()">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              Add Student
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Total Final-Year Pool</span>
              <div class="metric-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
            </div>
            <div class="metric-value">${totalStudents}</div>
            <div class="metric-sub">Batch: <strong>${college.currentBatch}</strong></div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Verified Profiles</span>
              <div class="metric-icon" style="color: var(--success);">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div class="metric-value" style="color: var(--success);">${verifiedCount}</div>
            <div class="metric-sub trend-up">100% Institution Verified</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Active Placement Pool</span>
              <div class="metric-icon" style="color: var(--primary-light);">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
            </div>
            <div class="metric-value">${activePool}</div>
            <div class="metric-sub">Eligible for Opportunities</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Placed Students</span>
              <div class="metric-icon" style="color: var(--secondary);">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
              </div>
            </div>
            <div class="metric-value" style="color: var(--secondary);">${placedCount}</div>
            <div class="metric-sub">Offers via HIERO Connect</div>
          </div>
        </div>

        <!-- College Profile & Department Structure Card -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="metric-card" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700;">Institution Profile</h3>
              <span class="badge badge-open">Autonomous</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
              <div><span style="color: var(--text-dim);">Institution Name:</span> <strong>${college.name}</strong></div>
              <div><span style="color: var(--text-dim);">College Identifier:</span> <strong style="color: var(--primary-light);">${college.code}</strong></div>
              <div><span style="color: var(--text-dim);">Location:</span> <strong>${college.location}</strong></div>
              <div><span style="color: var(--text-dim);">Tier / Accreditation:</span> <strong>${college.tier}</strong></div>
              <div><span style="color: var(--text-dim);">Active Batches:</span> <strong>${college.academicYears.join(', ')}</strong></div>
            </div>
          </div>

          <div class="metric-card" style="padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700;">Departments (${college.departments.length})</h3>
              <button class="btn btn-secondary btn-sm" onclick="adminModule.openAddDeptModal()">+ Add Dept</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 160px; overflow-y: auto;">
              ${college.departments.map(d => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <div>
                    <strong style="color: #fff;">${d.name}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: 8px;">(${d.code})</span>
                  </div>
                  <span class="badge badge-new">${students.filter(s => s.department === d.id || s.department === d.code).length} Students</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Verified Final-Year Student Pool Table -->
        <div class="table-wrapper">
          <div class="table-header-bar">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700;">Verified Final-Year Student Pool</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Collegiate talent verified for direct industry opportunity matching</p>
            </div>

            <!-- Search & Filters -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div class="search-input-wrap" style="width: 240px;">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" id="admin-student-search" class="form-control" placeholder="Search by name, regNo, skill..." oninput="adminModule.filterStudentTable()">
              </div>
              <select id="admin-dept-filter" class="form-control" style="width: 150px;" onchange="adminModule.filterStudentTable()">
                <option value="ALL">All Depts</option>
                ${college.departments.map(d => `<option value="${d.id}">${d.code}</option>`).join('')}
              </select>
              <select id="admin-status-filter" class="form-control" style="width: 140px;" onchange="adminModule.filterStudentTable()">
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Placed">Placed</option>
                <option value="Ineligible">Ineligible</option>
              </select>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="custom-table" id="admin-student-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reg No</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Skills & Projects</th>
                  <th>Verification</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="admin-student-tbody">
                ${renderStudentRows(students)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderStudentRows(students) {
    if (!students || students.length === 0) {
      return `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
            No students found in the verified database.
          </td>
        </tr>
      `;
    }

    return students.map(s => {
      const isVerified = s.verificationStatus === 'Verified';
      const statusBadge = s.placementStatus === 'Placed' 
        ? '<span class="badge badge-placed">Placed</span>' 
        : (s.placementStatus === 'Active' ? '<span class="badge badge-open">Active</span>' : '<span class="badge badge-rejected">Ineligible</span>');

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="avatar">${s.avatar || 'ST'}</div>
              <div>
                <div class="candidate-name">${s.name}</div>
                <div class="candidate-id">${s.email}</div>
              </div>
            </div>
          </td>
          <td><strong>${s.regNo}</strong></td>
          <td><span class="badge badge-new">${s.department}</span></td>
          <td><strong style="color: var(--success); font-size: 0.95rem;">${Number(s.cgpa).toFixed(2)}</strong></td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${s.skills.slice(0, 3).map(sk => `<span class="skill-pill">${sk}</span>`).join('')}
                ${s.skills.length > 3 ? `<span class="skill-pill">+${s.skills.length - 3}</span>` : ''}
              </div>
              <span style="font-size: 0.75rem; color: var(--text-dim);">${s.projectCount || s.projects?.length || 0} Projects Verified</span>
            </div>
          </td>
          <td>
            <button class="badge ${isVerified ? 'badge-open' : 'badge-shortlist'}" style="cursor: pointer; border: none;" onclick="adminModule.toggleVerification('${s.id}')">
              ${isVerified ? '✓ Verified' : '⏳ Pending'}
            </button>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="adminModule.viewStudentProfile('${s.id}')" title="View Full Profile">
                View
              </button>
              <button class="btn btn-secondary btn-sm" style="color: var(--danger);" onclick="adminModule.deleteStudent('${s.id}')" title="Remove Record">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterStudentTable() {
    const query = (document.getElementById('admin-student-search')?.value || '').toLowerCase().trim();
    const dept = document.getElementById('admin-dept-filter')?.value || 'ALL';
    const status = document.getElementById('admin-status-filter')?.value || 'ALL';

    const allStudents = window.bridgeStore.getStudents();
    const filtered = allStudents.filter(s => {
      const matchesQuery = !query || 
        s.name.toLowerCase().includes(query) ||
        s.regNo.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.skills.some(sk => sk.toLowerCase().includes(query));

      const matchesDept = (dept === 'ALL') || (s.department === dept);
      const matchesStatus = (status === 'ALL') || (s.placementStatus === status);

      return matchesQuery && matchesDept && matchesStatus;
    });

    const tbody = document.getElementById('admin-student-tbody');
    if (tbody) {
      tbody.innerHTML = renderStudentRows(filtered);
    }
  }

  function toggleVerification(id) {
    const student = window.bridgeStore.getStudentById(id);
    if (!student) return;
    const newStatus = student.verificationStatus === 'Verified' ? 'Pending' : 'Verified';
    window.bridgeStore.updateStudent(id, { verificationStatus: newStatus });
    window.app.showToast(`Verification status updated to ${newStatus}`, 'success');
    renderAdminDashboard();
  }

  function deleteStudent(id) {
    if (!confirm('Are you sure you want to remove this student from the final-year talent pool?')) return;
    window.bridgeStore.state.students = window.bridgeStore.state.students.filter(s => s.id !== id);
    window.bridgeStore.saveState();
    window.app.showToast('Student record removed.', 'info');
    renderAdminDashboard();
  }

  // === Modal Handlers ===
  function openCollegeModal() {
    const college = window.bridgeStore.state.college;
    const modalHtml = `
      <div class="modal-backdrop open" id="college-modal">
        <div class="modal-content">
          <button class="modal-close" onclick="adminModule.closeModal('college-modal')">✕</button>
          <h2 style="margin-bottom: 1.5rem;">Institution Profile & Placement Settings</h2>
          
          <form onsubmit="adminModule.saveCollegeProfile(event)">
            <div class="form-group">
              <label class="form-label">College Name</label>
              <input type="text" id="cfg-college-name" class="form-control" value="${college.name}" required>
            </div>
            <div class="form-group">
              <label class="form-label">College Identifier Code</label>
              <input type="text" id="cfg-college-code" class="form-control" value="${college.code}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Campus Location</label>
              <input type="text" id="cfg-college-location" class="form-control" value="${college.location}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Institution Tier / Accreditation</label>
              <input type="text" id="cfg-college-tier" class="form-control" value="${college.tier}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Active Final-Year Batch</label>
              <input type="text" id="cfg-college-batch" class="form-control" value="${college.currentBatch}" required>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 2rem;">
              <button type="button" class="btn btn-secondary" onclick="adminModule.closeModal('college-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function saveCollegeProfile(e) {
    e.preventDefault();
    const updates = {
      name: document.getElementById('cfg-college-name').value,
      code: document.getElementById('cfg-college-code').value,
      location: document.getElementById('cfg-college-location').value,
      tier: document.getElementById('cfg-college-tier').value,
      currentBatch: document.getElementById('cfg-college-batch').value
    };
    window.bridgeStore.updateCollegeProfile(updates);
    closeModal('college-modal');
    window.app.showToast('College profile saved successfully.', 'success');
    renderAdminDashboard();
  }

  function openAddDeptModal() {
    const modalHtml = `
      <div class="modal-backdrop open" id="dept-modal">
        <div class="modal-content" style="max-width: 480px;">
          <button class="modal-close" onclick="adminModule.closeModal('dept-modal')">✕</button>
          <h2 style="margin-bottom: 1.5rem;">Add Academic Department</h2>
          <form onsubmit="adminModule.saveNewDept(event)">
            <div class="form-group">
              <label class="form-label">Department Code (e.g. DS, MECH)</label>
              <input type="text" id="new-dept-id" class="form-control" placeholder="AIML" required>
            </div>
            <div class="form-group">
              <label class="form-label">Department Full Name</label>
              <input type="text" id="new-dept-name" class="form-control" placeholder="Data Science & Engineering" required>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="adminModule.closeModal('dept-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Add Department</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function saveNewDept(e) {
    e.preventDefault();
    const id = document.getElementById('new-dept-id').value.toUpperCase().trim();
    const name = document.getElementById('new-dept-name').value.trim();
    window.bridgeStore.addDepartment({ id, code: id, name, totalStudents: 0 });
    closeModal('dept-modal');
    window.app.showToast(`Department ${id} added successfully.`, 'success');
    renderAdminDashboard();
  }

  // === Bulk Student CSV/JSON Import Engine with Live Validation ===
  function openImportModal() {
    const modalHtml = `
      <div class="modal-backdrop open" id="import-modal">
        <div class="modal-content" style="max-width: 750px;">
          <button class="modal-close" onclick="adminModule.closeModal('import-modal')">✕</button>
          <h2 style="margin-bottom: 0.5rem;">Bulk Import Final-Year Student List</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            Upload CSV or JSON file. The validation engine will detect duplicates, invalid emails, and CGPA discrepancies.
          </p>

          <!-- Dropzone -->
          <div class="dropzone" id="csv-dropzone" onclick="document.getElementById('csv-file-input').click()">
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--primary); margin-bottom: 0.75rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            <div style="font-weight: 700; font-size: 1rem; color: #fff;">Click to select or drag & drop CSV file</div>
            <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">Supports standard CSV with headers: name, regNo, department, cgpa, email, phone, skills</div>
            <input type="file" id="csv-file-input" accept=".csv, .json" style="display: none;" onchange="adminModule.handleFileSelect(event)">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <button class="btn btn-secondary btn-sm" onclick="adminModule.loadSampleCSV()">
              📥 Load sample-students.csv demo
            </button>
            <span style="font-size: 0.75rem; color: var(--text-dim);">Encoding: UTF-8</span>
          </div>

          <!-- Validation Report Container -->
          <div id="import-preview-area" style="margin-top: 1.5rem; display: none;"></div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      parseAndValidateCSV(evt.target.result);
    };
    reader.readAsText(file);
  }

  function loadSampleCSV() {
    fetch('sample-students.csv')
      .then(res => res.text())
      .then(csvText => {
        parseAndValidateCSV(csvText);
      })
      .catch(err => {
        window.app.showToast('Error loading sample CSV file', 'danger');
      });
  }

  function parseAndValidateCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      window.app.showToast('CSV file is empty or missing headers.', 'danger');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const existingStudents = window.bridgeStore.getStudents();
    const existingRegNos = new Set(existingStudents.map(s => s.regNo.toUpperCase()));
    const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));

    const seenInFileRegNos = new Set();
    const validRows = [];
    const invalidRows = [];
    const duplicateRows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted CSV parsing
      const row = [];
      let inQuote = false;
      let cur = '';
      for (let char of line) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          row.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim().replace(/^["']|["']$/g, ''));

      const name = row[0] || '';
      const regNo = (row[1] || '').toUpperCase();
      const department = row[2] || 'CSE';
      const academicYear = row[3] || '2022-2026';
      const cgpa = parseFloat(row[4]);
      const email = (row[5] || '').toLowerCase();
      const phone = row[6] || '+91-9999999999';
      const skillsStr = row[7] || '';
      const projectCount = parseInt(row[8]) || 0;
      const projectsStr = row[9] || '';
      const certificationsStr = row[10] || 'None';

      const errors = [];

      // Validation Checks
      if (!name || name.length < 2) errors.push('Missing/invalid student name');
      if (!regNo) errors.push('Missing registration number');
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10.0) errors.push(`Invalid CGPA (${row[4]}). Must be between 0.0 and 10.0`);
      if (!email || !email.includes('@') || !email.includes('.')) errors.push(`Invalid email format: ${email}`);

      // Duplicate Check
      if (existingRegNos.has(regNo) || existingEmails.has(email) || seenInFileRegNos.has(regNo)) {
        duplicateRows.push({ name, regNo, email, cgpa, reason: 'Duplicate Registration No or Email already in database' });
        continue;
      }

      seenInFileRegNos.add(regNo);

      if (errors.length > 0) {
        invalidRows.push({ name, regNo, email, cgpa, errors: errors.join(', ') });
      } else {
        const skills = skillsStr.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        const projects = projectsStr ? projectsStr.split(/[,;|]/).map(p => ({ title: p.trim(), tech: 'Full Stack', link: '#' })) : [];
        const certs = certificationsStr !== 'None' ? certificationsStr.split(/[,;|]/).map(c => c.trim()) : [];

        validRows.push({
          name,
          regNo,
          department: department.includes('Artificial') ? 'AIML' : (department.includes('Information') ? 'IT' : (department.includes('Electronics') ? 'ECE' : 'CSE')),
          academicYear,
          cgpa,
          email,
          phone,
          skills: skills.length > 0 ? skills : ['General Engineering'],
          projectCount: projectCount || projects.length,
          projects,
          certifications: certs,
          resumeUrl: `https://hiero.io/resumes/${name.toLowerCase().replace(/\s+/g, '-')}-2026.pdf`,
          placementStatus: 'Active',
          verificationStatus: 'Verified'
        });
      }
    }

    pendingImportData = validRows;
    renderImportPreview(lines.length - 1, validRows, duplicateRows, invalidRows);
  }

  function renderImportPreview(total, valid, duplicates, invalid) {
    const area = document.getElementById('import-preview-area');
    if (!area) return;
    area.style.display = 'block';

    area.innerHTML = `
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Import Validation Summary</h4>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; text-align: center;">
          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size: 1.25rem; font-weight: 800;">${total}</div>
            <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Total Read</div>
          </div>
          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--success);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--success);">${valid.length}</div>
            <div style="font-size: 0.7rem; color: var(--success); text-transform: uppercase;">Ready to Add</div>
          </div>
          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--warning);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--warning);">${duplicates.length}</div>
            <div style="font-size: 0.7rem; color: var(--warning); text-transform: uppercase;">Duplicates</div>
          </div>
          <div style="background: var(--bg-surface); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--danger);">
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--danger);">${invalid.length}</div>
            <div style="font-size: 0.7rem; color: var(--danger); text-transform: uppercase;">Invalid Rows</div>
          </div>
        </div>
      </div>

      <!-- Preview of Valid Rows -->
      <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 1.5rem;">
        <table class="custom-table" style="font-size: 0.8rem;">
          <thead>
            <tr>
              <th>Status</th>
              <th>Student Name</th>
              <th>Reg No</th>
              <th>Dept</th>
              <th>CGPA</th>
              <th>Notes / Errors</th>
            </tr>
          </thead>
          <tbody>
            ${valid.map(v => `
              <tr>
                <td><span class="badge badge-open">Valid</span></td>
                <td><strong>${v.name}</strong></td>
                <td>${v.regNo}</td>
                <td>${v.department}</td>
                <td><strong style="color: var(--success);">${v.cgpa.toFixed(2)}</strong></td>
                <td style="color: var(--text-dim);">${v.skills.join(', ')}</td>
              </tr>
            `).join('')}
            ${duplicates.map(d => `
              <tr style="opacity: 0.6;">
                <td><span class="badge badge-shortlist">Duplicate</span></td>
                <td>${d.name}</td>
                <td>${d.regNo}</td>
                <td>-</td>
                <td>${d.cgpa || '-'}</td>
                <td style="color: var(--warning);">${d.reason}</td>
              </tr>
            `).join('')}
            ${invalid.map(inv => `
              <tr style="background: rgba(239, 68, 68, 0.08);">
                <td><span class="badge badge-rejected">Error</span></td>
                <td>${inv.name || 'Unknown'}</td>
                <td>${inv.regNo || 'None'}</td>
                <td>-</td>
                <td>${inv.cgpa || 'Invalid'}</td>
                <td style="color: #fca5a5;">${inv.errors}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="adminModule.closeModal('import-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="adminModule.confirmBulkImport()" ${valid.length === 0 ? 'disabled' : ''}>
          Import ${valid.length} Verified Students
        </button>
      </div>
    `;
  }

  function confirmBulkImport() {
    if (!pendingImportData || pendingImportData.length === 0) {
      window.app.showToast('No valid students to import.', 'warning');
      return;
    }

    window.bridgeStore.bulkAddStudents(pendingImportData);
    const count = pendingImportData.length;
    pendingImportData = null;
    closeModal('import-modal');
    window.app.showToast(`Successfully imported and verified ${count} final-year students!`, 'success');
    renderAdminDashboard();
  }

  function openAddStudentModal() {
    const depts = window.bridgeStore.state.college.departments;
    const modalHtml = `
      <div class="modal-backdrop open" id="add-student-modal">
        <div class="modal-content" style="max-width: 600px;">
          <button class="modal-close" onclick="adminModule.closeModal('add-student-modal')">✕</button>
          <h2 style="margin-bottom: 1.5rem;">Add Student to Verified Pool</h2>
          <form onsubmit="adminModule.saveSingleStudent(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="stu-name" class="form-control" placeholder="e.g. Priya Sharma" required>
              </div>
              <div class="form-group">
                <label class="form-label">Registration Number</label>
                <input type="text" id="stu-regno" class="form-control" placeholder="2022CSE199" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Department</label>
                <select id="stu-dept" class="form-control" required>
                  ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">CGPA (0.00 - 10.00)</label>
                <input type="number" step="0.01" min="0" max="10" id="stu-cgpa" class="form-control" placeholder="8.50" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="stu-email" class="form-control" placeholder="student@college.edu" required>
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" id="stu-phone" class="form-control" placeholder="+91-9876543210" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Skills (comma-separated)</label>
              <input type="text" id="stu-skills" class="form-control" placeholder="Python, React, SQL, AWS, Docker" required>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="adminModule.closeModal('add-student-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Student</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function saveSingleStudent(e) {
    e.preventDefault();
    const name = document.getElementById('stu-name').value.trim();
    const regNo = document.getElementById('stu-regno').value.trim().toUpperCase();
    const department = document.getElementById('stu-dept').value;
    const cgpa = parseFloat(document.getElementById('stu-cgpa').value);
    const email = document.getElementById('stu-email').value.trim().toLowerCase();
    const phone = document.getElementById('stu-phone').value.trim();
    const skills = document.getElementById('stu-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    window.bridgeStore.addStudent({
      name,
      regNo,
      department,
      academicYear: '2022-2026',
      cgpa,
      email,
      phone,
      skills,
      projectCount: 2,
      projects: [{ title: 'Capstone Project', tech: skills.slice(0, 3).join(', '), link: '#' }],
      certifications: ['Verified by Admin'],
      resumeUrl: `https://hiero.io/resumes/${name.toLowerCase().replace(/\s+/g, '-')}-2026.pdf`
    });

    closeModal('add-student-modal');
    window.app.showToast(`Student ${name} successfully added and verified.`, 'success');
    renderAdminDashboard();
  }

  function viewStudentProfile(id) {
    const student = window.bridgeStore.getStudentById(id);
    if (!student) return;

    const modalHtml = `
      <div class="modal-backdrop open" id="profile-modal">
        <div class="modal-content" style="max-width: 650px;">
          <button class="modal-close" onclick="adminModule.closeModal('profile-modal')">✕</button>
          
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);">
            <div class="avatar" style="width: 54px; height: 54px; font-size: 1.25rem;">${student.avatar || 'ST'}</div>
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 800;">${student.name}</h2>
              <div style="font-size: 0.85rem; color: var(--text-dim);">
                ${student.regNo} • ${student.department} (${student.academicYear})
              </div>
            </div>
            <span class="badge badge-open" style="margin-left: auto;">${student.verificationStatus}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="criteria-item" style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: var(--radius-sm);">
              <span style="color: var(--text-dim); font-size: 0.75rem;">Verified CGPA</span>
              <strong style="color: var(--success); font-size: 1.25rem;">${Number(student.cgpa).toFixed(2)}</strong>
            </div>
            <div class="criteria-item" style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: var(--radius-sm);">
              <span style="color: var(--text-dim); font-size: 0.75rem;">Placement Status</span>
              <strong style="color: var(--primary-light); font-size: 1.1rem;">${student.placementStatus}</strong>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Technical & Domain Skills</div>
            <div class="skills-pill-wrap">
              ${student.skills.map(sk => `<span class="skill-pill matched">${sk}</span>`).join('')}
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Evidence & Verified Projects (${student.projects?.length || 0})</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(student.projects || []).map(p => `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
                  <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${p.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">Tech: ${p.tech}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Certifications</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              ${(student.certifications || []).join(' • ') || 'None'}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border);">
            <a href="${student.resumeUrl}" target="_blank" class="btn btn-secondary btn-sm" onclick="event.preventDefault(); window.app.showToast('Viewing verified collegiate resume: ' + '${student.name}', 'info');">
              📄 View Verified Resume
            </a>
            <button class="btn btn-primary btn-sm" onclick="adminModule.closeModal('profile-modal')">Close</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  return {
    init,
    renderAdminDashboard,
    filterStudentTable,
    toggleVerification,
    deleteStudent,
    openCollegeModal,
    saveCollegeProfile,
    openAddDeptModal,
    saveNewDept,
    openImportModal,
    handleFileSelect,
    loadSampleCSV,
    confirmBulkImport,
    openAddStudentModal,
    saveSingleStudent,
    viewStudentProfile,
    closeModal
  };
})();
