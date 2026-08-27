/**
 * HIERO Bridge — Authentication & Session Controller
 * Handles Login UI interactions, form validation, OAuth-ready handlers, and portal entry.
 */

window.hieroAuth = (function () {
  'use strict';

  const STORAGE_KEY_TOKEN = 'hiero_bridge_token';
  const STORAGE_KEY_USER = 'hiero_bridge_user';
  const STORAGE_KEY_REMEMBER = 'hiero_bridge_remember';

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
    setupPasswordToggle();
    setupFormValidation();
    setupSocialButtons();
    setupPersonaChips();
    setupModals();
    setupRememberMe();
    setupLogoutHandlers();
  }

  // 1. Password Visibility Toggle
  function setupPasswordToggle() {
    const toggleBtn = document.getElementById('password-toggle-btn');
    const passwordInput = document.getElementById('login-password');
    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';

      // Toggle Eye icon
      const eyeOpen = toggleBtn.querySelector('.eye-open');
      const eyeClosed = toggleBtn.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';
      }
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  // 2. Remember Me Persistence
  function setupRememberMe() {
    const rememberCheckbox = document.getElementById('remember-me-checkbox');
    const emailInput = document.getElementById('login-email');
    if (!rememberCheckbox || !emailInput) return;

    const savedEmail = localStorage.getItem(STORAGE_KEY_REMEMBER);
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberCheckbox.checked = true;
    }
  }

  // 3. Form Submission & Validation
  function setupFormValidation() {
    const form = document.getElementById('hiero-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      const rememberCheckbox = document.getElementById('remember-me-checkbox');
      const errorBox = document.getElementById('login-error-msg');
      const loginBtn = document.getElementById('login-submit-btn');

      if (errorBox) errorBox.style.display = 'none';

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (!email) {
        showError('Please enter your institution or student email address.');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!password) {
        showError('Please enter your account password.');
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (password.length < 4) {
        showError('Password must be at least 4 characters.');
        if (passwordInput) passwordInput.focus();
        return;
      }

      // Remember me storage
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem(STORAGE_KEY_REMEMBER, email);
      } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
      }

      // Determine persona / role from email or fallback to coordinator
      let matchedRole = 'coordinator';
      if (email.includes('admin') || email.includes('principal')) {
        matchedRole = 'admin';
      } else if (email.includes('student') || email.includes('aarav')) {
        matchedRole = 'student';
      }

      const userProfile = {
        ...DEMO_PERSONAS[matchedRole],
        email: email
      };

      // Button loading animation
      if (loginBtn) {
        loginBtn.classList.add('btn-loading');
        loginBtn.disabled = true;
      }

      try {
        // Authenticate via Gateway API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: matchedRole, email: email })
        }).catch(() => null);

        let data = null;
        if (response && response.ok) {
          data = await response.json();
        }

        const token = (data && data.token) || ('hiero_jwt_' + Date.now());
        const finalUser = (data && data.user) || userProfile;

        // Save session
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(finalUser));

        showToast(`Welcome, ${finalUser.name || 'User'}! Connecting to Hiero Bridge...`, 'success');

        // Transition to workspace
        setTimeout(() => {
          enterWorkspace(finalUser.role);
        }, 400);

      } catch (err) {
        console.warn('API Auth warning, using client fallback session:', err);
        localStorage.setItem(STORAGE_KEY_TOKEN, 'hiero_jwt_fallback');
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
        enterWorkspace(matchedRole);
      } finally {
        if (loginBtn) {
          loginBtn.classList.remove('btn-loading');
          loginBtn.disabled = false;
        }
      }
    });
  }

  // 4. Social Auth Buttons (Google & GitHub)
  function setupSocialButtons() {
    const googleBtn = document.getElementById('social-google-btn');
    const githubBtn = document.getElementById('social-github-btn');

    if (googleBtn) {
      googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleOAuth('google');
      });
    }

    if (githubBtn) {
      githubBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleOAuth('github');
      });
    }
  }

  function handleOAuth(provider) {
    const providerName = provider === 'google' ? 'Google Workspace' : 'GitHub Enterprise';
    
    // In production, window.location.href = `/api/auth/oauth/${provider}`
    // For development & evaluation demo:
    showToast(`OAuth Ready: Authenticating via ${providerName}...`, 'info');

    const user = {
      role: 'coordinator',
      name: provider === 'google' ? 'Google Authenticated TPO' : 'GitHub Contributor (TPO)',
      email: provider === 'google' ? 'coordinator.google@college.edu' : 'coordinator.github@college.edu',
      institution: 'NIT Warangal',
      authProvider: provider
    };

    localStorage.setItem(STORAGE_KEY_TOKEN, `oauth_${provider}_` + Date.now());
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    setTimeout(() => {
      showToast(`Authenticated via ${providerName}! Launching Dashboard...`, 'success');
      enterWorkspace(user.role);
    }, 700);
  }

  // 5. Quick Persona Selector Chips
  function setupPersonaChips() {
    document.querySelectorAll('.persona-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const role = chip.getAttribute('data-role');
        const persona = DEMO_PERSONAS[role];
        if (!persona) return;

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (emailInput) emailInput.value = persona.email;
        if (passwordInput) passwordInput.value = 'HieroSecure2026!';

        showToast(`Auto-filled credentials for ${persona.title}`, 'info');

        // Highlight chip
        document.querySelectorAll('.persona-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  // 6. Forgot Password & Sign-up Modals
  function setupModals() {
    const forgotLink = document.getElementById('forgot-password-link');
    const signupLink = document.getElementById('signup-link');

    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('forgot-password-modal');
      });
    }

    if (signupLink) {
      signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('signup-modal');
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
      el.addEventListener('click', () => {
        closeAllModals();
      });
    });

    // Handle Forgot Password Submit
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email-input').value;
        closeAllModals();
        showToast(`Password reset link dispatched to ${email || 'your email'}.`, 'success');
      });
    }

    // Handle Sign Up Submit
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeAllModals();
        showToast(`Institutional registration request submitted for review!`, 'success');
      });
    }
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.hiero-modal').forEach(m => m.classList.remove('active'));
    document.body.classList.remove('modal-open');
  }

  // 7. Logout Handlers in Dashboard Shell
  function setupLogoutHandlers() {
    document.querySelectorAll('.btn-hiero-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);

    document.body.classList.remove('authenticated');

    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');

    if (appContainer) {
      appContainer.style.opacity = '0';
      setTimeout(() => {
        appContainer.style.display = 'none';
        appContainer.style.transform = 'none';
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          loginScreen.style.display = 'flex';
          loginScreen.style.transform = 'none';
          loginScreen.style.opacity = '0';
          setTimeout(() => {
            loginScreen.style.opacity = '1';
          }, 40);
        }
      }, 200);
    }

    showToast('Signed out of Hiero Bridge.', 'info');
  }

  // 8. Transition from Login to Hiero Bridge Workspace
  function enterWorkspace(role = 'coordinator') {
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');

    if (!appContainer) return;

    // Mark body as authenticated immediately
    document.body.classList.add('authenticated');

    if (loginScreen) {
      loginScreen.classList.add('hidden');
      loginScreen.style.display = 'none';
      loginScreen.style.transform = 'none';
    }

    // Reveal Dashboard cleanly with zero transform and zero horizontal displacement
    appContainer.style.display = 'flex';
    appContainer.style.transform = 'none';
    appContainer.style.left = '0';
    appContainer.style.opacity = '0';
    appContainer.style.transition = 'opacity 0.25s ease';

    // Boot application router
    if (window.app && typeof window.app.switchRole === 'function') {
      window.app.switchRole(role);
    } else if (window.app && typeof window.app.init === 'function') {
      window.app.init();
    }

    setTimeout(() => {
      appContainer.style.opacity = '1';
      appContainer.style.transform = 'none';
    }, 40);
  }

  function showError(msg) {
    const box = document.getElementById('login-error-msg');
    if (box) {
      box.textContent = msg;
      box.style.display = 'flex';
    }
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
    login: enterWorkspace,
    logout,
    showToast,
    getCurrentUser: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
      } catch (e) {
        return null;
      }
    },
    isAuthenticated: () => !!localStorage.getItem(STORAGE_KEY_TOKEN)
  };
})();
