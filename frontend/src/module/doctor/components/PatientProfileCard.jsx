import React from 'react';

const formatTagText = (item) => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    if (item.name) return `${item.name}${item.dosage ? ` - ${item.dosage}` : ''}`;
    if (item.title) return item.title;
    return Object.values(item).filter((v) => typeof v === 'string').join(' • ') || 'Detail';
  }
  return String(item);
};

export const PatientProfileCard = ({ patient }) => {
  if (!patient) return null;

  return (
    <div className="doc-card doc-profile-card">
      <div className="doc-card-header">
        <h3 className="doc-card-title">basic deatails of the patient/user</h3>
        <span className="doc-abha-pill">ABHA: {patient.abhaId}</span>
      </div>

      <div className="doc-profile-body">
        {/* Photo Box */}
        <div className="doc-photo-box">
          {patient.photoUrl ? (
            <img src={patient.photoUrl} alt={patient.fullName} className="doc-patient-photo" />
          ) : (
            <div className="doc-photo-placeholder">
              <span>photo</span>
            </div>
          )}
          <span className="doc-patient-id-badge">ID: {patient.id}</span>
        </div>

        {/* Detailed Fields */}
        <div className="doc-patient-info-grid">
          <div className="doc-info-row">
            <span className="doc-info-label">Full Name:</span>
            <span className="doc-info-value doc-highlight">{patient.fullName}</span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Age / DOB:</span>
            <span className="doc-info-value">{patient.age} yrs ({patient.dob})</span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Gender / Blood Group:</span>
            <span className="doc-info-value">{patient.gender} • <strong className="doc-blood-text">{patient.bloodGroup}</strong></span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Phone Number:</span>
            <span className="doc-info-value">{patient.contact?.phone}</span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Email Address:</span>
            <span className="doc-info-value">{patient.contact?.email}</span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Address:</span>
            <span className="doc-info-value">{patient.contact?.address}</span>
          </div>

          <div className="doc-info-row">
            <span className="doc-info-label">Emergency Contact:</span>
            <span className="doc-info-value">
              {patient.contact?.emergencyContactName} ({patient.contact?.emergencyContactRelation}) - {patient.contact?.emergencyContactPhone}
            </span>
          </div>
        </div>
      </div>

      <hr className="doc-divider" />

      {/* Additional Health History Tags */}
      <div className="doc-health-tags-section">
        <div className="doc-health-tag-group">
          <span className="doc-tag-label">Active Conditions:</span>
          <div className="doc-tags-list">
            {patient.conditions?.map((c, i) => (
              <span key={i} className="doc-tag doc-tag-condition">{formatTagText(c)}</span>
            ))}
          </div>
        </div>

        <div className="doc-health-tag-group">
          <span className="doc-tag-label">Known Allergies:</span>
          <div className="doc-tags-list">
            {patient.allergies?.map((a, i) => (
              <span key={i} className="doc-tag doc-tag-allergy">{formatTagText(a)}</span>
            ))}
          </div>
        </div>

        <div className="doc-health-tag-group">
          <span className="doc-tag-label">Current Medications:</span>
          <div className="doc-tags-list">
            {patient.medications?.map((m, i) => (
              <span key={i} className="doc-tag doc-tag-med">{formatTagText(m)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileCard;
