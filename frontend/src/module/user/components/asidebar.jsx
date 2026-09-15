import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  Shield,
  FileText,
  FileCheck,
  ClipboardList,
  BookOpen,
  User,
  Bot,
  Sparkles,
} from "lucide-react";

const PatientSidebar = ({
  profile,
  storedUser,
  patientName,
  initials,
  activePage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const pName =
    patientName ||
    (storedUser ? `${storedUser.firstName || ''} ${storedUser.lastName || ''}`.trim() : '') ||
    profile?.fullName ||
    profile?.name ||
    "Patient";

  const userInitials =
    initials ||
    (pName && pName !== "Patient"
      ? pName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "PT");

  const photoUrl =
    profile?.photoUrl ||
    profile?.photo ||
    storedUser?.photoUrl ||
    storedUser?.photo;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "Basic Info", path: "/basicInfo", icon: UserRound, key: "basicInfo" },
    { label: "ABHA ID", path: "/abha", icon: Shield, key: "abha" },
    { label: "Documents", path: "/uploadDoc", icon: FileText, key: "uploadDoc" },
    { label: "Consent", path: "/consent", icon: FileCheck, key: "consent" },
    { label: "Socrates Form", path: "/socrates", icon: ClipboardList, key: "socrates" },
    { label: "Clinical Directory", path: "/kindle", icon: BookOpen, key: "kindle" },
    { label: "Profile", path: "/profile", icon: User, key: "profile" },
    { label: "GenAI Bot", path: "/genai", icon: Bot, key: "genai" },
  ];

  const isItemActive = (item) => {
    if (activePage) return activePage === item.key;
    if (currentPath === item.path) return true;
    if (item.key === "abha" && currentPath === "/abhaId") return true;
    if (item.key === "uploadDoc" && currentPath === "/docs") return true;
    if (item.key === "kindle" && (currentPath === "/health-code" || currentPath === "/namaste-code" || currentPath === "/icd-code")) return true;
    return false;
  };

  return (
    <aside className="patient-sidebar">
      {/* Merged Single Column Sidebar Card */}
      <div className="patient-sidebar-block" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* 1. Profile Header */}
        <div>
          <div className="patient-sidebar-label" style={{ marginBottom: '0.6rem' }}>Profile</div>
          <div className="patient-profile-card">
            <div className="patient-avatar-circle">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Patient DP"
                  className="patient-avatar-img"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>

            <div className="patient-sidebar-info">
              <h4 className="patient-sidebar-name">{pName}</h4>

              <p className="patient-sidebar-spec">
                {storedUser?.gender || profile?.gender || "Patient"}
                {profile?.bloodGroup ? ` • ${profile.bloodGroup}` : ""}
              </p>

              <span className="patient-status-online">
                ● Active Patient
              </span>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0' }} />

        {/* 2. Menu Section */}
        <div>
          <div className="patient-sidebar-label" style={{ marginBottom: '0.6rem' }}>Menu</div>
          <div className="patient-sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <button
                  key={item.key}
                  className={`patient-sidebar-item ${active ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="patient-sidebar-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0' }} />

        {/* 3. GenAI Chatbot Feature Widget */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F5FAF8 0%, #E4F5EF 100%)',
            border: '1px solid #C3E7DC',
            borderRadius: '12px',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#2F8F83',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <div>
              <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: '#12304A' }}>
                MedVault AI Assistant
              </h5>
              <span style={{ fontSize: '0.7rem', color: '#0C9A9A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Powered by Groq AI
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.76rem', color: '#475569', margin: '0 0 0.8rem 0', lineHeight: '1.4' }}>
            Instant medical triage, symptom diagnosis, and soothing voice guidance 24/7.
          </p>

          <button
            onClick={() => navigate('/genai')}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              background: 'linear-gradient(135deg, #12304A 0%, #2F8F83 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 6px rgba(47, 143, 131, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🤖 Launch AI Chatbot</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PatientSidebar;
