import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  FileCheck,
  User,
  ClipboardList,
  Users,
  FolderOpen,
  Stethoscope,
} from 'lucide-react';
import { userApi } from '../module/user/services/userApi';
import { onDatabaseChange } from '../module/user/services/realtime';
import './native-tabbar.css';

/* Patient tabs (thumb-reachable primary destinations) */
const PATIENT_TABS = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard, keys: ['/dashboard'] },
  { label: 'Directory', path: '/kindle', icon: BookOpen, keys: ['/kindle', '/kindlemain', '/health-code', '/namaste-code', '/icd-code'] },
  { label: 'AI Bot', path: '/genai', icon: Bot, keys: ['/genai'] },
  { label: 'Consent', path: '/consent', icon: FileCheck, keys: ['/consent'], hasBadge: true },
  { label: 'Profile', path: '/profile', icon: User, keys: ['/profile', '/basicInfo', '/abha', '/abhaId', '/uploadDoc', '/docs', '/socrates'] },
];

/* Doctor sub-pages as a horizontal chip nav under the header */
const DOCTOR_TABS = [
  { label: 'Overview', path: '/doctor', icon: LayoutDashboard, exact: true },
  { label: 'Patients', path: '/doctor/patient-data', icon: Users, exact: false },
  { label: 'Forms', path: '/doctor/socrates-forms', icon: ClipboardList, exact: false },
  { label: 'Directory', path: '/doctor/directory', icon: FolderOpen, exact: false },
  { label: 'Medical', path: '/doctor/medical-directory', icon: Stethoscope, exact: false },
];

const HIDDEN_PATHS = ['/login', '/register', '/'];

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [hasPendingConsent, setHasPendingConsent] = useState(false);

  useEffect(() => {
    if (HIDDEN_PATHS.includes(path) || path.startsWith('/doctor')) return;

    const checkPending = () => {
      userApi.getAccessRequests()
        .then((res) => {
          const pending = Array.isArray(res) && res.some((r) => r.status === 'pending');
          setHasPendingConsent(pending);
        })
        .catch(() => setHasPendingConsent(false));
    };

    checkPending();
    const off = onDatabaseChange(checkPending);
    return () => { if (off) off(); };
  }, [path]);

  if (HIDDEN_PATHS.includes(path)) return null;

  if (path.startsWith('/doctor')) {
    return (
      <nav className="native-docnav" aria-label="Doctor sections">
        {DOCTOR_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.exact ? path === tab.path : path.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              type="button"
              className={`native-docnav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => { if (!active) navigate(tab.path); }}
            >
              <Icon size={16} strokeWidth={2.2} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="native-tabbar" aria-label="Primary">
      {PATIENT_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.keys.some((k) => path === k || (k !== '/dashboard' && path.startsWith(k)));
        const showBadge = tab.hasBadge && hasPendingConsent;

        return (
          <button
            key={tab.path}
            type="button"
            className={`native-tabbar-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => { if (!active) navigate(tab.path); }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {showBadge && <span className="tabbar-badge-dot" />}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
