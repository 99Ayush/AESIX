const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(path, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
    if (response.status === 204) return null;
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body.data;
  } catch (err) {
    console.warn(`Doctor API request failed for ${path}`, err);
    return null;
  }
}

export const doctorApi = {
  /**
   * Search patients by ABHA ID from the real database
   */
  searchByAbha: async (abhaId = '') => {
    if (!abhaId || abhaId.trim().length < 2) return [];
    const result = await request(`/doctor/search-abha?abhaId=${encodeURIComponent(abhaId)}`);
    return result || [];
  },

  /**
   * Get patient profile from database
   */
  getPatientProfile: async (userId) => {
    return await request(`/doctor/patient-profile/${userId}`);
  },

  /**
   * Get SOCRATES forms list for a patient (metadata + consent status)
   */
  getPatientForms: async (userId) => {
    const result = await request(`/doctor/patient-forms/${userId}`);
    return result || [];
  },

  /**
   * Send a consent/access request for a specific form
   */
  requestFormAccess: async ({ patientId, patientAbha, formId, formSite }) => {
    return await request('/doctor/request-access', {
      method: 'POST',
      body: JSON.stringify({ patientId, patientAbha, formId, formSite }),
    });
  },

  /**
   * Get all consent requests made by this doctor
   */
  getMyRequests: async () => {
    const result = await request('/doctor/my-requests');
    return result || [];
  },

  /**
   * Get full SOCRATES form data (only works if consent is accepted)
   */
  getFormData: async (formId) => {
    return await request(`/doctor/form/${formId}`);
  },

  /**
   * Legacy: search patients (for directory/search bar)
   */
  searchPatients: async (query = '') => {
    // Use ABHA search as primary
    const results = await request(`/doctor/search-abha?abhaId=${encodeURIComponent(query)}`);
    return results || [];
  },

  /**
   * Legacy: get patient data (kept for backward compat)
   */
  getPatientData: async (patientId) => {
    const profile = await request(`/doctor/patient-profile/${patientId}`);
    if (profile) {
      return {
        patient: profile,
        consultationResults: [],
        alerts: [],
      };
    }
    return null;
  },
};
