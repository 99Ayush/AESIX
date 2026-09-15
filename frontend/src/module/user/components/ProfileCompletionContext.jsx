import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/userApi';

// ─── Fields required for a complete profile ───────────────────────────────────
export function getMissingProfileFields({ profile, storedUser }) {
  const fields = [
    {
      key: 'name',
      label: 'Full Name',
      value:
        profile?.fullName || profile?.name ||
        storedUser?.fullName ||
        (storedUser?.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : ''),
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      value: profile?.dateOfBirth || profile?.dob || storedUser?.dob || storedUser?.dateOfBirth,
    },
    {
      key: 'gender',
      label: 'Gender',
      value: profile?.gender || storedUser?.gender,
    },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      value: profile?.bloodGroup || storedUser?.bloodGroup,
    },
    {
      key: 'phone',
      label: 'Phone Number',
      value:
        profile?.phone || profile?.mobile || profile?.contact?.phone ||
        storedUser?.mobile || storedUser?.phone,
    },
    {
      key: 'email',
      label: 'Email Address',
      value: profile?.email || profile?.contact?.email || storedUser?.email,
    },
  ];
  return fields.filter(
    (f) => !f.value || String(f.value).trim() === '' || String(f.value).trim() === 'N/A'
  );
}

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext({
  // Profile
  isIncomplete: false,
  missingFields: [],
  // Doctor access requests
  accessRequests: [],
  pendingRequests: [],
  respondToRequest: async () => {},
  // Consent requests
  consentRequests: [],
  // Total count (badge)
  totalCount: 0,
  // Force refresh
  recheck: () => {},
});

export function NotificationProvider({ children }) {
  const [missingFields, setMissingFields]     = useState([]);
  const [accessRequests, setAccessRequests]   = useState([]);
  const [consentRequests, setConsentRequests] = useState([]);

  // ── Profile completeness check ──
  const checkProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setMissingFields([]); return; }
    try {
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user_profile') || '{}'); } catch { return {}; }
      })();
      const dash = await userApi.dashboard();
      setMissingFields(getMissingProfileFields({ profile: dash?.profile, storedUser }));
    } catch {
      setMissingFields([]);
    }
  }, []);

  // ── Doctor access requests ──
  const loadAccessRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setAccessRequests([]); return; }
    try {
      const res = await userApi.getAccessRequests();
      setAccessRequests(res || []);
    } catch {
      setAccessRequests([]);
    }
  }, []);

  // ── Consent requests from doctors (pending only) ──
  const loadConsentRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setConsentRequests([]); return; }
    try {
      const res = await userApi.getAccessRequests();
      // Consent requests = access requests that are pending (doctor wants consent)
      // We show them as "consent reminder" type separately
      const pending = (res || []).filter((r) => r.status === 'pending');
      setConsentRequests(pending);
    } catch {
      setConsentRequests([]);
    }
  }, []);

  const recheck = useCallback(async () => {
    await Promise.all([checkProfile(), loadAccessRequests()]);
    // consentRequests are derived from accessRequests, no extra call needed
  }, [checkProfile, loadAccessRequests]);

  // ── Respond to a doctor's access/consent request ──
  const respondToRequest = useCallback(async (id, status) => {
    try {
      await userApi.respondAccessRequest(id, status);
      await loadAccessRequests();
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  }, [loadAccessRequests]);

  // ── Initial load ──
  useEffect(() => {
    checkProfile();
    loadAccessRequests();
  }, [checkProfile, loadAccessRequests]);

  // ── Poll access requests every 4s (same cadence as original dashboard) ──
  useEffect(() => {
    const interval = setInterval(loadAccessRequests, 4000);
    return () => clearInterval(interval);
  }, [loadAccessRequests]);

  // ── Poll profile completeness every 30s ──
  useEffect(() => {
    const interval = setInterval(checkProfile, 30000);
    return () => clearInterval(interval);
  }, [checkProfile]);

  // ── Re-check on localStorage change (after basicInfo save) ──
  useEffect(() => {
    const handler = () => checkProfile();
    window.addEventListener('storage', handler);
    window.addEventListener('profile-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('profile-updated', handler);
    };
  }, [checkProfile]);

  // ── Derive values ──
  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');

  // Total badge count:
  //   1 for incomplete profile (if any)
  //   + each pending doctor access request (shown once, covers both access + consent)
  const totalCount = (missingFields.length > 0 ? 1 : 0) + pendingRequests.length;

  return (
    <NotificationContext.Provider
      value={{
        isIncomplete: missingFields.length > 0,
        missingFields,
        accessRequests,
        pendingRequests,
        respondToRequest,
        consentRequests: pendingRequests, // alias — pending requests also need consent
        totalCount,
        recheck,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

// Backward-compat aliases used by App.jsx, etc.
export const ProfileCompletionProvider = NotificationProvider;
export const useProfileCompletion = useNotifications;
export const ProfileCompletionContext = NotificationContext;
export { NotificationContext };

