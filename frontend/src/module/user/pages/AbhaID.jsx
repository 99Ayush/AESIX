import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Utility for formatting dates
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

export default function AbhaID() {
  const navigate = useNavigate();

  // Local Mock Data inside AbhaID.jsx
  const [abhaDetails] = useState({
    name: 'Rajesh Kumar',
    abhaNumber: '91-8472-1029-4821',
    phrAddress: 'rajesh.kumar@abdm',
    dob: '1992-03-15',
    gender: 'Male',
    mobile: '+91 98765 43210',
    bloodGroup: 'O+',
    address: 'House #104, Green Park Extension, New Delhi - 110016',
    emergencyContact: 'Sunita Kumar (+91 98765 43211)',
    verificationStatus: 'Verified (Aadhaar Seeded)',
    issuedDate: '2023-01-12'
  });

  const [pendingConsents, setPendingConsents] = useState([
    {
      id: 1,
      requester: "Apex Diagnostics Lab",
      purpose: "Lab Report & Scan Access",
      date: "2026-09-09"
    },
    {
      id: 2,
      requester: "Genomics India Lab",
      purpose: "DNA Variant Data Access",
      date: "2026-09-11"
    },
    {
      id: 3,
      requester: "Apollo Specialty Hospital",
      purpose: "EHR Transfer Request",
      date: "2026-09-08"
    }
  ]);

  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = () => {
    showNotification('Downloading official ABHA Health Card (PDF)...');
  };

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

      {/* TOP NAVBAR */}
      <header className="bg-[#12304A] text-white shadow-lg sticky top-0 z-40 w-full border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#2F8F83] text-white font-black text-xl flex items-center justify-center shadow-md">
              SIH
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide leading-tight">SIH 2026 | Patient Case-Taking</h1>
              <p className="text-xs text-[#E4F5EF] opacity-80 leading-none">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center bg-[#1a4163] p-1 rounded-xl border border-slate-600 font-bold text-xs gap-1">
            <button
              onClick={() => navigate('/abha')}
              className="px-4 py-2 rounded-lg bg-[#2F8F83] text-white shadow-sm font-extrabold cursor-pointer"
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
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              Consent
            </button>
          </nav>

          {/* Right Controls: Language & Doctor Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
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

            {/* Doctor Profile Avatar */}
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

      {/* WHITESPACE MARGIN & MAIN CONTAINER */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">

        {/* TWO-COLUMN RESPONSIVE LAYOUT MATCHING WIREFRAME */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ==================== LEFT COLUMN: ABHA ID CARD (7 Cols) ==================== */}
          <div className="lg:col-span-7 min-w-0 space-y-4">
            
            {/* OFFICIAL ABHA ID CARD */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden relative">
              
              {/* Official NHA Header Strip */}
              <div className="bg-gradient-to-r from-[#12304A] via-[#1a4163] to-[#2F8F83] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-black text-sm border border-white/20">
                    🏛️
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#E4F5EF]/80">
                      National Health Authority • Govt. of India
                    </p>
                    <h2 className="text-base font-extrabold tracking-wide">Ayushman Bharat Health Account (ABHA)</h2>
                  </div>
                </div>

                <span className="hidden sm:inline-block bg-[#2F8F83] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  {abhaDetails.verificationStatus}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  
                  {/* Photo & Main Demographics */}
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#EAF3FF] text-[#12304A] border-2 border-[#2F8F83]/30 p-1 shadow-md flex items-center justify-center font-black text-4xl flex-shrink-0">
                      {abhaDetails.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-[#12304A]">{abhaDetails.name}</h3>
                      <p className="text-xs font-bold text-slate-500">
                        {abhaDetails.gender} • DOB: {formatDate(abhaDetails.dob)}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        Blood Group: <span className="text-[#2F8F83] font-black">{abhaDetails.bloodGroup}</span>
                      </p>
                      <p className="text-xs text-slate-500 font-semibold">
                        Mobile: <strong className="text-slate-800">{abhaDetails.mobile}</strong>
                      </p>
                    </div>
                  </div>

                  {/* QR Code Box (Matching Wireframe) */}
                  <div className="bg-[#F5FAF8] p-3 rounded-2xl border border-slate-200 text-center flex-shrink-0 shadow-2xs self-center sm:self-auto">
                    <div className="w-28 h-28 bg-white border border-slate-300 rounded-xl p-1.5 flex items-center justify-center relative shadow-inner">
                      {/* Generative QR Pattern graphic */}
                      <div className="w-full h-full bg-slate-900 rounded grid grid-cols-5 gap-1 p-1">
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-[#12304A] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-[#2F8F83] rounded-xs"></div>
                        <div className="bg-white rounded-xs"></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-[#12304A] block mt-1.5 tracking-wider">
                      Scan QR Code
                    </span>
                  </div>

                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#F5FAF8] p-3.5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">ABHA Health Number</p>
                    <p className="text-base font-black font-mono text-[#12304A] mt-0.5">{abhaDetails.abhaNumber}</p>
                  </div>

                  <div className="bg-[#E4F5EF]/60 p-3.5 rounded-xl border border-[#2F8F83]/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">PHR / ABHA Address</p>
                    <p className="text-base font-bold text-[#2F8F83] mt-0.5">{abhaDetails.phrAddress}</p>
                  </div>
                </div>

                {/* Additional Info Footer */}
                <div className="bg-[#12304A] text-white p-4 rounded-2xl flex flex-wrap justify-between items-center text-xs gap-2">
                  <div>
                    <p className="font-bold text-[#E4F5EF]">Emergency Contact:</p>
                    <p className="text-slate-300 font-semibold text-[11px]">{abhaDetails.emergencyContact}</p>
                  </div>
                  <span className="bg-[#2F8F83] text-white text-[10px] font-bold px-3 py-1 rounded-lg">
                    ABDM Compliant Card
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* ==================== RIGHT COLUMN: PENDING CONSENTS & DOWNLOAD (5 Cols) ==================== */}
          <div className="lg:col-span-5 min-w-0 space-y-6">
            
            {/* PENDING CONSENTS CARD (MATCHING WIREFRAME) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#12304A] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  Pending Consents ({pendingConsents.length})
                </h3>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Action Needed
                </span>
              </div>

              {/* Pending Consents List with Horizontal Separators */}
              <div className="divide-y divide-slate-100 space-y-3">
                {pendingConsents.map((consent) => (
                  <div key={consent.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#12304A]">{consent.requester}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatDate(consent.date)}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{consent.purpose}</p>
                  </div>
                ))}
              </div>

              {/* View All Consents Button */}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/consent')}
                  className="w-full bg-[#12304A] hover:bg-[#1a4163] text-white text-xs font-bold py-3 px-4 rounded-xl transition text-center cursor-pointer shadow-sm"
                >
                  View All Consents →
                </button>
              </div>

            </div>

            {/* DOWNLOAD BUTTON BELOW PENDING CONSENTS (MATCHING WIREFRAME) */}
            <div>
              <button
                onClick={handleDownload}
                className="w-full bg-[#2F8F83] hover:bg-[#25756b] text-white text-sm font-black py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📥</span> Download Official ABHA Card (PDF)
              </button>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}