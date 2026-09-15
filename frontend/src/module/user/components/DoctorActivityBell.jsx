import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { userApi } from '../services/userApi';
import { onDatabaseChange } from '../services/realtime';
import { useNotifications } from './ProfileCompletionContext';

const SEEN_KEY = 'doctor-activity-seen';
const ACCESS_LABEL = {
  'profile-view': 'viewed your profile',
  'forms-view': 'viewed your records',
  'form-view': 'viewed your form',
};

// Yellow activity bell: doctor-access logs + consent requests from doctors.
// Clicking a consent notification (or the footer) goes to the consent page.
export default function DoctorActivityBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [seenAt, setSeenAt] = useState(() => localStorage.getItem(SEEN_KEY) || '');
  const bellRef = useRef(null);
  const { isIncomplete, missingFields } = useNotifications();

  const load = () => {
    userApi.getAccessRequests().then((res) => setRequests(res || [])).catch(() => setRequests([]));
    userApi.getAccessLogs().then((res) => setLogs(res || [])).catch(() => setLogs([]));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    const off = onDatabaseChange(load);
    return () => { clearInterval(interval); if (off) off(); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open ]);

  const pending = requests.filter((r) => r.status === 'pending');
  // One patient lookup can trigger several data requests. Surface only the
  // latest activity from each doctor so a single search never becomes 20 alerts.
  const uniqueLogs = Array.from(new Map(logs.map((log) => [log.doctorId || log.doctorName || log._id, log])).values());
  const unreadLogs = seenAt ? uniqueLogs.filter((l) => new Date(l.createdAt) > new Date(seenAt)) : uniqueLogs;
  const count = (isIncomplete ? 1 : 0) + pending.length + unreadLogs.length;

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      localStorage.setItem(SEEN_KEY, now);
      setSeenAt(now);
    }
  };

  const goConsent = () => { setOpen(false); navigate('/consent'); };

  return (
    <div ref={bellRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={handleOpen}
        title="Doctor activity"
        aria-label="Doctor activity notifications"
        className={`sih-notif-bell${isIncomplete ? ' sih-notif-bell-profile-alert' : count > 0 ? ' sih-notif-bell-active' : ''}`}
      >
        <Bell size={22} strokeWidth={2} />
        {count > 0 && <span className="sih-notif-badge">{count}</span>}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '330px',
            backgroundColor: '#FFFFFF', borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid var(--border-light)', padding: '1rem', zIndex: 1000, textAlign: 'left',
          }}
        >
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#084766', margin: '0 0 0.6rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Doctor Access Requests</span>
            <span style={{ fontSize: '0.75rem', color: '#0C9A9A', fontWeight: 700 }}>{pending.length} Pending</span>
          </h4>

          {isIncomplete && (
            <button onClick={() => { setOpen(false); navigate('/basicInfo'); }} style={{ width: '100%', textAlign: 'left', padding: '0.7rem', marginBottom: '0.75rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer' }}>
              <div style={{ color: '#B91C1C', fontSize: '0.8rem', fontWeight: 800 }}>Complete your profile</div>
              <div style={{ color: '#991B1B', fontSize: '0.72rem', marginTop: '0.2rem' }}>Missing: {missingFields.map((field) => field.label).join(', ')}. Tap to update.</div>
            </button>
          )}

          {/* Consent requests — click goes to consent page */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Consent requests
          </div>
          {pending.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#6B9190', margin: '0 0 0.6rem 0' }}>No pending requests from doctors.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '0.6rem' }}>
              {pending.slice(0, 5).map((req) => (
                <button
                  key={req._id}
                  onClick={goConsent}
                  style={{ textAlign: 'left', padding: '0.6rem', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>{req.doctorName || 'Doctor'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', marginTop: '0.15rem' }}>
                    Consent request {req.formInfo?.site ? `• ${req.formInfo.site}` : ''} — Tap to review
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Access logs — who opened this patient's data */}
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Doctor access logs
          </div>
          {uniqueLogs.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: '#6B9190', margin: '0 0 0.6rem 0' }}>No new notifications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '0.6rem' }}>
              {uniqueLogs.slice(0, 6).map((log) => (
                <div key={log._id} style={{ padding: '0.55rem 0.6rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>{log.doctorName || 'Doctor'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                    {ACCESS_LABEL[log.accessType] || 'viewed your records'}
                    {log.createdAt ? ` • ${new Date(log.createdAt).toLocaleString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={goConsent}
            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0C9A9A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            View all in Consent page →
          </button>
        </div>
      )}
    </div>
  );
}
