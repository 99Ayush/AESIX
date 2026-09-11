import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Formatting Utilities
export const formatDate = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

export default function Consent() {
  const navigate = useNavigate();

  // Mock Consent Records Data
  const [consents, setConsents] = useState([
    {
      id: 1,
      title: "Medical History & EHR Access",
      status: "accepted",
      date: "2026-09-10",
      expiry: "2027-09-10",
      requester: "Dr. A. Verma (General Medicine)",
      purpose: "Allows viewing patient past diagnoses, vitals logs, and clinical notes for active treatment.",
      scope: ["Medical History", "Vitals", "Diagnoses"]
    },
    {
      id: 2,
      title: "Diagnostic Document Processing",
      status: "pending",
      date: "2026-09-09",
      expiry: "2026-10-09",
      requester: "Apex Diagnostics Lab",
      purpose: "Permission to process and store uploaded blood test reports and radiologic scans.",
      scope: ["Lab Reports", "Scans & Images"]
    },
    {
      id: 3,
      title: "Third-Party Research Data Sharing",
      status: "rejected",
      date: "2026-09-08",
      expiry: "N/A",
      requester: "BioMed Research Institute",
      purpose: "Anonymized case data sharing for epidemiological research studies.",
      scope: ["Anonymized Records"]
    },
    {
      id: 4,
      title: "Emergency Tele-Consultation Consent",
      status: "accepted",
      date: "2026-08-25",
      expiry: "2027-08-25",
      requester: "SIH Emergency Telehealth Network",
      purpose: "Consent for video consultation and instant digital prescription generation during emergency care.",
      scope: ["Video Call", "Digital Rx"]
    },
    {
      id: 5,
      title: "Pharmacy Medication Dispensing Access",
      status: "accepted",
      date: "2026-08-15",
      expiry: "2026-11-15",
      requester: "Jan Aushadhi Pharmacy",
      purpose: "Permission for pharmacy to verify active electronic prescriptions for medication fulfillment.",
      scope: ["Prescriptions Only"]
    },
    {
      id: 6,
      title: "Genomic Sequencing Data Access",
      status: "pending",
      date: "2026-09-11",
      expiry: "2026-12-11",
      requester: "Genomics India Lab",
      purpose: "Access request for DNA variant analysis data to customize pharmacological dosage.",
      scope: ["Genomic Data"]
    }
  ]);

  // State Management
  const [activeStatus, setActiveStatus] = useState('accepted'); // 'all' | 'accepted' | 'rejected' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedConsent, setSelectedConsent] = useState(null);

  // Toast Notification Helper
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Status Action Handlers
  const handleUpdateStatus = (id, newStatus) => {
    setConsents(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setSelectedConsent(null);
    showNotification(`Consent status updated to ${newStatus.toUpperCase()}!`);
  };

  // Filtering Logic
  const filteredConsents = consents.filter(consent => {
    const matchesStatus = activeStatus === 'all' || consent.status === activeStatus;
    const matchesSearch = consent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          consent.requester.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Category counts
  const countAccepted = consents.filter(c => c.status === 'accepted').length;
  const countPending = consents.filter(c => c.status === 'pending').length;
  const countRejected = consents.filter(c => c.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#F5FAF8] text-[#183B56] font-sans antialiased w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2F8F83] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="bg-[#12304A] text-white shadow-lg sticky top-0 z-40 w-full border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#2F8F83] text-white font-black text-xl flex items-center justify-center shadow-md">
              SIH
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide leading-tight">SIH 2026 | Patient Case-Taking</h1>
              <p className="text-xs text-[#E4F5EF] opacity-80 leading-none">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          {/* Section Navigation Links */}
          <nav className="flex items-center bg-[#1a4163] p-1 rounded-xl border border-slate-600 font-bold text-xs gap-1">
            <button
              onClick={() => navigate('/basicInfo')}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              ABHA ID
            </button>

            <button
              onClick={() => navigate('/uploadDoc')}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              Docs
            </button>

            <button
              onClick={() => navigate('/basicInfo')}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              Basic Info
            </button>

            <button
              onClick={() => navigate('/consent')}
              className="px-4 py-2 rounded-lg bg-[#2F8F83] text-white shadow-sm font-extrabold cursor-pointer"
            >
              Consent
            </button>
          </nav>

          {/* Search, Language & Doctor Info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search consent record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a4163] text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-[#2F8F83] w-48 lg:w-60 transition"
              />
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#1a4163] text-xs text-white px-3 py-2.5 rounded-lg border border-slate-600 focus:outline-none cursor-pointer font-medium"
            >
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी (Hindi)</option>
              <option value="Bengali">🌐 বাংলা (Bengali)</option>
              <option value="Tamil">🌐 தமிழ் (Tamil)</option>
            </select>

            {/* Doctor Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-700 pl-3">
              <div className="w-9 h-9 rounded-full bg-[#2F8F83] text-white flex items-center justify-center font-bold text-xs border-2 border-white/30 shadow-sm flex-shrink-0">
                DR
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold">Dr. A. Verma</p>
                <p className="text-[10px] text-[#E4F5EF]/80">General Medicine</p>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* CONSENTS MAIN HEADING CONTAINER (MATCHING WIREFRAME) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#12304A] tracking-tight">Consents</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Manage patient data access permissions, consent requests, and authorization records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-[#E4F5EF] text-[#2F8F83] px-3.5 py-1.5 rounded-xl border border-[#2F8F83]/30">
              Active: {countAccepted}
            </span>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-xl border border-amber-200">
              Pending: {countPending}
            </span>
            <span className="text-xs font-bold bg-[#FDECEF] text-red-700 px-3.5 py-1.5 rounded-xl border border-red-200">
              Rejected: {countRejected}
            </span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT (LEFT FILTERS, RIGHT CONSENT RECORDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ==================== LEFT PANEL: STATUS FILTERS (3 Cols) ==================== */}
          <div className="lg:col-span-3 min-w-0 space-y-4">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-2">
                Consent Status
              </h3>

              <div className="space-y-2 text-xs font-bold">
                
                {/* Accepted Filter */}
                <button
                  onClick={() => setActiveStatus('accepted')}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                    activeStatus === 'accepted'
                      ? 'bg-[#2F8F83] text-white border-[#2F8F83] shadow-md'
                      : 'bg-[#F5FAF8] text-slate-700 border-slate-200 hover:bg-[#E4F5EF]/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Accepted
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeStatus === 'accepted' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countAccepted}
                  </span>
                </button>

                {/* Rejected Filter */}
                <button
                  onClick={() => setActiveStatus('rejected')}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                    activeStatus === 'rejected'
                      ? 'bg-[#12304A] text-white border-[#12304A] shadow-md'
                      : 'bg-[#F5FAF8] text-slate-700 border-slate-200 hover:bg-[#FDECEF]/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Rejected
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeStatus === 'rejected' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countRejected}
                  </span>
                </button>

                {/* Pending Filter */}
                <button
                  onClick={() => setActiveStatus('pending')}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                    activeStatus === 'pending'
                      ? 'bg-[#2F8F83] text-white border-[#2F8F83] shadow-md'
                      : 'bg-[#F5FAF8] text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Pending
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeStatus === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countPending}
                  </span>
                </button>

                {/* All Consents Filter */}
                <button
                  onClick={() => setActiveStatus('all')}
                  className={`w-full text-left p-3.5 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                    activeStatus === 'all'
                      ? 'bg-[#12304A] text-white border-[#12304A] shadow-md'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span>All Records</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeStatus === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {consents.length}
                  </span>
                </button>

              </div>
            </div>

            {/* Quick Info Box */}
            <div className="bg-[#EAF3FF] p-4 rounded-2xl border border-blue-200/60 text-xs text-[#12304A] space-y-1.5">
              <p className="font-extrabold flex items-center gap-1.5">
                <span>🔒</span> ABDM Consent Architecture
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Patient consent records are signed and verified according to Ayushman Bharat Digital Mission (ABDM) data privacy guidelines.
              </p>
            </div>

          </div>

          {/* ==================== RIGHT PANEL: CONSENT RECORDS (9 Cols) ==================== */}
          <div className="lg:col-span-9 min-w-0">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6 min-h-[480px]">
              
              {/* Panel Sub-header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black text-[#12304A] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F8F83]"></span>
                  Consent Records ({filteredConsents.length})
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  Showing: <strong className="text-[#12304A] uppercase">{activeStatus}</strong>
                </span>
              </div>

              {/* CONSENT RECORDS LIST / ROWS */}
              {filteredConsents.length > 0 ? (
                <div className="divide-y divide-slate-100 space-y-4">
                  {filteredConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className="pt-4 first:pt-0 space-y-3 group hover:bg-[#F5FAF8] p-4 rounded-xl transition border border-transparent hover:border-slate-200"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#12304A] group-hover:text-[#2F8F83] transition">
                              {consent.title}
                            </h4>

                            {/* Status Badge */}
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                              consent.status === 'accepted'
                                ? 'bg-[#E4F5EF] text-[#2F8F83] border-[#2F8F83]/30'
                                : consent.status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-[#FDECEF] text-red-700 border-red-200'
                            }`}>
                              ● {consent.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Requested by: <strong className="text-slate-800">{consent.requester}</strong>
                          </p>
                        </div>

                        {/* Dates */}
                        <div className="text-right text-xs">
                          <p className="text-slate-400 font-semibold text-[11px]">Requested: {formatDate(consent.date)}</p>
                          <p className="text-slate-600 font-bold text-[11px]">Expiry: {formatDate(consent.expiry)}</p>
                        </div>
                      </div>

                      {/* Purpose */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-[#F5FAF8] p-3 rounded-lg border border-slate-100">
                        {consent.purpose}
                      </p>

                      {/* Scope & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Scope:</span>
                          {consent.scope.map((scp, idx) => (
                            <span key={idx} className="bg-[#EAF3FF] text-[#12304A] text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                              {scp}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConsent(consent)}
                            className="bg-[#12304A] hover:bg-[#1a4163] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Details
                          </button>

                          {consent.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(consent.id, 'accepted')}
                                className="bg-[#2F8F83] hover:bg-[#25756b] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(consent.id, 'rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {consent.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(consent.id, 'rejected')}
                              className="bg-slate-100 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="text-center py-16 px-4 bg-[#F5FAF8] rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-4xl">🔐</div>
                  <h4 className="text-base font-bold text-[#12304A]">No Consent Records Found</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No patient consent entries match the selected status <strong className="uppercase">"{activeStatus}"</strong>.
                  </p>
                  <button
                    onClick={() => { setActiveStatus('all'); setSearchQuery(''); }}
                    className="mt-2 text-xs font-bold text-[#2F8F83] bg-[#E4F5EF] px-4 py-2 rounded-xl border border-[#2F8F83]/30"
                  >
                    View All Consents
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* CONSENT DETAILS MODAL */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                  selectedConsent.status === 'accepted'
                    ? 'bg-[#E4F5EF] text-[#2F8F83] border-[#2F8F83]/30'
                    : selectedConsent.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-[#FDECEF] text-red-700 border-red-200'
                }`}>
                  {selectedConsent.status}
                </span>
                <h3 className="text-lg font-bold text-[#12304A] mt-1">{selectedConsent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#F5FAF8] p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Requester / Organization</p>
                <p className="font-bold text-[#12304A] text-sm mt-0.5">{selectedConsent.requester}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Detailed Purpose</p>
                <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">{selectedConsent.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Granted Date</p>
                  <p className="font-bold text-slate-800">{formatDate(selectedConsent.date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Expiration Date</p>
                  <p className="font-bold text-slate-800">{formatDate(selectedConsent.expiry)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedConsent.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedConsent.id, 'accepted')}
                    className="bg-[#2F8F83] text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Grant Consent
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedConsent.id, 'rejected')}
                    className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Reject Consent
                  </button>
                </>
              )}
              {selectedConsent.status === 'accepted' && (
                <button
                  onClick={() => handleUpdateStatus(selectedConsent.id, 'rejected')}
                  className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Revoke Consent
                </button>
              )}
              <button
                onClick={() => setSelectedConsent(null)}
                className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
