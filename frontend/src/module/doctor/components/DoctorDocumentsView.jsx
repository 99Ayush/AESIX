import React, { useState } from 'react';
import { DUMMY_LAB_REPORTS } from '../../../shared/labReportsData';
import { FileText, Download, Eye, FlaskConical, FolderGit2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const DoctorDocumentsView = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'user-docs' | 'lab-reports'
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [selectedUserDoc, setSelectedUserDoc] = useState(null);

  // Mock patient uploaded documents (User Uploaded Section)
  const userUploadedDocs = [
    {
      id: 'doc-u-001',
      title: 'Previous Prescriptions & Outpatient Slip',
      type: 'prescription',
      fileName: 'Prescription_Dr_Sharma_Aug2026.pdf',
      date: '2026-08-14',
      size: '1.2 MB',
      status: 'Verified',
      uploadedBy: patient?.fullName || 'Patient'
    },
    {
      id: 'doc-u-002',
      title: 'Abdominal Ultrasound & Sonography Scan',
      type: 'disease',
      fileName: 'Ultrasound_Scan_Report_2026.pdf',
      date: '2026-07-28',
      size: '3.4 MB',
      status: 'Verified',
      uploadedBy: patient?.fullName || 'Patient'
    },
    {
      id: 'doc-u-003',
      title: 'Hospital Discharge Summary (Fortis Hospital)',
      type: 'discharge summary',
      fileName: 'Discharge_Summary_Fortis_2026.pdf',
      date: '2026-06-15',
      size: '2.8 MB',
      status: 'Verified',
      uploadedBy: patient?.fullName || 'Patient'
    }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="doc-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER & SECTION NAVIGATION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-light, #E2E8F0)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="doc-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <FolderGit2 size={22} color="var(--teal-primary, #2F8F83)" />
            Patient Clinical Documents & Lab Reports
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', margin: '0.25rem 0 0 0' }}>
            Inspect patient self-uploaded medical records and lab-verified pathology reports for <strong style={{ color: 'var(--primary-navy, #12304A)' }}>{patient?.fullName || 'Selected Patient'}</strong>.
          </p>
        </div>

        {/* SECTION TOGGLE PILLS */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--mint-bg, #F5FAF8)', padding: '0.3rem', borderRadius: '20px', border: '1px solid var(--border-light, #E2E8F0)' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`doc-view-pill ${activeTab === 'all' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            All Documents ({userUploadedDocs.length + DUMMY_LAB_REPORTS.length})
          </button>
          <button
            onClick={() => setActiveTab('user-docs')}
            className={`doc-view-pill ${activeTab === 'user-docs' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            📄 User Uploaded ({userUploadedDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('lab-reports')}
            className={`doc-view-pill ${activeTab === 'lab-reports' ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            🧪 Lab Reports ({DUMMY_LAB_REPORTS.length})
          </button>
        </div>
      </div>


      {/* ========================================================
          SECTION 1: USER UPLOADED DOCUMENTS
         ======================================================== */}
      {(activeTab === 'all' || activeTab === 'user-docs') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-primary, #2F8F83)' }}></span>
              Section 1: User Uploaded Documents ({userUploadedDocs.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Uploaded directly by patient</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {userUploadedDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light, #E2E8F0)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5.rem', borderRadius: '4px', backgroundColor: 'var(--mint-light, #E4F5EF)', color: 'var(--teal-primary, #2F8F83)' }}>
                      {doc.type}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={12} /> Stored
                    </span>
                  </div>

                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', margin: '0 0 0.25rem 0' }}>
                    {doc.title}
                  </h5>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', margin: 0 }}>
                    Uploaded on: <strong>{formatDate(doc.date)}</strong>
                  </p>

                  <div style={{ backgroundColor: 'var(--mint-bg, #F5FAF8)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-main, #183B56)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                      {doc.fileName}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted, #64748B)' }}>{doc.size}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setSelectedUserDoc(doc)}
                    style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary-navy, #12304A)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <Eye size={14} /> Preview Document
                  </button>
                  <button
                    onClick={() => alert(`Downloading ${doc.fileName}...`)}
                    style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-light, #E2E8F0)', backgroundColor: '#FFFFFF', color: 'var(--text-main, #183B56)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ========================================================
          SECTION 2: LAB REPORTS (UPDATED VIA LABS)
         ======================================================== */}
      {(activeTab === 'all' || activeTab === 'lab-reports') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              Section 2: Lab Reports (Uploaded via Diagnostic Labs) ({DUMMY_LAB_REPORTS.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={14} /> Verified via ABHA Exchange
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {DUMMY_LAB_REPORTS.map((report) => (
              <div
                key={report.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light, #E2E8F0)',
                  borderLeft: '4px solid var(--teal-primary, #2F8F83)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '0.85rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  {/* Lab Badge & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--teal-primary, #2F8F83)', backgroundColor: 'var(--mint-light, #E4F5EF)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      🏥 {report.labName}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: report.status === 'Borderline High' ? '#FEF3C7' : '#DCFCE7', color: report.status === 'Borderline High' ? '#D97706' : '#15803D' }}>
                      ✓ {report.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', margin: '0 0 0.35rem 0' }}>
                    {report.testTitle}
                  </h5>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', marginBottom: '0.6rem' }}>
                    Ref ID: <strong style={{ color: 'var(--primary-navy, #12304A)' }}>{report.sampleId}</strong> • Date: <strong>{formatDate(report.reportDate)}</strong>
                  </div>

                  {/* Parameter Summary Box */}
                  <div style={{ backgroundColor: 'var(--mint-bg, #F5FAF8)', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', textTransform: 'uppercase' }}>
                      Key Result Highlights:
                    </span>
                    {report.summaryMetrics.map((m, mIdx) => (
                      <div key={mIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-main, #183B56)' }}>{m.name}</span>
                        <strong style={{ color: m.status === 'High' || m.status === 'Elevated' ? '#DC2626' : 'var(--primary-navy, #12304A)' }}>
                          {m.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', fontStyle: 'italic', margin: '0.6rem 0 0 0' }}>
                    "{report.summaryNote}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setSelectedLabReport(report)}
                    style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--teal-primary, #2F8F83)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <FlaskConical size={14} /> Inspect Full Lab Report
                  </button>
                  <button
                    onClick={() => alert(`Downloading official ${report.fileName}...`)}
                    style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-light, #E2E8F0)', backgroundColor: '#FFFFFF', color: 'var(--text-main, #183B56)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    title="Download Official PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* LAB REPORT MODAL PREVIEW FOR DOCTOR */}
      {selectedLabReport && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 48, 74, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-light, #E2E8F0)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, var(--primary-navy, #12304A), var(--teal-primary, #2F8F83))', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  🏥 {selectedLabReport.labName} ({selectedLabReport.labBadge})
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: '0.3rem 0 0 0' }}>
                  {selectedLabReport.testTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLabReport(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ backgroundColor: 'var(--mint-bg, #F5FAF8)', border: '1px solid var(--border-light, #E2E8F0)', padding: '0.85rem', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted, #64748B)' }}>Sample Ref ID:</span>
                  <p style={{ margin: 0, fontWeight: 800, fontFamily: 'monospace' }}>{selectedLabReport.sampleId}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted, #64748B)' }}>Report Date:</span>
                  <p style={{ margin: 0, fontWeight: 800 }}>{formatDate(selectedLabReport.reportDate)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted, #64748B)' }}>Ordering Physician:</span>
                  <p style={{ margin: 0, fontWeight: 800 }}>{selectedLabReport.referredBy}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted, #64748B)' }}>Pathologist:</span>
                  <p style={{ margin: 0, fontWeight: 800 }}>{selectedLabReport.technician}</p>
                </div>
              </div>

              {/* Full Parameter Table */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy, #12304A)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Complete Clinical Breakdown
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', border: '1px solid var(--border-light, #E2E8F0)', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--primary-navy, #12304A)', color: '#FFFFFF', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Parameter</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Observed Result</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Reference Range</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLabReport.summaryMetrics.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: i % 2 === 0 ? '#FFFFFF' : 'var(--mint-bg, #F5FAF8)' }}>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>{m.name}</td>
                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 800 }}>{m.value}</td>
                        <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted, #64748B)' }}>{m.range}</td>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: m.status === 'Normal' ? '#DCFCE7' : '#FEE2E2', color: m.status === 'Normal' ? '#15803D' : '#B91C1C' }}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clinical Note */}
              <div style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '0.85rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF' }}>Clinical Impression:</span>
                <p style={{ fontSize: '0.82rem', color: '#1E3A8A', margin: '0.2rem 0 0 0' }}>{selectedLabReport.summaryNote}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => alert(`Downloading official PDF ${selectedLabReport.fileName}...`)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--teal-primary, #2F8F83)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Download Official PDF Report
                </button>
                <button
                  onClick={() => setSelectedLabReport(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)', backgroundColor: '#FFFFFF', color: 'var(--text-main, #183B56)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* USER DOC PREVIEW MODAL FOR DOCTOR */}
      {selectedUserDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18, 48, 74, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '550px', width: '100%', border: '1px solid var(--border-light, #E2E8F0)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--primary-navy, #12304A)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: 'var(--mint-light, #E4F5EF)', color: 'var(--teal-primary, #2F8F83)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {selectedUserDoc.type}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: '0.3rem 0 0 0' }}>
                  {selectedUserDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserDoc(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--primary-navy, #12304A)', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '3rem' }}>📄</span>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--mint-light, #E4F5EF)', margin: 0 }}>{selectedUserDoc.fileName}</p>
                <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: 0 }}>
                  Uploaded by {selectedUserDoc.uploadedBy} on {formatDate(selectedUserDoc.date)}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => alert(`Downloading ${selectedUserDoc.fileName}...`)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--teal-primary, #2F8F83)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Download File
                </button>
                <button
                  onClick={() => setSelectedUserDoc(null)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-light, #E2E8F0)', backgroundColor: '#FFFFFF', color: 'var(--text-main, #183B56)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
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
};

export default DoctorDocumentsView;
