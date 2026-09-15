import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../userPages.css';
import { fileToBase64, userApi } from '../services/userApi';
import { onDatabaseChange } from '../services/realtime';
import { useDashboardLanguage } from '../LanguageContext';
import PatientSidebar from '../components/asidebar';
import ChatbotFAB from '../components/ChatbotFAB';
import DoctorActivityBell from '../components/DoctorActivityBell';
import BrandLogo from '../../../shared/BrandLogo';
import {
  FileText,
 Landmark, 
  CircleUser,
  LogOut,
  Phone,
  Pencil,Bell,BookOpen,Mail,
  Pill,
  TestTube,
  Calendar,
  Search,
  Download,
  Share2,
  Eye,
 Trash2,
  Lock,
  Cloud,
  Contact,
  Folder
} from "lucide-react";
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

  const [documents, setDocuments] = useState([]);

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
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [cloudSource, setCloudSource] = useState(null);
  const [cloudUrl, setCloudUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Preview Modal State
  const [viewingDoc, setViewingDoc] = useState(null);

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toViewModel = (document) => ({
    ...document,
    date: document.createdAt,
    fileSize: `${(document.size / (1024 * 1024)).toFixed(1)} MB`,
    status: 'Stored',
    doctor: 'You',
  });

  // Toast Notification Helper
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchDocuments = () => {
      userApi.documents().then((items) => setDocuments(items.map(toViewModel))).catch((error) => showNotification(error.message));
    };
    fetchDocuments();
    return onDatabaseChange(fetchDocuments);
  }, []);

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

  const handleCloudImport = async () => {
    if (!cloudUrl.trim()) {
      showNotification(`Paste a shared ${cloudSource === 'gdrive' ? 'Google Drive' : 'Dropbox'} link first.`);
      return;
    }
    setIsImporting(true);
    try {
      const imported = await userApi.importCloudDocument(cloudSource, cloudUrl.trim());
      const bytes = Uint8Array.from(atob(imported.content), (character) => character.charCodeAt(0));
      const file = new File([bytes], imported.fileName, { type: imported.mimeType || 'application/octet-stream' });
      setSelectedFile(file);
      setUploadTitle((current) => current || imported.fileName.replace(/\.[^/.]+$/, ''));
      setCloudUrl('');
      setCloudSource(null);
      setSourceMenuOpen(false);
      showNotification(`${imported.fileName} is ready to save.`);
    } catch (error) {
      showNotification(error.message || 'Unable to import this shared file.');
    } finally {
      setIsImporting(false);
    }
  };

  // Submit Upload
  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file first!');
      return;
    }

    try {
      const saved = await userApi.uploadDocument({
        title: uploadTitle.trim() || selectedFile.name,
        type: uploadCategory,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        content: await fileToBase64(selectedFile),
      });
      setDocuments((previous) => [toViewModel(saved), ...previous]);
      setSelectedFile(null);
      setUploadTitle('');
      showNotification(`Document "${saved.title}" saved permanently.`);
    } catch (error) {
      showNotification(error.message);
    }
  };

  // Delete Document Handler
  const handleDeleteDoc = async (id) => {
    try {
      await userApi.deleteDocument(id);
      setDocuments((previous) => previous.filter((document) => document.id !== id));
      showNotification('Document removed.');
    } catch (error) {
      showNotification(error.message);
    }
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
          <BrandLogo subtitle="Health Portal" />


          <div className="sih-header-controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sih-lang-select" data-no-translate translate="no">
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी</option>
              <option value="Bengali">🌐 বাংলা</option>
              <option value="Tamil">🌐 தமிழ்</option>
            </select>
            <DoctorActivityBell />
            <div className="sih-profile-wrapper" ref={profileRef}>
              <button className="sih-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="sih-profile-avatar">RK</div>
                <span className="sih-profile-name">Profile</span>
                <span className={`sih-profile-chevron ${profileOpen ? 'open' : ''}`}>▾</span>
              </button>
              {profileOpen && (
                <div className="sih-profile-dropdown">
                  <button className="sih-profile-dropdown-item" onClick={() => { navigate('/profile'); setProfileOpen(false); }}>
                    <span className="dd-icon"><CircleUser /> </span> Profile
                  </button>
                  <button className="sih-profile-dropdown-item danger" onClick={() => setProfileOpen(false)}>
                    <span className="dd-icon"><LogOut /></span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="patient-main-container">
        <PatientSidebar activePage="uploadDoc" />
        <div className="patient-content-area">
          {/* MAIN CONTAINER */}
          <main className="sih-main-layout">

        {/* DOCUMENT FILTER & ACTION BAR */}
        <div className="sih-card" style={{ display: 'none' }} aria-hidden="true">
          
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
              <option value="newest"> NEWEST FIRST </option>
              <option value="oldest"> OLDEST FIRST</option>
            </select>
          </div>

          {/* CATEGORY FILTER BUTTONS */}
          <div className="consent-filter-nav" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
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

            <button
              onClick={() => setActiveFilter('lab report')}
              className={`sih-btn ${activeFilter === 'lab report' ? 'sih-btn-primary' : 'sih-btn-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
            >
              Lab Reports ({documents.filter(d => d.type === 'lab report').length})
            </button>
          </div>

        </div>

        {/* MAIN UPLOAD & DOCUMENTS AREA */}
        <div className="sih-card" style={{ order: 1, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* CENTRAL UPLOAD AREA */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setSourceMenuOpen((open) => !open)}
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
              <Search size={22} />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-navy)', margin: 0 }}>Upload Medical Document</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>
                Drag & drop a file, or choose where to upload it from.
              </p>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                Supported formats: PDF, JPG, PNG, DOC (Max file size: 15MB)
              </p>
            </div>

            {sourceMenuOpen && (
              <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '500px', margin: '1rem auto 0', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0.8rem', textAlign: 'left' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--primary-navy)' }}>Choose upload source</strong>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                  <button className="sih-btn sih-btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => { setSourceMenuOpen(false); fileInputRef.current?.click(); }}>💻 Desktop</button>
                  <button className="sih-btn sih-btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setCloudSource('gdrive')}>Google Drive</button>
                  <button className="sih-btn sih-btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setCloudSource('dropbox')}>Dropbox</button>
                </div>
                {cloudSource && (
                  <div style={{ marginTop: '0.8rem' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Shared {cloudSource === 'gdrive' ? 'Google Drive' : 'Dropbox'} file link</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="sih-input" value={cloudUrl} onChange={(event) => setCloudUrl(event.target.value)} placeholder={cloudSource === 'gdrive' ? 'https://drive.google.com/file/d/…/view' : 'https://www.dropbox.com/s/…'} />
                      <button className="sih-btn sih-btn-primary" onClick={handleCloudImport} disabled={isImporting}>{isImporting ? 'Importing…' : 'Import'}</button>
                    </div>
                    <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>The file must be shared for anyone with the link to view or download.</p>
                  </div>
                )}
              </div>
            )}

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
                      <option value="lab report">Lab Report</option>
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

          <div className="documents-workspace">
            <aside className="documents-filter-panel">
              <label className="documents-filter-label" htmlFor="document-sort">Sort by</label>
              <select id="document-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="sih-select">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>

              <p className="documents-filter-label" style={{ marginTop: '1.5rem' }}>Categories</p>
              <div className="documents-category-list">
                {[
                  ['all', 'All Records', documents.length],
                  ['disease', 'Disease / Scan Reports', documents.filter((doc) => doc.type === 'disease').length],
                  ['prescription', 'Prescriptions', documents.filter((doc) => doc.type === 'prescription').length],
                  ['discharge summary', 'Discharge Summaries', documents.filter((doc) => doc.type === 'discharge summary').length],
                  ['lab report', 'Lab Reports', documents.filter((doc) => doc.type === 'lab report').length],
                ].map(([key, label, count]) => (
                  <button key={key} onClick={() => setActiveFilter(key)} className={activeFilter === key ? 'active' : ''}>
                    <span>{label}</span><strong>{count}</strong>
                  </button>
                ))}
              </div>
            </aside>

            <div className="documents-results-panel">
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
                          : doc.type === 'lab report'
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
                        <span><FileText size={24} strokeWidth={2} /></span>
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
                      <span><Eye size={22} /></span> View Document
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="sih-btn sih-btn-outline"
                      style={{ padding: '0.5rem', color: '#EF4444' }}
                      title="Delete Record"
                    >
                      <Trash2 size={24} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--mint-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '2.5rem' }}><FileText /></div>
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
          </div>

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
                  onClick={() => {
                    showNotification(`Downloading ${viewingDoc.fileName}...`);
                    setViewingDoc(null);
                  }}
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
      </div>

      <ChatbotFAB />
    </div>
  );
}
