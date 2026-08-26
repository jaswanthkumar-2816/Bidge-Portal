/**
 * HIERO Bridge — Master Application Router & Spatial Controller
 */

window.app = (function () {
  let currentRole = 'coordinator'; // Default landing role: coordinator | admin | student

  async function init() {
    // 1. Run Luxury Logo Startup Preloader Animation
    runPreloaderSequence();

    // 2. Check connection to live Backend REST API
    if (window.bridgeApi && typeof window.bridgeApi.checkBackendHealth === 'function') {
      await window.bridgeApi.checkBackendHealth();
    }

    // 3. Check URL parameters for deep links
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const oppIdParam = params.get('oppId');
    const appIdParam = params.get('appId');

    if (viewParam && ['coordinator', 'admin', 'student'].includes(viewParam)) {
      switchRole(viewParam);
    } else {
      switchRole(currentRole);
    }

    if (oppIdParam && currentRole === 'coordinator') {
      setTimeout(() => {
        if (window.coordinatorModule) coordinatorModule.openScreeningWorkspace(oppIdParam);
      }, 400);
    }
  }

  // Preloader Startup Telemetry Sequence
  function runPreloaderSequence() {
    const preloader = document.getElementById('hiero-preloader');
    const fill = document.getElementById('preloader-progress-fill');
    const statusText = document.getElementById('preloader-status-text');
    const percentage = document.getElementById('preloader-percentage');

    if (!preloader || !fill) return;

    const steps = [
      { pct: 25, msg: 'Initializing Spatial Gateway & Port 2410...' },
      { pct: 60, msg: 'Connecting Verified Talent Pool (NIT Warangal)...' },
      { pct: 85, msg: 'Calibrating 3D Ecosystem Matrix...' },
      { pct: 100, msg: 'Spatial Operating Hub Ready.' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const item = steps[stepIdx];
        fill.style.width = `${item.pct}%`;
        if (statusText) statusText.textContent = item.msg;
        if (percentage) percentage.textContent = `${item.pct}%`;
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add('fade-out');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 600);
        }, 300);
      }
    }, 180);
  }

  function switchRole(role) {
    currentRole = role;

    // Update Role Selector dropdown in sidebar
    const select = document.getElementById('role-select-input');
    if (select) select.value = role;

    // Update active nav-item highlighting in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-role') === role) {
        item.classList.add('active');
      } else if (item.getAttribute('data-role')) {
        item.classList.remove('active');
      }
    });

    // Update Header User Badge according to Role Persona
    updateHeaderUserBadge(role);

    // Hide all view containers
    const coordContainer = document.getElementById('coordinator-view-container');
    const adminContainer = document.getElementById('admin-view-container');
    const studentContainer = document.getElementById('student-view-container');

    if (coordContainer) coordContainer.style.display = 'none';
    if (adminContainer) adminContainer.style.display = 'none';
    if (studentContainer) studentContainer.style.display = 'none';

    // Render corresponding module view
    if (role === 'coordinator') {
      if (coordContainer) {
        coordContainer.style.display = 'block';
        if (window.coordinatorModule) coordinatorModule.render();
      }
    } else if (role === 'admin') {
      if (adminContainer) {
        adminContainer.style.display = 'block';
        if (window.adminModule) adminModule.render();
      }
    } else if (role === 'student') {
      if (studentContainer) {
        studentContainer.style.display = 'block';
        if (window.studentModule) studentModule.render();
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateHeaderUserBadge(role) {
    const avatar = document.getElementById('header-user-avatar');
    const userName = document.getElementById('header-user-name');
    const rolePill = document.getElementById('header-role-pill');

    if (role === 'coordinator') {
      if (avatar) avatar.textContent = 'TP';
      if (userName) userName.textContent = 'Dr. Ramesh Kulkarni (TPO)';
      if (rolePill) rolePill.textContent = 'Placement Coordinator';
    } else if (role === 'admin') {
      if (avatar) avatar.textContent = 'AD';
      if (userName) userName.textContent = 'Dr. V. Prasad (Principal/Admin)';
      if (rolePill) rolePill.textContent = 'College Administrator';
    } else if (role === 'student') {
      const activeStudent = window.bridgeStore ? window.bridgeStore.getActiveStudent() : null;
      if (avatar) avatar.textContent = activeStudent ? activeStudent.avatar : 'AS';
      if (userName) userName.textContent = activeStudent ? `${activeStudent.name} (${activeStudent.regNo})` : 'Aarav Sharma';
      if (rolePill) rolePill.textContent = 'Final-Year Student';
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '🌿';
    if (type === 'success') icon = '✓';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '✕';

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
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
        <div class="modal-content" style="max-width: 920px;">
          <button class="modal-close" onclick="document.getElementById('ecosystem-map-modal').remove()">✕</button>
          
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div class="hero-tag" style="margin-bottom: 0.5rem;">HIERO SPATIAL ARCHITECTURE</div>
            <h2 style="font-size: 1.8rem; font-weight: 800; color: #fff;">Ecosystem Placement Matrix</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Industry Creates Opportunity ──► Academia Filters & Shortlists ──► HIERO AI Evaluates & Upskills
            </p>
          </div>

          <!-- 3D Ecosystem Visualization Mount -->
          <div class="spatial-3d-wrapper" style="margin-bottom: 1.5rem;">
            <div class="spatial-3d-header">
              <div class="spatial-3d-title-block">
                <div class="kpi-icon-box" style="width: 32px; height: 32px;">🌐</div>
                <div>
                  <div class="spatial-3d-title" style="font-size: 1rem;">Live 3D Topological Matrix</div>
                  <div class="spatial-3d-sub">Hover over any node to inspect data channels</div>
                </div>
              </div>
              <button class="btn-3d-ctrl" onclick="hieroEcosystem3D.toggleRotation()">
                ↻ Toggle Orbit
              </button>
            </div>
            <div id="modal-ecosystem-canvas-mount" style="height: 320px; cursor: grab;"></div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1.25rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-cyan); font-weight: 800;">1. Industry Gateway</div>
              <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO CONNECT</h4>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Recruiters create opportunities & receive shortlists</div>
            </div>

            <div style="background: rgba(0, 255, 135, 0.08); border: 1px solid rgba(0, 255, 135, 0.3); padding: 1.25rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--primary); font-weight: 800;">2. Academia Gateway</div>
              <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO BRIDGE</h4>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Verified Talent Pool & Coordinator screening</div>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.25rem; border-radius: var(--radius-md);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--success); font-weight: 800;">3. Evaluation & Practice</div>
              <h4 style="font-size: 1.1rem; font-weight: 800; margin: 4px 0; color: #fff;">HIERO AI VOICE</h4>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Voice mock interview & 5-pillar scorecard</div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" onclick="document.getElementById('ecosystem-map-modal').remove()">Close Architecture Matrix</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-root').innerHTML = modalHtml;

    // Initialize 3D ecosystem in modal
    setTimeout(() => {
      if (window.hieroEcosystem3D) {
        hieroEcosystem3D.init('modal-ecosystem-canvas-mount', { height: 320 });
      }
    }, 100);
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
