import React, { useState, useRef } from 'react';
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

export default function UploadDoc() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Initial Mock Medical Documents Data
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Blood Test & HbA1c Report",
      type: "disease",
      date: "2026-09-10",
      fileName: "blood-test-report.pdf",
      fileSize: "2.4 MB",
      status: "Processed",
      doctor: "Dr. A. Verma"
    },
    {
      id: 2,
      title: "Diabetes Medication Rx",
      type: "prescription",
      date: "2026-09-05",
      fileName: "metformin-prescription.pdf",
      fileSize: "1.1 MB",
      status: "Verified",
      doctor: "Dr. A. Verma"
    },
    {
      id: 3,
      title: "AIIMS Inpatient Discharge Summary",
      type: "discharge summary",
      date: "2026-08-20",
      fileName: "hospital-discharge-summary.pdf",
      fileSize: "4.8 MB",
      status: "Processed",
      doctor: "Dr. S. R. Kaplan"
    },
    {
      id: 4,
      title: "Chest X-Ray & Pulmonology Scan",
      type: "disease",
      date: "2026-07-15",
      fileName: "chest-scan-mri.png",
      fileSize: "5.2 MB",
      status: "Verified",
      doctor: "Dr. M. Sharma"
    },
    {
      id: 5,
      title: "Hypertension & BP Follow-up Rx",
      type: "prescription",
      date: "2026-06-12",
      fileName: "hypertension-rx.pdf",
      fileSize: "850 KB",
      status: "Processed",
      doctor: "Dr. A. Verma"
    }
  ]);

  // State Management
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'disease' | 'prescription' | 'discharge summary'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [toastMessage, setToastMessage] = useState(null);

  // Upload Modal / Selected File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('disease');
  const [isDragOver, setIsDragOver] = useState(false);

  // Preview Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  // Toast Notification Helper
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Submit Upload
  const handleConfirmUpload = () => {
    if (!selectedFile) {
      showNotification('Please select a file first!');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newDoc = {
      id: Date.now(),
      title: uploadTitle.trim() || selectedFile.name,
      type: uploadCategory,
      date: todayStr,
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Processed',
      doctor: 'Dr. A. Verma'
    };

    setDocuments(prev => [newDoc, ...prev]);
    setSelectedFile(null);
    setUploadTitle('');
    showNotification(`Document "${newDoc.title}" uploaded successfully!`);
  };

  // Delete Document Handler
  const handleDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showNotification('Document removed.');
  };

  // Filter & Sort Logic
  const filteredDocs = documents
    .filter(doc => {
      const matchesFilter = activeFilter === 'all' || doc.type.toLowerCase() === activeFilter.toLowerCase();
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

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
          
          {/* Brand Logo & App Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#2F8F83] text-white font-black text-xl flex items-center justify-center shadow-md">
              SIH
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide leading-tight">SIH 2026 | Patient Case-Taking</h1>
              <p className="text-xs text-[#E4F5EF] opacity-80 leading-none">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          {/* Section Tabs (ABHA, Docs [Active], Basic Info) */}
          <nav className="flex items-center bg-[#1a4163] p-1 rounded-xl border border-slate-600 font-bold text-xs gap-1">
            <button
              onClick={() => navigate('/basicInfo')}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              ABHA ID
            </button>

            <button
              onClick={() => navigate('/uploadDoc')}
              className="px-4 py-2 rounded-lg bg-[#2F8F83] text-white shadow-sm font-extrabold cursor-pointer"
            >
              Docs (Medical Records)
            </button>

            <button
              onClick={() => navigate('/basicInfo')}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
            >
              Basic Info
            </button>
          </nav>

          {/* Right Controls: Search, Language, Doctor Profile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Search Input */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search patient record..."
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

        {/* DOCUMENT FILTER & ACTION BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          
          {/* SORT BY DROPDOWN */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#12304A]">
              Sort By:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#F5FAF8] text-xs font-bold text-[#12304A] px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#2F8F83] cursor-pointer shadow-2xs"
            >
              <option value="newest">📅 NEWEST 1ST</option>
              <option value="oldest">📅 OLDEST 1ST</option>
            </select>
          </div>

          {/* CATEGORY FILTER BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wide border ${
                activeFilter === 'all'
                  ? 'bg-[#12304A] text-white border-[#12304A] shadow-md'
                  : 'bg-[#F5FAF8] text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Records ({documents.length})
            </button>

            <button
              onClick={() => setActiveFilter('disease')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wide border ${
                activeFilter === 'disease'
                  ? 'bg-[#2F8F83] text-white border-[#2F8F83] shadow-md'
                  : 'bg-[#E4F5EF] text-[#2F8F83] border-[#2F8F83]/20 hover:bg-[#2F8F83]/15'
              }`}
            >
              Disease ({documents.filter(d => d.type === 'disease').length})
            </button>

            <button
              onClick={() => setActiveFilter('prescription')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wide border ${
                activeFilter === 'prescription'
                  ? 'bg-[#2F8F83] text-white border-[#2F8F83] shadow-md'
                  : 'bg-[#EAF3FF] text-[#12304A] border-blue-200 hover:bg-blue-100'
              }`}
            >
              Prescription ({documents.filter(d => d.type === 'prescription').length})
            </button>

            <button
              onClick={() => setActiveFilter('discharge summary')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer uppercase tracking-wide border ${
                activeFilter === 'discharge summary'
                  ? 'bg-[#2F8F83] text-white border-[#2F8F83] shadow-md'
                  : 'bg-[#F0EBFF] text-[#12304A] border-purple-200 hover:bg-purple-100'
              }`}
            >
              Discharge Summary ({documents.filter(d => d.type === 'discharge summary').length})
            </button>
          </div>

        </div>

        {/* MAIN UPLOAD & DOCUMENTS AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 min-h-[500px]">

          {/* CENTRAL UPLOAD AREA (MATCHING WIREFRAME) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition cursor-pointer flex flex-col items-center justify-center gap-4 ${
              isDragOver
                ? 'border-[#2F8F83] bg-[#E4F5EF]/50 shadow-inner'
                : 'border-slate-300 bg-[#F5FAF8] hover:border-[#2F8F83] hover:bg-[#E4F5EF]/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
            />

            {/* Center Upload Icon & Text matching wireframe */}
            <div className="w-16 h-16 rounded-full bg-[#EAF3FF] text-[#2F8F83] flex items-center justify-center font-bold text-3xl shadow-sm">
              🔍
            </div>

            <div>
              <h3 className="text-lg font-black text-[#12304A]">Upload Medical Document</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Drag & drop your files here, or <span className="text-[#2F8F83] font-bold underline">browse files</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: PDF, JPG, PNG, DOC (Max file size: 15MB)
              </p>
            </div>

            {/* Selected File Box */}
            {selectedFile && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white p-4 rounded-xl border border-[#2F8F83]/40 shadow-sm text-left mt-2 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-xs font-bold text-[#12304A] truncate max-w-xs">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Document Title</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Lab Report Sep 2026"
                      className="w-full text-xs p-2 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Document Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full text-xs p-2 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                    >
                      <option value="disease">Disease / Scan Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="discharge summary">Discharge Summary</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleConfirmUpload}
                  className="w-full bg-[#2F8F83] hover:bg-[#25756b] text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition"
                >
                  Confirm Upload & Save Record
                </button>
              </div>
            )}
          </div>

          {/* SECTION TITLE & RECORD COUNT */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-[#12304A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F8F83]"></span>
              Patient Medical Records ({filteredDocs.length})
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Filter: <strong className="text-[#12304A] uppercase">{activeFilter}</strong> | Sort: <strong className="text-[#12304A] uppercase">{sortOrder}</strong>
            </span>
          </div>

          {/* DOCUMENT CARDS GRID */}
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    {/* Category Badge & Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                        doc.type === 'disease'
                          ? 'bg-[#E4F5EF] text-[#2F8F83] border-[#2F8F83]/30'
                          : doc.type === 'prescription'
                          ? 'bg-[#EAF3FF] text-[#12304A] border-blue-200'
                          : 'bg-[#F0EBFF] text-[#12304A] border-purple-200'
                      }`}>
                        {doc.type}
                      </span>

                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        ✓ {doc.status}
                      </span>
                    </div>

                    {/* Title & Date */}
                    <h4 className="text-base font-bold text-[#12304A] group-hover:text-[#2F8F83] transition line-clamp-1">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Uploaded on: <strong className="text-slate-700">{formatDate(doc.date)}</strong>
                    </p>

                    {/* File Name & Details */}
                    <div className="bg-[#F5FAF8] p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">📄</span>
                        <span className="font-mono text-slate-700 text-[11px] truncate">{doc.fileName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">{doc.fileSize}</span>
                    </div>
                  </div>

                  {/* Actions (View Button matching wireframe) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="flex-1 bg-[#12304A] hover:bg-[#1a4163] text-white text-xs font-bold py-2 px-3 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>👁️</span> View Document
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition rounded-xl border border-slate-200 hover:bg-red-50"
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-16 px-4 bg-[#F5FAF8] rounded-2xl border border-slate-200 space-y-3">
              <div className="text-4xl">📂</div>
              <h4 className="text-base font-bold text-[#12304A]">No Documents Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No medical records match the selected category <strong className="uppercase">"{activeFilter}"</strong> or search query.
              </p>
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="mt-2 text-xs font-bold text-[#2F8F83] bg-[#E4F5EF] px-4 py-2 rounded-xl border border-[#2F8F83]/30"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#E4F5EF] text-[#2F8F83]">
                  {viewingDoc.type}
                </span>
                <h3 className="text-lg font-bold text-[#12304A] mt-1">{viewingDoc.title}</h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Document Viewer Box */}
            <div className="bg-[#12304A] rounded-xl p-8 text-center text-white space-y-3 min-h-[200px] flex flex-col items-center justify-center">
              <span className="text-5xl">📄</span>
              <p className="font-mono text-xs text-[#E4F5EF]">{viewingDoc.fileName}</p>
              <p className="text-xs text-slate-300">
                Uploaded by {viewingDoc.doctor} on {formatDate(viewingDoc.date)}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  showNotification(`Downloading ${viewingDoc.fileName}...`);
                  setViewingDoc(null);
                }}
                className="bg-[#2F8F83] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Download Document
              </button>
              <button
                onClick={() => setViewingDoc(null)}
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
