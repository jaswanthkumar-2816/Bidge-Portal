/**
 * HIERO Bridge — Authentication & Session Controller
 * Provides active session data and role handling for the Academic Portal.
 */

window.hieroAuth = (function () {
  'use strict';

  const STORAGE_KEY_TOKEN = 'hiero_bridge_token';
  const STORAGE_KEY_USER = 'hiero_bridge_user';

  const DEMO_PERSONAS = {
    coordinator: {
      role: 'coordinator',
      name: 'Dr. Ramesh Kulkarni',
      title: 'Training & Placement Officer (TPO)',
      email: 'ramesh.tpo@college.edu',
      institution: 'NIT Warangal'
    },
    admin: {
      role: 'admin',
      name: 'Dr. V. Prasad',
      title: 'Principal / Institutional Administrator',
      email: 'principal@college.edu',
      institution: 'NIT Warangal'
    },
    student: {
      role: 'student',
      name: 'Aarav Sharma',
      title: 'Final-Year Computer Science & Engineering',
      email: 'aarav.sharma@college.edu',
      regNo: '2022CSE045',
      department: 'CSE'
    }
  };

  function init() {
    setupLogoutHandlers();
  }

  function setupLogoutHandlers() {
    document.querySelectorAll('.btn-hiero-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  }

  function logout() {
    // Reset to default coordinator session and switch view cleanly
    const defaultUser = DEMO_PERSONAS.coordinator;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
    
    if (window.app && typeof window.app.switchRole === 'function') {
      window.app.switchRole('coordinator');
    }
    showToast('Session refreshed: Placement Ops Hub active.', 'info');
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('hiero-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'hiero-toast-container';
      container.className = 'hiero-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `hiero-toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-dot"></div>
      <div class="toast-text">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // Auto-run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    logout,
    showToast,
    getCurrentUser: () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return DEMO_PERSONAS.coordinator;
    },
    setCurrentUser: (user) => {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    },
    isAuthenticated: () => true
  };
})();
