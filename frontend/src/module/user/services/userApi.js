const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body.data;
}

export const userApi = {
  dashboard: () => request('/users/dashboard'),
  profile: () => request('/users/profile'),
  getUserById: (id) => request(`/users/${id}`),
  saveProfile: async (data) => {
    const token = localStorage.getItem('token');
    const isFormData = data instanceof FormData;
    const response = await fetch(`${baseUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? data : JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Failed to update profile');
    return body.data || body;
  },
  abha: () => request('/users/abha'),
  consents: () => request('/users/consents'),
  setConsentStatus: (id, status) => request(`/users/consents/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  documents: () => request('/users/documents'),
  uploadDocument: (data) => request('/users/documents', { method: 'POST', body: JSON.stringify(data) }),
  importCloudDocument: (source, url) => request('/users/documents/import-cloud', { method: 'POST', body: JSON.stringify({ source, url }) }),
  deleteDocument: (id) => request(`/users/documents/${id}`, { method: 'DELETE' }),
  downloadUrl: (id) => `${baseUrl}/users/documents/${id}/download`,
  searchNamaste: (q) => request(`/users/cdss/search/namaste?q=${encodeURIComponent(q || '')}`),
  searchICD11: (q) => request(`/users/cdss/search/icd11?q=${encodeURIComponent(q || '')}`),
  getDiseaseRecord: (code, entityUri) => request(`/users/cdss/disease/${encodeURIComponent(code)}${entityUri ? `?entityUri=${encodeURIComponent(entityUri)}` : ''}`),
  getIcdToNamaste: (code, title) => request(`/users/cdss/mapping/icd/${encodeURIComponent(code)}${title ? `?title=${encodeURIComponent(title)}` : ''}`),
  getNamasteToIcd: (code) => request(`/users/cdss/mapping/namaste/${encodeURIComponent(code)}`),
  submitSocratesForm: async (formData) => {
    const token = localStorage.getItem('token');
    const storedUser = readLocalJSON('user_profile', {});
    const userId = storedUser?.userId || storedUser?.id || storedUser?._id;
    const abhaNumber = storedUser?.abhaNumber || storedUser?.abhaId;

    const response = await fetch(`${baseUrl}/users/socrates`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(abhaNumber ? { 'x-abha-number': abhaNumber } : {}),
      },
      body: formData
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Failed to submit SOCRATES form');
    return body;
  },
  getSocratesHistory: async () => {
    const token = localStorage.getItem('token');
    const storedUser = readLocalJSON('user_profile', {});
    const userId = storedUser?.userId || storedUser?.id || storedUser?._id;
    const abhaNumber = storedUser?.abhaNumber || storedUser?.abhaId;

    const response = await fetch(`${baseUrl}/users/socrates`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(abhaNumber ? { 'x-abha-number': abhaNumber } : {}),
      }
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Failed to fetch SOCRATES history');
    return body;
  },
  getAccessRequests: () => request('/users/access-requests'),
  respondAccessRequest: (id, status) => request(`/users/access-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAccessLogs: () => request('/users/access-logs'),
};


export async function fileToBase64(file) {
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  buffer.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

// Poisoned localStorage (e.g. a half-written profile) must never white-screen
// a page: every read goes through this guarded helper.
export function readLocalJSON(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
