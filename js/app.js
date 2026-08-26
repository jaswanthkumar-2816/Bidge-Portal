/**
 * HIERO BRIDGE - Master Application Router & Navigation Coordinator
 */

window.app = (function () {
  let currentRole = 'coordinator'; // Default landing role: coordinator | admin | student

  async function init() {
    // Check connection to live Backend REST API on Port 5050
    if (window.bridgeApi && typeof window.bridgeApi.checkBackendHealth === 'function') {
      await window.bridgeApi.checkBackendHealth();
    }

    // Check URL parameters for deep links
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const oppIdParam = params.get('oppId');
    const appIdParam = params.get('appId');

    // Subscribe modules to state changes
    window.bridgeStore.subscribe((state) => {
      updateHeaderStats(state);
    });

    if (viewParam === 'admin') {
      switchRole('admin');
    } else if (viewParam === 'student' || viewParam === 'apply') {
      switchRole('student');
      if (oppIdParam) {
        setTimeout(() => {
          window.studentModule.openOpportunityDetails(oppIdParam);
        }, 300);
      }
    } else if (viewParam === 'interview') {
      switchRole('student');
      if (appIdParam && oppIdParam) {
        setTimeout(() => {
          window.interviewModule.launchInterview(appIdParam, oppIdParam);
        }, 300);
      }
    } else {
      switchRole('coordinator');
    }
  }

  function switchRole(role) {
    currentRole = role;

    // Update Role Picker dropdown in sidebar
    const roleSelect = document.getElementById('role-select-input');
    if (roleSelect) roleSelect.value = role;

    // Update navigation menu highlighting
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.role === role) {
        item.classList.add('active');
      }
    });

    // Toggle view containers
    const adminView = document.getElementById('admin-view-container');
    const coordView = document.getElementById('coordinator-view-container');
    const studentView = document.getElementById('student-view-container');

    if (adminView) adminView.style.display = role === 'admin' ? 'block' : 'none';
    if (coordView) coordView.style.display = role === 'coordinator' ? 'block' : 'none';
    if (studentView) studentView.style.display = role === 'student' ? 'block' : 'none';

    // Update Header Avatar & Role Pill
    const userRolePill = document.getElementById('header-role-pill');
    const userName = document.getElementById('header-user-name');
    const userAvatar = document.getElementById('header-user-avatar');

    if (role === 'admin') {
      if (userRolePill) userRolePill.innerText = 'Administrator';
      if (userName) userName.innerText = 'Dr. V. Prasad (Principal/Admin)';
      if (userAvatar) userAvatar.innerText = 'AD';
      window.adminModule.renderAdminDashboard();
    } else if (role === 'coordinator') {
      if (userRolePill) userRolePill.innerText = 'Placement Coordinator';
      if (userName) userName.innerText = 'Dr. Ramesh Kulkarni (TPO)';
      if (userAvatar) userAvatar.innerText = 'TP';
      window.coordinatorModule.renderCoordinatorDashboard();
    } else if (role === 'student') {
      if (userRolePill) userRolePill.innerText = 'Final-Year Student';
      if (userName) userName.innerText = 'Aarav Sharma (2022CSE045)';
      if (userAvatar) userAvatar.innerText = 'AS';
      window.studentModule.renderStudentDashboard();
    }
  }

  function updateHeaderStats(state) {
    const instName = document.getElementById('header-inst-name');
    if (instName && state.college) {
      instName.innerText = state.college.name;
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '✕';

    toast.innerHTML = `
      <span style="font-size: 1.1rem; color: ${type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : 'var(--primary-light)')};">${icon}</span>
      <div style="flex: 1; color: #fff;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function resetAllData() {
    if (confirm('Reset entire HIERO Bridge database to default initial state?')) {
      window.bridgeStore.resetState();
      showToast('All data has been reset to default state.', 'success');
      switchRole(currentRole);
    }
  }

  function openEcosystemMapModal() {
    const modalHtml = `
      <div class="modal-backdrop open" id="ecosystem-map-modal">
        <div class="modal-content" style="max-width: 850px;">
          <button class="modal-close" onclick="document.getElementById('ecosystem-map-modal').remove()">✕</button>
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <span class="badge badge-recruiter" style="margin-bottom: 0.5rem;">HIERO Unified Architecture</span>
            <h2 style="font-size: 1.6rem; font-weight: 800;">HIERO Ecosystem Architecture</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Industry Creates Opportunity → Academia Identifies & Shortlists Talent → HIERO Measures & Improves Competency
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; text-align: center; gap: 1rem; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 180px; background: rgba(93, 93, 255, 0.08); border: 1px solid var(--primary); padding: 1.25rem; border-radius: var(--radius-md);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary-light); font-weight: 700;">1. Industry Gateway</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO CONNECT</h4>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Recruiters create & publish opportunities</div>
              </div>

              <div style="color: var(--primary-light); font-size: 1.5rem; font-weight: 800;">➔</div>

              <div style="flex: 1; min-width: 180px; background: rgba(255, 93, 207, 0.08); border: 1px solid var(--secondary); padding: 1.25rem; border-radius: var(--radius-md);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: #ff85da; font-weight: 700;">2. Academia Gateway</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO BRIDGE</h4>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Verified Final-Year pool & Coordinator filter</div>
              </div>

              <div style="color: var(--secondary); font-size: 1.5rem; font-weight: 800;">➔</div>

              <div style="flex: 1; min-width: 180px; background: rgba(16, 185, 129, 0.08); border: 1px solid var(--success); padding: 1.25rem; border-radius: var(--radius-md);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--success); font-weight: 700;">3. Evaluation & Practice</div>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO AI PRACTICE</h4>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Voice mock interview & continuous improvement</div>
              </div>
            </div>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">
            <strong>Core Product USP:</strong> HIERO Bridge turns a college's verified final-year student pool into a structured, opportunity-ready talent pipeline for industry without duplicating job portal mechanics.
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="document.getElementById('ecosystem-map-modal').remove()">Close Architecture Map</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;
  }

  return {
    init,
    switchRole,
    showToast,
    resetAllData,
    openEcosystemMapModal
  };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
