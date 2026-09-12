import React from 'react';

export const ConsultationResults = ({ consultations = [] }) => {
  return (
    <div className="doc-card doc-consultation-card">
      <div className="doc-card-header">
        <h3 className="doc-card-title">consolution results -:</h3>
        <span className="doc-count-badge">{consultations.length} Visits</span>
      </div>

      <div className="doc-consultation-body">
        {consultations.length === 0 ? (
          <p className="doc-empty-text">No consultation records available for this user.</p>
        ) : (
          consultations.map((item) => (
            <div key={item.id} className="doc-consult-item">
              <div className="doc-consult-top">
                <span className="doc-consult-date">📅 {item.date}</span>
                <span className="doc-consult-doc">{item.doctorName}</span>
              </div>

              <div className="doc-consult-detail">
                <div className="doc-consult-row">
                  <strong>Chief Complaint:</strong> {item.chiefComplaint}
                </div>
                <div className="doc-consult-row">
                  <strong>Diagnosis:</strong> <span className="doc-diagnosis-badge">{item.diagnosis}</span>
                </div>

                {item.vitalSigns && (
                  <div className="doc-vitals-row">
                    <span className="doc-vital-chip">BP: {item.vitalSigns.bp}</span>
                    <span className="doc-vital-chip">Pulse: {item.vitalSigns.heartRate}</span>
                    <span className="doc-vital-chip">Temp: {item.vitalSigns.temp}</span>
                    <span className="doc-vital-chip">SpO2: {item.vitalSigns.spo2}</span>
                  </div>
                )}

                {item.prescriptions && item.prescriptions.length > 0 && (
                  <div className="doc-rx-section">
                    <span className="doc-rx-label">Prescribed Medications:</span>
                    <ul className="doc-rx-list">
                      {item.prescriptions.map((rx, idx) => (
                        <li key={idx}>
                          <strong>{rx.medicine}</strong> — {rx.dosage} ({rx.duration})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.aiSummary && (
                  <div className="doc-ai-summary-box">
                    <span className="doc-ai-badge">🤖 GenAI Triage Note:</span> {item.aiSummary}
                  </div>
                )}

                {item.doctorNotes && (
                  <div className="doc-notes-row">
                    <strong>Doctor Notes:</strong> {item.doctorNotes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultationResults;
