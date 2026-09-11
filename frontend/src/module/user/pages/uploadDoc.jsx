import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { fileToBase64, userApi } from '../services/userApi';
import { useDashboardLanguage } from '../LanguageContext';

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
  const { language, setLanguage } = useDashboardLanguage();
  const [toastMessage, setToastMessage] = useState(null);

  // Upload Modal / Selected File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('disease');
  const [isDragOver, setIsDragOver] = useState(false);

  // Preview Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    userApi.documents().then((items) => setDocuments(items.map((item) => ({
      ...item, date: item.createdAt, fileSize: `${(item.size / (1024 * 1024)).toFixed(2)} MB`, status: 'Saved', doctor: 'Patient'
    })))).catch(() => {});
  }, []);

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
  const handleConfirmUpload = async () => {
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

    try {
      const saved = await userApi.uploadDocument({
        title: newDoc.title, type: newDoc.type, fileName: selectedFile.name,
        mimeType: selectedFile.type, size: selectedFile.size, content: await fileToBase64(selectedFile)
      });
      newDoc.id = saved.id;
      newDoc.date = saved.createdAt;
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error) { showNotification(error.message); return; }
    setSelectedFile(null);
    setUploadTitle('');
    showNotification(`Document "${newDoc.title}" uploaded successfully!`);
  };

  // Delete Document Handler
  const handleDeleteDoc = async (id) => {
    try { await userApi.deleteDocument(id); setDocuments(prev => prev.filter(d => d.id !== id)); showNotification('Document removed.'); }
    catch (error) { showNotification(error.message); }
  };

  const handleDownload = (id, fileName) => {
    window.open(userApi.downloadUrl(id), '_blank', 'noopener,noreferrer');
    showNotification(`Downloading ${fileName}...`);
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
    <div className="sih-page-wrapper">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="sih-toast">
          <svg className="sih-toast-icon" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span className="sih-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sih-header">
        <div className="sih-header-inner">
          
          {/* Brand Logo & App Title */}
          <div className="sih-brand">
            <div className="sih-logo-badge">
              SIH
            </div>
            <div>
              <h1 className="sih-brand-title">SIH 2026 | Patient Case-Taking</h1>
              <p className="sih-brand-subtitle">Doctor View • Clinical Documentation</p>
            </div>
          </div>

          {/* Section Tabs */}
          <nav className="sih-nav-menu">
            <button
              onClick={() => navigate('/abha')}
              className="sih-nav-btn"
            >
              ABHA ID
            </button>

            <button
              onClick={() => navigate('/uploadDoc')}
              className="sih-nav-btn active"
            >
              Docs (Medical Records)
            </button>

            <button
              onClick={() => navigate('/basicInfo')}
              className="sih-nav-btn"
            >
              Basic Info
            </button>

            <button
              onClick={() => navigate('/consent')}
              className="sih-nav-btn"
            >
              Consent
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="sih-nav-btn"
            >
              Profile
            </button>
          </nav>

          {/* Right Controls: Search, Language, Doctor Profile */}
          <div className="sih-header-controls">
            
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sih-input"
                style={{ width: '180px', padding: '0.45rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--navy-hover)', color: 'white', borderColor: '#475569' }}
              />
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="sih-lang-select"
            >
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी (Hindi)</option>
              <option value="Bengali">🌐 বাংলা (Bengali)</option>
              <option value="Tamil">🌐 தமிழ் (Tamil)</option>
            </select>

            {/* Doctor Profile */}
            <div className="sih-doctor-profile">
              <div className="sih-doctor-avatar">
                DR
              </div>
              <div className="sih-doctor-info">
                <p className="sih-doctor-name">Dr. A. Verma</p>
                <p className="sih-doctor-role">General Medicine</p>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="sih-main-layout">

        {/* DOCUMENT FILTER & ACTION BAR */}
        <div className="sih-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          
          {/* SORT BY DROPDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary-navy)' }}>
              Sort By:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="sih-select"
              style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
            >
              <option value="newest">📅 NEWEST 1ST</option>
              <option value="oldest">📅 OLDEST 1ST</option>
            </select>
          </div>

          {/* CATEGORY FILTER BUTTONS */}
          <div className="consent-filter-nav">
            <button
              onClick={() => setActiveFilter('all')}
              className={`sih-btn ${activeFilter === 'all' ? 'sih-btn-navy' : 'sih-btn-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              All Records ({documents.length})
            </button>

            <button
              onClick={() => setActiveFilter('disease')}
              className={`sih-btn ${activeFilter === 'disease' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              Disease ({documents.filter(d => d.type === 'disease').length})
            </button>

            <button
              onClick={() => setActiveFilter('prescription')}
              className={`sih-btn ${activeFilter === 'prescription' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              Prescription ({documents.filter(d => d.type === 'prescription').length})
            </button>

            <button
              onClick={() => setActiveFilter('discharge summary')}
              className={`sih-btn ${activeFilter === 'discharge summary' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              Discharge Summary ({documents.filter(d => d.type === 'discharge summary').length})
            </button>
          </div>

        </div>

        {/* MAIN UPLOAD & DOCUMENTS AREA */}
        <div className="sih-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* CENTRAL UPLOAD AREA */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`doc-upload-box ${isDragOver ? 'drag-over' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: 'none' }}
            />

            <div className="doc-icon-container" style={{ margin: '0 auto', width: '56px', height: '56px', borderRadius: '50%', fontSize: '1.8rem' }}>
              🔍
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-navy)', margin: 0 }}>Upload Medical Document</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
                Drag & drop your files here, or <span style={{ color: 'var(--teal-primary)', textDecoration: 'underline' }}>browse files</span>
              </p>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Supported formats: PDF, JPG, PNG, DOC (Max file size: 15MB)
              </p>
            </div>

            {/* Selected File Box */}
            {selectedFile && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '500px', margin: '1rem auto 0', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(47, 143, 131, 0.4)', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>{selectedFile.name}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    style={{ color: '#EF4444', fontWeight: 800, fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Document Title</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Lab Report Sep 2026"
                      className="sih-input"
                      style={{ marginTop: '0.25rem', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="sih-select"
                      style={{ marginTop: '0.25rem', padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <option value="disease">Disease / Scan Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="discharge summary">Discharge Summary</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleConfirmUpload}
                  className="sih-btn sih-btn-primary"
                  style={{ width: '100%', marginTop: '0.85rem', padding: '0.6rem' }}
                >
                  Confirm Upload & Save Record
                </button>
              </div>
            )}
          </div>

          {/* SECTION TITLE & RECORD COUNT */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary-navy)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }}></span>
              Patient Medical Records ({filteredDocs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Filter: <strong style={{ color: 'var(--primary-navy)', textTransform: 'uppercase' }}>{activeFilter}</strong> | Sort: <strong style={{ color: 'var(--primary-navy)', textTransform: 'uppercase' }}>{sortOrder}</strong>
            </span>
          </div>

          {/* DOCUMENT CARDS GRID */}
          {filteredDocs.length > 0 ? (
            <div className="doc-grid-layout">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="doc-card-item">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Category Badge & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`sih-badge ${
                        doc.type === 'disease'
                          ? 'sih-badge-teal'
                          : doc.type === 'prescription'
                          ? 'sih-badge-amber'
                          : 'sih-badge-green'
                      }`}>
                        {doc.type}
                      </span>

                      <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        ✓ {doc.status}
                      </span>
                    </div>

                    {/* Title & Date */}
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      {doc.title}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                      Uploaded on: <strong>{formatDate(doc.date)}</strong>
                    </p>

                    {/* File Name & Details */}
                    <div style={{ backgroundColor: 'var(--mint-bg)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <span>📄</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.fileName}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>{doc.fileSize}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="sih-btn sih-btn-navy"
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}
                    >
                      <span>👁️</span> View Document
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="sih-btn sih-btn-outline"
                      style={{ padding: '0.5rem', color: '#EF4444' }}
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
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--mint-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '2.5rem' }}>📂</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>No Documents Found</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                No medical records match the selected category <strong style={{ textTransform: 'uppercase' }}>"{activeFilter}"</strong> or search query.
              </p>
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="sih-btn sih-btn-primary"
                style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.75rem' }}
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingDoc && (
        <div className="sih-modal-backdrop">
          <div className="sih-modal-card">
            
            <div className="sih-modal-header">
              <div>
                <span className="sih-badge sih-badge-teal">
                  {viewingDoc.type}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.25rem 0 0 0' }}>{viewingDoc.title}</h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                style={{ color: 'white', fontWeight: 900, fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="sih-modal-body">
              <div style={{ backgroundColor: 'var(--primary-navy)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '3rem' }}>📄</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--mint-light)', margin: 0 }}>{viewingDoc.fileName}</p>
                <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: 0 }}>
                  Uploaded by {viewingDoc.doctor} on {formatDate(viewingDoc.date)}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => { handleDownload(viewingDoc.id, viewingDoc.fileName); setViewingDoc(null); }}
                  className="sih-btn sih-btn-primary"
                >
                  Download Document
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="sih-btn sih-btn-outline"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
