import React, { useState } from 'react';
import { doctorApi } from '../services/doctorApi';
import SocratesFormDetail from './SocratesFormDetail';

const severityColor = (severity) => {
  if (severity >= 8) return '#EF4444';
  if (severity >= 5) return '#F59E0B';
  return '#10B981';
};

const statusConfig = {
  none: { label: 'Request Access', className: 'doc-consent-btn doc-consent-request' },
  pending: { label: 'Pending Approval', className: 'doc-consent-btn doc-consent-pending' },
  accepted: { label: 'View Form', className: 'doc-consent-btn doc-consent-accepted' },
  rejected: { label: 'Re-request Access', className: 'doc-consent-btn doc-consent-request' },
};

export const SocratesFormsList = ({ forms = [], patientId, patientAbha, onRefresh }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [loadingFormId, setLoadingFormId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRequestAccess = async (form) => {
    setLoadingFormId(form.id);
    try {
      await doctorApi.requestFormAccess({
        patientId,
        patientAbha: patientAbha || '',
        formId: form.id,
        formSite: form.site,
      });
      showToast(`Access request sent for "${form.site}" form`);
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast(`Failed: ${err.message}`);
    }
    setLoadingFormId(null);
  };

  const handleViewForm = async (form) => {
    setLoadingFormId(form.id);
    try {
      const data = await doctorApi.getFormData(form.id);
      if (data) {
        setSelectedForm(data);
      } else {
        showToast('Could not load form data. Access may have been revoked.');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
    setLoadingFormId(null);
  };

  const handleAction = (form) => {
    if (form.consentStatus === 'accepted') {
      handleViewForm(form);
    } else {
      handleRequestAccess(form);
    }
  };

  if (!forms.length) {
    return (
      <div className="doc-card doc-socrates-empty">
        <h4 className="doc-empty-title">No SOCRATES Forms Found</h4>
        <p className="doc-empty-text">This patient has not submitted any SOCRATES symptom assessments yet.</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="doc-toast">
          <span>{toast}</span>
        </div>
      )}

      <div className="doc-card doc-socrates-list-card">
        <div className="doc-card-header">
          <h3 className="doc-card-title">SOCRATES Assessments</h3>
          <span className="doc-forms-count">{forms.length} form{forms.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="doc-socrates-list">
          {forms.map((form) => {
            const config = statusConfig[form.consentStatus] || statusConfig.none;
            const isLoading = loadingFormId === form.id;
            const isPending = form.consentStatus === 'pending';

            return (
              <div key={form.id} className="doc-socrates-form-card">
                <div className="doc-socrates-form-top">
                  <div className="doc-socrates-form-info">
                    <div className="doc-socrates-site-row">
                      <span className="doc-socrates-site-label">Site:</span>
                      <span className="doc-socrates-site-value">{form.site}</span>
                    </div>
                    <div className="doc-socrates-meta-row">
                      <span className="doc-socrates-meta-item">
                        Character: <strong>{form.character}</strong>
                      </span>
                      <span className="doc-socrates-meta-item">
                        Onset: <strong>{form.onset}</strong>
                      </span>
                      <span className="doc-socrates-meta-item">
                        Time: <strong>{form.timeCourse}</strong>
                      </span>
                    </div>
                    <div className="doc-socrates-meta-row">
                      <span className="doc-socrates-meta-item">
                        Documents: <strong>{form.documentCount}</strong>
                      </span>
                      <span className="doc-socrates-meta-item">
                        {new Date(form.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="doc-socrates-form-right">
                    <div
                      className="doc-severity-badge"
                      style={{ backgroundColor: severityColor(form.severity) }}
                    >
                      <span className="doc-severity-number">{form.severity}</span>
                      <span className="doc-severity-label">/10</span>
                    </div>
                  </div>
                </div>

                <div className="doc-socrates-form-actions">
                  <button
                    className={config.className}
                    onClick={() => handleAction(form)}
                    disabled={isPending || isLoading}
                  >
                    {isLoading ? (
                      <span className="doc-btn-spinner">...</span>
                    ) : null}
                    <span>{isLoading ? 'Processing...' : config.label}</span>
                  </button>

                  {form.consentStatus === 'accepted' && (
                    <span className="doc-consent-status-tag doc-consent-granted-tag">
                      Access Granted
                    </span>
                  )}
                  {form.consentStatus === 'pending' && (
                    <span className="doc-consent-status-tag doc-consent-pending-tag">
                      Waiting for patient
                    </span>
                  )}
                  {form.consentStatus === 'rejected' && (
                    <span className="doc-consent-status-tag doc-consent-rejected-tag">
                      Request Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Detail Modal */}
      {selectedForm && (
        <SocratesFormDetail
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
    </>
  );
};

export default SocratesFormsList;
