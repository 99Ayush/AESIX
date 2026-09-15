import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../userPages.css";
import { userApi } from "../services/userApi";
import { onDatabaseChange } from "../services/realtime";
import { useDashboardLanguage } from "../LanguageContext";
import PatientSidebar from "../components/asidebar";
import ChatbotFAB from "../components/ChatbotFAB";
import {
  Camera,
  CalendarDays,
  Search,
  FileText,
  Globe,
  Hand,
  Pencil, 
  ChevronsRight,
} from "lucide-react";

/* ─── Inline SVG icons ─── */
const ShieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const BookIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const ChevronRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const PlugIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v6" />
    <path d="M6 8h12" />
    <path d="M8 8v4a4 4 0 0 0 8 0V8" />
    <path d="M12 16v6" />
  </svg>
);
const AllergyIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);
const SyringeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 2 4 4" />
    <path d="m17 7 3-3" />
    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
    <path d="m9 11 4 4" />
    <path d="m5 19-3 3" />
    <path d="m14 4 6 6" />
  </svg>
);

/* ─── Chatbot Robot SVG (inline, no external image) ─── */
const ChatbotRobot = () => (
  <svg
    width="160"
    height="180"
    viewBox="0 0 160 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Speech bubble */}
    <rect x="85" y="8" width="60" height="34" rx="14" fill="#0C9A9A" />
    <polygon points="95,42 102,42 92,52" fill="#0C9A9A" />
    <circle cx="103" cy="24" r="3" fill="#fff" />
    <circle cx="115" cy="24" r="3" fill="#fff" />
    <circle cx="127" cy="24" r="3" fill="#fff" />
    {/* Antenna */}
    <line
      x1="80"
      y1="55"
      x2="80"
      y2="40"
      stroke="#0C9A9A"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="80" cy="37" r="5" fill="#0C9A9A" />
    {/* Head */}
    <rect x="45" y="55" width="70" height="60" rx="18" fill="#277F88" />
    {/* Eyes */}
    <ellipse cx="65" cy="82" rx="8" ry="9" fill="#fff" />
    <ellipse cx="95" cy="82" rx="8" ry="9" fill="#fff" />
    <circle cx="65" cy="83" r="4" fill="#12304A" />
    <circle cx="95" cy="83" r="4" fill="#12304A" />
    {/* Eye shine */}
    <circle cx="67" cy="81" r="1.5" fill="#fff" />
    <circle cx="97" cy="81" r="1.5" fill="#fff" />
    {/* Smile */}
    <path
      d="M68 96 Q80 106 92 96"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Body */}
    <rect x="55" y="118" width="50" height="35" rx="12" fill="#0C9A9A" />
    {/* Body detail */}
    <rect
      x="70"
      y="126"
      width="20"
      height="6"
      rx="3"
      fill="rgba(255,255,255,0.3)"
    />
    <rect
      x="74"
      y="136"
      width="12"
      height="4"
      rx="2"
      fill="rgba(255,255,255,0.2)"
    />
    {/* Left arm */}
    <rect x="32" y="122" width="22" height="14" rx="7" fill="#277F88" />
    {/* Right arm */}
    <rect x="106" y="122" width="22" height="14" rx="7" fill="#277F88" />
    {/* Ears */}
    <rect x="37" y="72" width="8" height="22" rx="4" fill="#16B889" />
    <rect x="115" y="72" width="8" height="22" rx="4" fill="#16B889" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useDashboardLanguage();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadDashboard = () =>
      userApi
        .dashboard()
        .then(setDashboard)
        .catch(() => setDashboard(null));
    loadDashboard();
    return onDatabaseChange(loadDashboard);
  }, []);

  const [accessRequests, setAccessRequests] = useState([]);
  const pendingRequests = accessRequests.filter((r) => r.status === 'pending');

  const loadAccessRequests = () => {
    userApi
      .getAccessRequests()
      .then((res) => setAccessRequests(res || []))
      .catch(() => setAccessRequests([]));
  };

  useEffect(() => {
    loadAccessRequests();
    const interval = setInterval(loadAccessRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (id, status) => {
    try {
      await userApi.respondAccessRequest(id, status);
      loadAccessRequests();
    } catch (err) {
      console.error('Failed to respond to consent request:', err);
    }
  };

  const profile = dashboard?.profile;
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user_profile") || "{}");
    } catch {
      return {};
    }
  })();
  const patientName =
    profile?.name?.trim() ||
    (storedUser?.firstName
      ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
      : "") ||
    dashboard?.abha?.name?.trim() ||
    (dashboard ? "Patient" : "Loading profile…");
  const initials = (patientName.replace(/[^a-zA-Z\s]/g, "").trim() || "PT")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getVal = (primary, ...fallbacks) => {
    if (primary && String(primary).trim() && String(primary).trim() !== "—")
      return String(primary).trim();
    for (const fb of fallbacks) {
      if (fb && String(fb).trim() && String(fb).trim() !== "—")
        return String(fb).trim();
    }
    return "—";
  };

  // Patient information data
  const patientInfoLeft = [
    {
      title: "Patient ID",
      value: getVal(profile?.id, storedUser?.id, storedUser?.userId),
    },
    { title: "Gender", value: getVal(profile?.gender, storedUser?.gender) },
    {
      title: "Contact",
      value: getVal(
        profile?.contact?.phone,
        storedUser?.mobile,
        storedUser?.phone,
      ),
      icon: "📞",
    },
    {
      title: "Address",
      value: getVal(
        profile?.contact?.address,
        storedUser?.city,
        storedUser?.address,
      ),
      icon: "📍",
    },
    {
      title: "ABHA Number",
      value: getVal(
        dashboard?.abha?.number,
        storedUser?.abhaNumber,
        storedUser?.ABHANumber,
      ),
    },
  ];
  const patientInfoRight = [
    {
      title: "Date of Birth",
      value: getVal(profile?.dob, storedUser?.dob, storedUser?.dateOfBirth),
    },
    {
      title: "Blood Type",
      value: getVal(profile?.bloodGroup, storedUser?.bloodGroup),
    },
    {
      title: "Email",
      value: getVal(profile?.contact?.email, storedUser?.email),
      icon: "✉️",
    },
    {
      title: "Emergency",
      value: (() => {
        const name = profile?.contact?.emergencyContactName || profile?.emergencyContactName || storedUser?.emergencyContactName || '';
        const rel = profile?.contact?.emergencyContactRelation || profile?.emergencyContactRelation || storedUser?.emergencyContactRelation || '';
        const phone = profile?.contact?.emergencyContactPhone || profile?.emergencyContactPhone || storedUser?.emergencyContactPhone || '';
        if (!name && !phone) return '—';
        return `${name || 'Contact'}${rel ? ` (${rel})` : ''}${phone ? ` • ${phone}` : ''}`;
      })(),
    },
    {
      title: "Status",
      value: getVal(
        dashboard?.abha?.verificationStatus,
        storedUser?.abhaStatus,
        "Verified",
      ),
    },
  ];

  // Known allergies
  // const allergies = (profile?.allergies || []).map((text, index) => ({
  //   text,
  //   icon: "✦",
  //   bg: ["#FDE3EF", "#EFEAFF", "#FFF4D5"][index % 3],
  //   color: "#F52B91",
  // }));

  /* ─── Inline styles ─── */
  const s = {
    pageWrapper: {
      minHeight: "100vh",
      background: "#EFF9F7",
      fontFamily: "'Inter', 'Poppins', 'Nunito Sans', sans-serif",
    },
    main: {
      padding: "1.5rem 2.5rem 3rem",
      maxWidth: "1600px",
      margin: "0 auto",
    },
    headingRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1.5rem",
      flexWrap: "wrap",
      marginBottom: "1.75rem",
    },
    welcome: {
      fontSize: "2rem",
      fontWeight: 800,
      color: "#084766",
      letterSpacing: "-0.02em",
    },
    dateBadge: {
      display: "flex",
      alignItems: "center",
      gap: "0.65rem",
      fontSize: "0.85rem",
      color: "#084766",
    },
    // Main profile container
    profileContainer: {
      background: "rgba(255,255,255,0.85)",
      borderRadius: "18px",
      border: "1px solid rgba(20,150,150,0.12)",
      boxShadow: "0 2px 16px rgba(8,71,102,0.04)",
      overflow: "hidden",
    },
    profileHeader: {
      padding: "1.25rem 1.75rem",
      borderBottom: "1px solid #E4ECEA",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      flexWrap: "wrap",
    },
    profileLabel: {
      fontSize: "0.68rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#0C9A9A",
    },
    profileNameHeading: {
      fontSize: "1.4rem",
      fontWeight: 800,
      color: "#084766",
      marginTop: "0.2rem",
    },
    activeBadge: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      background: "#E2F6EE",
      color: "#16B889",
      padding: "0.5rem 1rem",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
    },
    activeDot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#16B889",
    },
    editBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.4rem",
      background: "#F1F7F5",
      color: "#084766",
      padding: "0.55rem 1.25rem",
      borderRadius: "999px",
      fontSize: "0.82rem",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    // 3-column body
    bodyGrid: {
      padding: "1.5rem",
      display: "grid",
      gridTemplateColumns: "210px 1fr 340px",
      gap: "1.5rem",
    },
    // Left - photo + allergies
    leftCol: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    photoBg: {
      height: "210px",
      width: "100%",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #DCEFEB, #EDF5F4)",
      border: "8px solid #EDF7F4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    photoCircle: {
      width: 120,
      height: 120,
      borderRadius: "50%",
      background: "#0C9A9A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "2.5rem",
      fontWeight: 800,
    },
    cameraBtn: {
      position: "absolute",
      bottom: 8,
      right: 8,
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "#0C9A9A",
      border: "4px solid white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "1.1rem",
      color: "#fff",
    },
    allergiesTitle: {
      fontWeight: 800,
      color: "#0C9A9A",
      letterSpacing: "0.05em",
      fontSize: "0.82rem",
      marginBottom: "0.75rem",
    },
    allergyTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem",
      padding: "0.4rem 0.85rem",
      borderRadius: "999px",
      fontSize: "0.78rem",
      fontWeight: 700,
      whiteSpace: "nowrap",
    },
    // Center - Patient Information card
    infoPanel: {
      border: "1px solid rgba(20,150,150,0.12)",
      borderRadius: "14px",
      padding: "1.25rem",
      background: "rgba(255,255,255,0.9)",
    },
    infoTitle: {
      fontSize: "0.78rem",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "#0C9A9A",
      marginBottom: "1.25rem",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1.25rem 2rem",
    },
    infoLabel: {
      fontSize: "0.68rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "#0C9A9A",
      marginBottom: "0.3rem",
    },
    infoValue: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.35rem",
      fontWeight: 700,
      color: "#084766",
      fontSize: "0.88rem",
      lineHeight: "1.5",
    },
    infoIcon: {
      marginTop: "0.1rem",
      color: "#0C9A9A",
    },
    // Right utility column
    rightUtil: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    utilBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.85rem",
      padding: "0.85rem 1.1rem",
      background: "#E8F7F4",
      borderRadius: "14px",
      border: "1px solid rgba(20,150,150,0.12)",
      cursor: "pointer",
      transition: "all 0.2s",
      textDecoration: "none",
      color: "#0C9A9A",
      fontWeight: 700,
      fontSize: "0.92rem",
    },
    utilBtnIcon: {
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "#D0F0E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0C9A9A",
      flexShrink: 0,
    },
    utilBtnText: {
      flex: 1,
      fontWeight: 700,
      color: "#084766",
      fontSize: "0.92rem",
    },
    utilBtnChevron: {
      color: "#0C9A9A",
      opacity: 0.6,
    },
    // Chatbot panel
    chatbotPanel: {
      flex: 1,
      minHeight: "220px",
      background:
        "linear-gradient(135deg, #F0FAF8 0%, #E8F7F4 50%, #FBFDFC 100%)",
      borderRadius: "16px",
      border: "1px solid rgba(20,150,150,0.12)",
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      padding: "1rem",
    },
    chatbotLabel: {
      position: "absolute",
      top: "1rem",
      left: "1.25rem",
      fontSize: "0.78rem",
      fontWeight: 700,
      color: "#0C9A9A",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    chatbotSubLabel: {
      position: "absolute",
      top: "2.2rem",
      left: "1.25rem",
      fontSize: "0.72rem",
      color: "#6B9190",
      fontWeight: 500,
    },
    // Bottom action cards
    bottomActions: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
      padding: "0 1.5rem 1.5rem",
    },
    actionCard: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 1.25rem",
      background: "#E8F7F4",
      borderRadius: "14px",
      border: "1px solid rgba(20,150,150,0.12)",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    actionCardIcon: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: "#D0F0E8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0C9A9A",
      flexShrink: 0,
    },
    actionCardTitle: {
      fontWeight: 800,
      color: "#084766",
      fontSize: "0.95rem",
    },
    actionCardDesc: {
      fontSize: "0.78rem",
      color: "#6B9190",
      marginTop: "0.15rem",
    },
    actionCardChevron: {
      marginLeft: "auto",
      color: "#0C9A9A",
      opacity: 0.5,
    },
  };

  return (
    <div style={s.pageWrapper} className="sih-page-wrapper">
      {/* ===== HEADER (reusing existing classes) ===== */}
      <header className="sih-header">
        <div className="sih-header-inner">
          <div className="sih-brand" onClick={() => navigate("/dashboard")}>
            <div className="sih-logo-badge">
              <ShieldIcon />
            </div>
            <div>
              <h1 className="sih-brand-title">MedVault</h1>
              <p className="sih-brand-subtitle">Health Portal</p>
            </div>
          </div>


          <div className="sih-header-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="sih-lang-select"
            >
              <option value="English">
                <Globe size={18} strokeWidth={2} /> English
              </option>
              <option value="Hindi">
                <Globe size={18} strokeWidth={2} /> हिंदी
              </option>
              <option value="Bengali">
                <Globe size={18} strokeWidth={2} /> বাংলা
              </option>
              <option value="Tamil">
                <Globe size={18} strokeWidth={2} /> தமிழ்
              </option>
            </select>
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                className="sih-notif-bell"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                🔔
                <span className="sih-notif-badge">{pendingRequests.length}</span>
              </button>
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: "320px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    boxShadow:
                      "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                    border: "1px solid var(--border-light)",
                    padding: "1rem",
                    zIndex: 1000,
                    textAlign: "left",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "#084766",
                      margin: "0 0 0.75rem 0",
                      paddingBottom: "0.5rem",
                      borderBottom: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Doctor Access Requests</span>
                    <span style={{ fontSize: "0.75rem", color: "#0C9A9A", fontWeight: 700 }}>
                      {pendingRequests.length} Pending
                    </span>
                  </h4>
                  {pendingRequests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.2rem" }}>🔕</div>
                      <p style={{ fontSize: "0.75rem", color: "#6B9190", margin: 0 }}>
                        No pending requests from doctors.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", maxHeight: "300px", overflowY: "auto" }}>
                      {pendingRequests.map((req) => (
                        <div
                          key={req._id}
                          style={{
                            padding: "0.65rem",
                            borderRadius: "8px",
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                            {req.doctorName}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B", margin: "0.2rem 0 0.5rem" }}>
                            Form: <strong>{req.formInfo?.site || "Pain Assessment"}</strong> (Severity: {req.formInfo?.severity ?? "N/A"}/10)
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button
                              onClick={() => handleRespond(req._id, "accepted")}
                              style={{
                                flex: 1,
                                background: "#16B889",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0.3rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(req._id, "rejected")}
                              style={{
                                flex: 1,
                                background: "#EF4444",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0.3rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button
                className="sih-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="sih-profile-avatar">{initials}</div>
                <span className="sih-profile-name">{patientName}</span>
                <span
                  className={`sih-profile-chevron ${profileOpen ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button
                    className="sih-profile-dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                  >
                    <span className="dd-icon">👤</span> Profile
                  </button>
                  <button
                    className="sih-profile-dropdown-item danger"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user_profile");
                      setProfileOpen(false);
                      navigate("/login");
                    }}
                  >
                    <span className="dd-icon">🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="patient-main-container">
        <PatientSidebar profile={profile} storedUser={storedUser} patientName={patientName} initials={initials} activePage="dashboard" />
        <div className="patient-content-area">
          {/* ===== MAIN ===== */}
          <main style={s.main}>
            {/* Welcome Header */}
            <div style={s.headingRow}>
              <div>
                <h2 style={s.welcome}>
                  Welcome back, {patientName} <span>!!</span>
                </h2>
              </div>
              <div style={s.dateBadge}>
                <span>
                  <CalendarDays size={18} />
                </span>
                <div>
                  <span style={{ fontWeight: 700 }}>
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span style={{ color: "#6B9190", marginLeft: "0.5rem" }}>
                    • Last synced 3 min ago
                  </span>
                </div>
              </div>
            </div>

            {/* ===== PENDING ACCESS REQUESTS BANNER ===== */}
            {pendingRequests.length > 0 && (
              <div
                style={{
                  background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                  border: "1px solid #FCD34D",
                  borderRadius: "16px",
                  padding: "1.25rem 1.5rem",
                  marginBottom: "1.5rem",
                  boxShadow: "0 4px 14px rgba(245,158,11,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.3rem" }}>🩺</span>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "#92400E",
                        }}
                      >
                        Pending Doctor Access Requests ({pendingRequests.length})
                      </h3>
                      <p
                        style={{
                          margin: "0.15rem 0 0",
                          fontSize: "0.78rem",
                          color: "#B45309",
                        }}
                      >
                        A doctor is requesting consent to view your clinical SOCRATES assessment forms.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {pendingRequests.map((req) => (
                    <div
                      key={req._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#FFFFFF",
                        borderRadius: "12px",
                        padding: "0.85rem 1.25rem",
                        border: "1px solid #FDE68A",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#1E293B",
                            fontSize: "0.92rem",
                          }}
                        >
                          {req.doctorName}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>
                          Requested access to: <strong>SOCRATES Form — {req.formInfo?.site || "Pain Assessment"}</strong> (Pain Severity: {req.formInfo?.severity ?? "N/A"}/10)
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleRespond(req._id, "accepted")}
                          style={{
                            background: "#10B981",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "0.5rem 1.25rem",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(16,185,129,0.2)",
                          }}
                        >
                          ✓ Grant Access
                        </button>
                        <button
                          onClick={() => handleRespond(req._id, "rejected")}
                          style={{
                            background: "#EF4444",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "0.5rem 1.25rem",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(239,68,68,0.2)",
                          }}
                        >
                          ✕ Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== PATIENT PROFILE CONTAINER ===== */}
            <div style={s.profileContainer}>
              {/* Profile Header */}
              <div style={s.profileHeader}>
                <div>
                  <p style={s.profileLabel}>Patient Profile</p>
                  <h3 style={s.profileNameHeading}>{patientName}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={s.activeBadge}>
                    <span style={s.activeDot} />
                    Active Patient
                  </span>
                  <button
                    style={s.editBtn}
                    onClick={() => navigate("/basicInfo")}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#E2F6EE")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#F1F7F5")
                    }
                  >
                     <Pencil size={18} /> Profile
                  </button>
                </div>
              </div>

              {/* 3-Column Body */}
              <div style={s.bodyGrid}>
                {/* LEFT — Photo + Allergies */}
                <div style={s.leftCol}>
                  <div style={{ position: "relative" }}>
                    <div style={s.photoBg}>
                      <div style={{ ...s.photoCircle, overflow: "hidden" }}>
                        {profile?.photoUrl ||
                          profile?.photo ||
                          storedUser?.photoUrl ||
                          storedUser?.photo ? (
                          <img
                            src={
                              profile?.photoUrl ||
                              profile?.photo ||
                              storedUser?.photoUrl ||
                              storedUser?.photo
                            }
                            alt="Profile DP"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          initials
                        )}
                      </div>
                    </div>
                    <button
                      style={s.cameraBtn}
                      title="Change photo"
                      onClick={() => navigate("/basicInfo")}
                    >
                      <Camera size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* CENTER — Patient Information */}
                <div style={s.infoPanel}>
                  <p style={s.infoTitle}>Patient Information</p>
                  <div style={s.infoGrid}>
                    {/* Left column items */}
                    {patientInfoLeft.map((item, i) => (
                      <div key={`l-${i}`}>
                        <p style={s.infoLabel}>{item.title}</p>
                        <div style={s.infoValue}>
                          {item.icon && <span style={s.infoIcon}>{item.icon}</span>}
                          <span>{item.value}</span>
                        </div>
                      </div>
                    ))}
                    {/* Right column items */}
                    {patientInfoRight.map((item, i) => (
                      <div key={`r-${i}`}>
                        <p style={s.infoLabel}>{item.title}</p>
                        <div style={s.infoValue}>
                          {item.icon && <span style={s.infoIcon}>{item.icon}</span>}
                          <span>{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Utility Section */}
                <div style={s.rightUtil}>
                  {/* Medical Dictionary Button */}
                  <div
                    style={s.utilBtn}
                    onClick={() => navigate("/health-codes")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#D0F0E8";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(12,154,154,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#E8F7F4";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={s.utilBtnIcon}>
                      <BookIcon />
                    </div>
                    <span style={s.utilBtnText}>Medical Dictionary</span>
                    <span style={s.utilBtnChevron}>
                      <ChevronRight />
                    </span>
                  </div>

                  {/* Sockets Button */}
                  <div
                    style={s.utilBtn}
                    onClick={() => navigate("/socrates")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#D0F0E8";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(12,154,154,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#E8F7F4";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={s.utilBtnIcon}>
                      <div className="socrates-icon">
                        <span>⚕</span>
                      </div>

                    </div>
                    <span style={s.utilBtnText}>SOCRATES</span>
                    <span style={s.utilBtnChevron}>
                      <ChevronRight />
                    </span>
                  </div>
  
                  
                </div>
              </div>

              {/* Bottom Action Cards — Rich Detail Cards */}
              <div style={s.bottomActions}>
                {/* ── Known Allergies Card ── */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    border: "1px solid #DCEAE6",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: "0 2px 8px rgba(12,154,154,0.06)",
                  }}
                  onClick={() => navigate("/basicInfo")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(12,154,154,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,154,154,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: "linear-gradient(135deg, #E8F7F4 0%, #D0F0E8 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <AllergyIcon />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#084766", fontSize: "1.05rem" }}>
                          Known Allergies
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#6B9190", marginTop: "0.1rem" }}>
                          View and manage your allergies
                        </div>
                      </div>
                    </div>
                    <ChevronsRight size={22} color="#0C9A9A" strokeWidth={2.5} />
                  </div>

                  {/* Allergy Tags */}
                  <div style={{
                    fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#0C9A9A", marginBottom: "0.65rem",
                  }}>
                    YOUR ALLERGIES
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {(profile?.allergies && profile.allergies.length > 0
                      ? profile.allergies
                      : ["Peanut Allergy", "Shellfish Allergy", "Pollen Allergy"]
                    ).map((allergy, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          background: "#EFF9F7", color: "#0C9A9A",
                          borderRadius: "8px", padding: "0.4rem 0.75rem",
                          fontSize: "0.8rem", fontWeight: 700,
                          border: "1px solid rgba(12,154,154,0.15)",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>
                          {["🥜", "🦐", "🌼", "💊", "🩹", "⚠️"][idx % 6]}
                        </span>
                        {allergy}
                      </span>
                    ))}
                    {(!profile?.allergies || profile.allergies.length === 0) && (
                      <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontStyle: "italic" }}>
                       
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Vaccination Card ── */}
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    border: "1px solid #DCEAE6",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: "0 2px 8px rgba(12,154,154,0.06)",
                  }}
                  onClick={() => navigate("/basicInfo")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(12,154,154,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,154,154,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: "linear-gradient(135deg, #E8F7F4 0%, #D0F0E8 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <SyringeIcon />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#084766", fontSize: "1.05rem" }}>
                          Vaccination
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#6B9190", marginTop: "0.1rem" }}>
                          View your vaccination records
                        </div>
                      </div>
                    </div>
                    <ChevronsRight size={22} color="#0C9A9A" strokeWidth={2.5} />
                  </div>

                  {/* Vaccination Tags */}
                  <div style={{
                    fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#0C9A9A", marginBottom: "0.65rem",
                  }}>
                    YOUR VACCINATIONS
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {[
                      { name: "COVID-19", date: "Mar 12, 2023" },
                      { name: "Hepatitis B", date: "Jan 18, 2023" },
                      { name: "Tetanus (Tdap)", date: "Nov 05, 2022" },
                    ].map((vac, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          background: "#EFF9F7", color: "#084766",
                          borderRadius: "8px", padding: "0.4rem 0.75rem",
                          fontSize: "0.8rem", fontWeight: 700,
                          border: "1px solid rgba(12,154,154,0.15)",
                        }}
                      >
                        <span style={{ color: "#10B981", fontSize: "0.95rem" }}>✅</span>
                        <span>
                          {vac.name}
                          <span style={{
                            display: "block", fontSize: "0.68rem",
                            color: "#6B9190", fontWeight: 600, marginTop: "0.1rem",
                          }}>
                            {vac.date}
                          </span>
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ─── Responsive overrides via inline <style> ─── */}
      <style>{`
        @media (max-width: 1100px) {
          .lp-body-grid-responsive {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .lp-body-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <style>{`
  @keyframes chatbotFloat {
    0%, 100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }
  }
`}</style>
      <ChatbotFAB />
    </div>
  );
}
