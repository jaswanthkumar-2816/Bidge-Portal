/**
 * HIERO Bridge — Master Application Router & Spatial Controller
 */

window.app = (function () {
  let currentRole = 'coordinator'; // Default landing role: coordinator | admin | student

  // Initialize interactive motion replay for the Hero Brand Logo
  function initHeroLogoMotion() {
    const heroLogoFrame = document.getElementById('hero-logo-frame');
    if (!heroLogoFrame) return;

    heroLogoFrame.addEventListener('click', () => {
      const img = heroLogoFrame.querySelector('.approved-hiero-hero-img');
      const shockwaves = heroLogoFrame.querySelectorAll('.logo-reveal-shockwave');
      const sheen = heroLogoFrame.querySelector('.logo-sheen-sweep-layer');
      const glow = heroLogoFrame.querySelector('.logo-ambient-green-glow');

      if (img) {
        img.style.animation = 'none';
        void img.offsetWidth; // Force reflow
        img.style.animation = 'discordLogoReveal 1.25s cubic-bezier(0.34, 1.56, 0.64, 1) both, heroBiomorphicFloat 6s ease-in-out 1.35s infinite alternate';
      }
      shockwaves.forEach((sw, idx) => {
        sw.style.animation = 'none';
        void sw.offsetWidth;
        sw.style.animation = `logoShockwave ${idx === 0 ? '1.1s' : '1.25s'} cubic-bezier(0.16, 1, 0.3, 1) ${idx === 0 ? '0.32s' : '0.48s'} both`;
      });
      if (sheen) {
        const sheenBefore = sheen.querySelector('::before');
        sheen.style.display = 'none';
        void sheen.offsetWidth;
        sheen.style.display = '';
      }
      if (glow) {
        glow.style.animation = 'none';
        void glow.offsetWidth;
        glow.style.animation = 'ambientGlowBloom 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both';
      }
    });
  }

  // Discord-Style Animated Logo Reveal on Page Load/Reload
  function runSplashLogoReveal() {
    const splash = document.getElementById('hiero-splash-reveal');
    if (!splash) return;

    // Hold the reveal sequence cleanly for 1.15s, then seamlessly dissolve into the dashboard
    setTimeout(() => {
      splash.classList.add('dismissed');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 550);
    }, 1150);
  }

  async function init() {
    runSplashLogoReveal();
    const appContainer = document.getElementById('app-container');
    document.body.classList.add('authenticated');

    if (appContainer) {
      appContainer.style.display = 'flex';
      appContainer.style.opacity = '1';
      appContainer.style.transform = 'none';
      appContainer.style.left = '0';
    }

    // Check URL parameters for view or explicit roles
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'apply') {
      const oppId = params.get('oppId');
      window.location.replace(`/apply${oppId ? '?oppId=' + encodeURIComponent(oppId) : ''}`);
      return;
    }
    const viewParam = params.get('view') || params.get('role');
    const oppIdParam = params.get('oppId');
    const appIdParam = params.get('appId');

    // Check connection to live Backend REST API
    if (window.bridgeApi && typeof window.bridgeApi.checkBackendHealth === 'function') {
      await window.bridgeApi.checkBackendHealth();
    }

    const storedUser = window.hieroAuth ? window.hieroAuth.getCurrentUser() : null;
    const initialRole = viewParam && ['coordinator', 'admin', 'student'].includes(viewParam)
      ? viewParam
      : (storedUser && storedUser.role ? storedUser.role : currentRole);

    switchRole(initialRole);

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
      { pct: 85, msg: 'Calibrating Talent Intelligence Engine...' },
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

    // Update active horizontal top-nav-tab and nav-items
    document.querySelectorAll('.top-nav-tab, .nav-item').forEach(item => {
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
        if (window.coordinatorModule) {
          if (typeof coordinatorModule.renderCoordinatorDashboard === 'function') {
            coordinatorModule.renderCoordinatorDashboard();
          } else if (typeof coordinatorModule.init === 'function') {
            coordinatorModule.init();
          }
        }
      }
    } else if (role === 'admin') {
      if (adminContainer) {
        adminContainer.style.display = 'block';
        if (window.adminModule) {
          if (typeof adminModule.renderAdminDashboard === 'function') {
            adminModule.renderAdminDashboard();
          } else if (typeof adminModule.init === 'function') {
            adminModule.init();
          }
        }
      }
    } else if (role === 'student') {
      if (studentContainer) {
        studentContainer.style.display = 'block';
        if (window.studentModule) {
          if (typeof studentModule.renderStudentDashboard === 'function') {
            studentModule.renderStudentDashboard();
          } else if (typeof studentModule.init === 'function') {
            studentModule.init();
          }
        }
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateHeaderUserBadge(role) {
    const avatar = document.getElementById('header-user-avatar');
    const userName = document.getElementById('header-user-name');
    const rolePill = document.getElementById('header-role-pill');

    const flyoutAvatar = document.getElementById('flyout-user-avatar');
    const flyoutName = document.getElementById('flyout-user-name');
    const flyoutEmail = document.getElementById('flyout-user-email');
    const flyoutRole = document.getElementById('flyout-role-badge');
    const flyoutInst = document.getElementById('flyout-inst-tag');

    const college = window.bridgeStore ? window.bridgeStore.state.college : { name: 'NIT Warangal' };
    const instShort = college?.code || 'NIT Warangal';

    if (role === 'coordinator') {
      if (avatar) avatar.textContent = 'TP';
      if (userName) userName.textContent = 'Dr. Ramesh Kulkarni (TPO)';
      if (rolePill) rolePill.textContent = 'Placement Coordinator';

      if (flyoutAvatar) flyoutAvatar.textContent = 'TP';
      if (flyoutName) flyoutName.textContent = 'Dr. Ramesh Kulkarni';
      if (flyoutEmail) flyoutEmail.textContent = 'tpo@nitw.ac.in';
      if (flyoutRole) flyoutRole.textContent = 'Placement Coordinator';
      if (flyoutInst) flyoutInst.textContent = instShort;
    } else if (role === 'admin') {
      if (avatar) avatar.textContent = 'AD';
      if (userName) userName.textContent = 'Dr. V. Prasad (Principal/Admin)';
      if (rolePill) rolePill.textContent = 'College Administrator';

      if (flyoutAvatar) flyoutAvatar.textContent = 'AD';
      if (flyoutName) flyoutName.textContent = 'Dr. V. Prasad';
      if (flyoutEmail) flyoutEmail.textContent = 'principal@nitw.ac.in';
      if (flyoutRole) flyoutRole.textContent = 'College Administrator';
      if (flyoutInst) flyoutInst.textContent = instShort;
    } else if (role === 'student') {
      const activeStudent = window.bridgeStore ? window.bridgeStore.getActiveStudent() : null;
      const initials = activeStudent ? (activeStudent.avatar || 'AS') : 'AS';
      const studentName = activeStudent ? activeStudent.name : 'Aarav Sharma';
      const regNo = activeStudent ? activeStudent.regNo : '2022CS104';
      const email = activeStudent ? activeStudent.email : 'aarav.sharma@student.nitw.ac.in';

      if (avatar) avatar.textContent = initials;
      if (userName) userName.textContent = `${studentName} (${regNo})`;
      if (rolePill) rolePill.textContent = 'Final-Year Student';

      if (flyoutAvatar) flyoutAvatar.textContent = initials;
      if (flyoutName) flyoutName.textContent = studentName;
      if (flyoutEmail) flyoutEmail.textContent = email;
      if (flyoutRole) flyoutRole.textContent = 'Final-Year Student';
      if (flyoutInst) flyoutInst.textContent = `${instShort} • ${regNo}`;
    }

    // Update active check on flyout role items
    document.querySelectorAll('.flyout-role-item').forEach(item => {
      if (item.getAttribute('data-role') === role) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // --- Profile Dropdown Handlers ---
  function toggleProfileDropdown(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const wrapper = document.getElementById('profile-dropdown-wrapper');
    const btn = document.getElementById('user-profile-btn');
    if (!wrapper) return;

    const isOpen = wrapper.classList.toggle('open');
    if (btn) {
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }

  function closeProfileDropdown() {
    const wrapper = document.getElementById('profile-dropdown-wrapper');
    const btn = document.getElementById('user-profile-btn');
    if (wrapper) {
      wrapper.classList.remove('open');
    }
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function switchRoleFromDropdown(role) {
    closeProfileDropdown();
    switchRole(role);
  }

  function openConnectSyncDrawer() {
    if (window.connectSyncModule && typeof window.connectSyncModule.openConnectSyncModal === 'function') {
      window.connectSyncModule.openConnectSyncModal();
    } else if (window.connectSyncModule && typeof window.connectSyncModule.init === 'function') {
      window.connectSyncModule.init();
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('hiero-toast-container') || document.getElementById('toast-container');
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

  // Close dropdown on outside click or ESC key
  document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('profile-dropdown-wrapper');
    if (wrapper && wrapper.classList.contains('open')) {
      if (!wrapper.contains(e.target)) {
        closeProfileDropdown();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProfileDropdown();
    }
  });

  return {
    init,
    switchRole,
    switchRoleFromDropdown,
    toggleProfileDropdown,
    closeProfileDropdown,
    openConnectSyncDrawer,
    updateHeaderUserBadge,
    showToast,
    resetAllData
  };
})();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
