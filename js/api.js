/**
 * HIERO Bridge - Central Frontend API Client
 * Connects Frontend UI to Backend REST API (http://localhost:5050/api)
 * Automatically falls back to client-side store when running in offline/standalone mode.
 */

window.bridgeApi = (function () {
  const BASE_URL = (typeof window !== 'undefined' && window.location.origin) 
    ? `${window.location.origin}/api` 
    : 'http://localhost:2410/api';
  let isBackendOnline = false;

  // Check backend server availability on startup
  async function checkBackendHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        isBackendOnline = true;
        console.log('🌿 Connected to Unified HIERO Bridge Gateway API:', data);
        return true;
      }
    } catch (e) {
      isBackendOnline = false;
      console.log('ℹ️ Running in standalone mode (using local client store)');
    }
    return false;
  }

  // Generic Request Helper
  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultHeaders = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      });
      return await response.json();
    } catch (err) {
      console.warn(`API call failed for ${endpoint}, falling back to client store:`, err);
      throw err;
    }
  }

  return {
    checkBackendHealth,
    isOnline: () => isBackendOnline,

    // === Admin API ===
    getCollege: async () => {
      if (isBackendOnline) {
        const res = await request('/admin/college');
        return res.college;
      }
      return window.bridgeStore.state.college;
    },

    updateCollege: async (updates) => {
      if (isBackendOnline) {
        const res = await request('/admin/college', { method: 'PUT', body: JSON.stringify(updates) });
        return res.college;
      }
      window.bridgeStore.updateCollegeProfile(updates);
      return window.bridgeStore.state.college;
    },

    getStudents: async (params = {}) => {
      if (isBackendOnline) {
        const query = new URLSearchParams(params).toString();
        const res = await request(`/admin/students?${query}`);
        return res.students;
      }
      return window.bridgeStore.getStudents();
    },

    addStudent: async (student) => {
      if (isBackendOnline) {
        const res = await request('/admin/students', { method: 'POST', body: JSON.stringify(student) });
        return res.student;
      }
      return window.bridgeStore.addStudent(student);
    },

    deleteStudent: async (id) => {
      if (isBackendOnline) {
        return await request(`/admin/students/${id}`, { method: 'DELETE' });
      }
      window.bridgeStore.state.students = window.bridgeStore.state.students.filter(s => s.id !== id);
      window.bridgeStore.saveState();
    },

    validateBulkImport: async (formData) => {
      if (isBackendOnline) {
        return await request('/admin/students/bulk-import', { method: 'POST', body: formData });
      }
      return null;
    },

    confirmBulkImport: async (students) => {
      if (isBackendOnline) {
        return await request('/admin/students/confirm-import', { method: 'POST', body: JSON.stringify({ students }) });
      }
      window.bridgeStore.bulkAddStudents(students);
      return { success: true, importedCount: students.length };
    },

    // === Coordinator API ===
    getCoordinatorMetrics: async () => {
      if (isBackendOnline) {
        const res = await request('/coordinator/metrics');
        return res.metrics;
      }
      const students = window.bridgeStore.getStudents();
      const opps = window.bridgeStore.getOpportunities();
      const apps = window.bridgeStore.getApplications();
      return {
        totalStudents: students.length,
        activeJobs: opps.filter(o => o.state !== 'CLOSED').length,
        totalApplicants: apps.length,
        shortlisted: apps.filter(a => a.status === 'Shortlisted' || a.status === 'Sent to Recruiter').length,
        interviews: apps.filter(a => a.status === 'Interview').length,
        selected: apps.filter(a => a.status === 'Selected').length
      };
    },

    getOpportunities: async (params = {}) => {
      if (isBackendOnline) {
        const query = new URLSearchParams(params).toString();
        const res = await request(`/coordinator/opportunities?${query}`);
        return res.opportunities;
      }
      return window.bridgeStore.getOpportunities();
    },

    screenCandidates: async (oppId, filters) => {
      if (isBackendOnline) {
        return await request(`/coordinator/opportunities/${oppId}/screen`, { method: 'POST', body: JSON.stringify(filters) });
      }
      return null;
    },

    transmitShortlist: async (oppId, payload) => {
      if (isBackendOnline) {
        return await request(`/coordinator/opportunities/${oppId}/shortlist`, { method: 'POST', body: JSON.stringify(payload) });
      }
      return null;
    },

    // === Student API ===
    getStudentProfile: async (id) => {
      if (isBackendOnline) {
        return await request(`/student/profile/${id}`);
      }
      const s = window.bridgeStore.getStudentById(id);
      const apps = window.bridgeStore.getApplicationsByStudent(id);
      return { student: s, applications: apps };
    },

    getAvailableDrives: async (studentId) => {
      if (isBackendOnline) {
        const res = await request(`/student/drives?studentId=${studentId}`);
        return res.opportunities;
      }
      return window.bridgeStore.getOpportunities();
    },

    submitApplication: async (payload, file = null) => {
      if (isBackendOnline && file) {
        const formData = new FormData();
        formData.append('oppId', payload.oppId);
        formData.append('studentId', payload.studentId);
        formData.append('notes', payload.notes || '');
        formData.append('resume', file);
        return await request('/student/apply', { method: 'POST', body: formData });
      }
      return window.bridgeStore.submitApplication(payload);
    },

    // === Interview API ===
    evaluateInterview: async (payload) => {
      if (isBackendOnline) {
        const res = await request('/interview/evaluate', { method: 'POST', body: JSON.stringify(payload) });
        return res.evaluation;
      }
      return null;
    },

    // === Connect Sync API ===
    publishOpportunity: async (payload) => {
      if (isBackendOnline) {
        return await request('/connect/opportunities/publish', { method: 'POST', body: JSON.stringify(payload) });
      }
      return window.bridgeStore.addOpportunity(payload);
    },

    updateCandidateDecision: async (appId, status, notes) => {
      if (isBackendOnline) {
        return await request(`/connect/applications/${appId}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) });
      }
      return window.bridgeStore.updateApplicationStatus(appId, status, { recruiterFeedback: notes });
    }
  };
})();
