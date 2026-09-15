import React from 'react';

const fieldLabel = (label) => (
  <div className="doc-form-detail-label">
    <span>{label}</span>
  </div>
);

export const SocratesFormDetail = ({ form, onClose }) => {
  if (!form) return null;

  const severity = Number(form.severity) || 0;
  const severityPercent = Math.min(Math.max((severity / 10) * 100, 10), 100);
  const severityColor = severity >= 8 ? '#EF4444' : severity >= 5 ? '#F59E0B' : '#10B981';
  const severityLabel = severity >= 8 ? 'High / Severe' : severity >= 5 ? 'Moderate' : 'Mild / Low';

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-card doc-form-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="doc-modal-header">
          <div className="doc-modal-header-left">
            <div className="doc-modal-header-top">
              <span className="doc-modal-badge">SOCRATES Assessment</span>
              <span className="doc-modal-date">
                {new Date(form.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            <h3 className="doc-modal-title">Pain Assessment - {form.site}</h3>
            {form.userName && (
              <div className="doc-form-detail-patient">
                Patient: <strong>{form.userName}</strong>
              </div>
            )}
          </div>
          <button className="doc-modal-close" onClick={onClose} title="Close modal">X</button>
        </div>

        {/* Modal Body */}
        <div className="doc-modal-body">
          {/* Severity Gauge */}
          <div className="doc-severity-section">
            <div className="doc-severity-header">
              {fieldLabel('Pain Severity Level')}
              <span className="doc-severity-status-pill" style={{ backgroundColor: `${severityColor}20`, color: severityColor, border: `1px solid ${severityColor}40` }}>
                {severityLabel} ({severity}/10)
              </span>
            </div>
            <div className="doc-severity-bar-track">
              <div
                className="doc-severity-bar-fill"
                style={{ width: `${severityPercent}%`, backgroundColor: severityColor }}
              />
            </div>
          </div>

          {/* SOCRATES Grid */}
          <div className="doc-form-detail-grid">
            <div className="doc-form-detail-field">
              {fieldLabel('Site (Location)')}
              <p className="doc-form-detail-value">{form.site || 'Not specified'}</p>
            </div>

            <div className="doc-form-detail-field">
              {fieldLabel('Onset (Start & Mode)')}
              <p className="doc-form-detail-value">{form.onset || 'Not specified'}</p>
            </div>

            <div className="doc-form-detail-field">
              {fieldLabel('Character (Type of Pain)')}
              <p className="doc-form-detail-value">{form.character || 'Not specified'}</p>
            </div>

            <div className="doc-form-detail-field">
              {fieldLabel('Radiation (Spread)')}
              <p className="doc-form-detail-value">{form.radiation || 'None reported'}</p>
            </div>

            <div className="doc-form-detail-field">
              {fieldLabel('Associated Symptoms')}
              <p className="doc-form-detail-value">{form.associations || 'None reported'}</p>
            </div>

            <div className="doc-form-detail-field">
              {fieldLabel('Time Course (Pattern)')}
              <p className="doc-form-detail-value">{form.timeCourse || 'Not specified'}</p>
            </div>

            <div className="doc-form-detail-field doc-form-detail-field-wide">
              {fieldLabel('Exacerbating / Relieving Factors')}
              <p className="doc-form-detail-value">{form.exacerbatingFactors || 'None reported'}</p>
            </div>
          </div>

          {/* Prior History */}
          {form.priorHistory && (
            <div className="doc-form-detail-section">
              {fieldLabel('Prior Clinical History')}
              <p className="doc-form-detail-value">{form.priorHistory}</p>
            </div>
          )}

          {/* Additional Notes */}
          {form.additionalNotes && (
            <div className="doc-form-detail-section">
              {fieldLabel('Additional Patient Notes')}
              <p className="doc-form-detail-value">{form.additionalNotes}</p>
            </div>
          )}

          {/* Attached Documents */}
          {form.documents && form.documents.length > 0 && (
            <div className="doc-form-detail-section">
              {fieldLabel(`Attached Clinical Reports & Files (${form.documents.length})`)}
              <div className="doc-form-docs-list">
                {form.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-form-doc-item"
                  >
                    <div className="doc-form-doc-info">
                      <span className="doc-form-doc-name">{doc.name || `Attachment ${idx + 1}`}</span>
                      <span className="doc-form-doc-sub">{doc.fileType || 'Medical Record'}</span>
                    </div>
                    <span className="doc-form-doc-arrow">View File</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="doc-modal-footer">
          <button className="doc-modal-close-btn" onClick={onClose}>
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocratesFormDetail;
