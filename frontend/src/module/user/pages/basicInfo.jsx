import React, { useState } from 'react';

// Formatting Utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export default function BasicInfo() {
  // Mock Patient Data
  const [patient, setPatient] = useState({
    id: '13520802724',
    abhaId: '91-8472-1029-4821',
    name: 'Rajesh Kumar',
    age: 32,
    gender: 'Male',
    dob: '1992-03-15',
    bloodGroup: 'O+',
    maritalStatus: 'Married',
    occupation: 'Software Engineer',
    primaryLanguage: 'Hindi / English',
    photo: null,
    contact: {
      phone: '9876543210',
      email: 'rajesh.kumar@example.com',
      address: 'House #104, Green Park Extension, New Delhi - 110016',
      emergencyContactName: 'Sunita Kumar',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '9876543211'
    },
    medications: [
      { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', timing: 'After Meals' },
      { id: 2, name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', timing: 'Morning' }
    ],
    allergies: ['Penicillin (Severe)', 'Dust Pollen (Mild)'],
    conditions: ['Type 2 Diabetes', 'Mild Hypertension'],
    criticalAlerts: [
      { id: 1, type: 'allergy', text: 'Penicillin Allergy - Severe Anaphylaxis Risk', severity: 'high' },
      { id: 2, type: 'vital', text: 'Monitor Blood Pressure Daily', severity: 'medium' }
    ],
    recentCheckups: [
      { id: 1, date: '2024-09-05', type: 'General Checkup', summary: 'BP: 130/85, Pulse: 72 bpm, Weight: 74 kg' },
      { id: 2, date: '2024-08-12', type: 'Endocrinology Consult', summary: 'HbA1c: 6.8%, Fasting Glucose: 118 mg/dL' },
      { id: 3, date: '2024-06-20', type: 'Annual Health Assessment', summary: 'Overall vitals stable. Advised diet control.' }
    ],
    vitalsSnapshot: {
      bp: '130/85 mmHg',
      heartRate: '72 bpm',
      spo2: '98%',
      temp: '98.4 °F',
      glucose: '118 mg/dL'
    }
  });

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'medications' | 'checkups'
  const [language, setLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Edit Mode
  const [formData, setFormData] = useState({ ...patient });
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', timing: '' });
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleContactChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: val }
    }));
  };

  const handleAddMedication = () => {
    if (!newMed.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { ...newMed, id: Date.now() }]
    }));
    setNewMed({ name: '', dosage: '', frequency: '', timing: '' });
  };

  const handleRemoveMedication = (id) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition.trim()]
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    setPatient({ ...formData });
    setIsEditing(false);
    showNotification('Patient basic information updated successfully!');
  };

  const handleCancel = () => {
    setFormData({ ...patient });
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5FAF8] text-[#183B56] font-sans antialiased">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2F8F83] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="bg-[#12304A] text-white shadow-lg top-2 z-40 w-full border-b border-slate-700">
        <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between gap-5 min-w-0">

          {/* Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#2F8F83] text-white font-extrabold text-lg flex items-center justify-center shadow-md flex-shrink-0">
              SIH
            </div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-base font-bold tracking-wide">SIH 2026 | Patient Case-Taking</h1>
              <p className="text-xs text-[#E4F5EF]/80">Doctor View • Clinical Documentation</p>
            </div>
          </div>



          {/* Search, Language & Doctor Info */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">

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
                className="bg-[#1a4163] text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-lg border border-slate-600 focus:outline-none focus:border-[#2F8F83] w-44 lg:w-56 transition"
              />
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#1a4163] text-xs text-white px-3 py-2.5 rounded-lg border border-slate-600 focus:outline-none cursor-pointer font-medium flex-shrink-0"
            >
              <option value="English">🌐 English</option>
              <option value="Hindi">🌐 हिंदी (Hindi)</option>
              <option value="Bengali">🌐 বাংলা (Bengali)</option>
              <option value="Tamil">🌐 தமிழ் (Tamil)</option>
            </select>

            {/* Doctor Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-700 pl-3 flex-shrink-0">
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

      {/* SUB-HEADER / ACTIONS BAR */}
      <div className="bg-white border-b border-slate-200 shadow-sm w-full px-4 sm:px-6 py-3.5 ">
        <div className="w-full flex items-center justify-between gap-4  px-40 flex-wrap min-w-0 ">

          <div className="flex items-center  gap-3  flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider  bg-[#E4F5EF] text-[#2F8F83] px-3 py-2 rounded-lg border border-[#2F8F83]/30 whitespace-nowrap ">
              Patient Record # {patient.id}
            </span>
            <span className="text-xs text-slate-600 font-bold hidden sm:inline">
              ABHA ID: <strong className="text-[#12304A]">{patient.abhaId}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#2F8F83] hover:bg-[#25756b] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={handlePrint}
                  className="bg-slate-100 hover:bg-slate-200 text-[#12304A] text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-300 transition flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print Summary
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-[#2F8F83] hover:bg-[#25756b] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Changes
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="w-full px-4 sm:px-6 py-6 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">

          {/* ==================== LEFT COLUMN: Patient Photo & Card (4 Cols) ==================== */}
          <div className="lg:col-span-4 min-w-0 space-y-6 lg:sticky lg:top-24 self-start">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#12304A] to-[#2F8F83] h-24 p-4 flex justify-end items-start">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md">
                  Active Patient
                </span>
              </div>

              <div className="px-6 pb-6 relative">
                {/* Photo & Blood Group */}
                <div className="-mt-10 mb-4 flex items-end justify-between">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 flex-shrink-0">
                    <div className="w-full h-full rounded-xl bg-[#EAF3FF] text-[#12304A] flex items-center justify-center font-black text-3xl">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>

                  <div className="bg-[#E4F5EF] text-[#2F8F83] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#2F8F83]/30 shadow-sm flex-shrink-0">
                    Blood Group: {isEditing ? (
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="bg-white text-xs border rounded px-1.5 py-0.5 ml-1 font-bold text-[#12304A]"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    ) : patient.bloodGroup}
                  </div>
                </div>

                {/* Patient Name & Details */}
                {!isEditing ? (
                  <div>
                    <h2 className="text-2xl font-black text-[#12304A] tracking-tight break-words">{patient.name}</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1.5">
                      {patient.age} Yrs • {patient.gender} • DOB: {formatDate(patient.dob)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full text-xs p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83] font-semibold text-[#12304A]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Age</label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          className="w-full text-xs p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full text-xs p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">DOB</label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => handleInputChange('dob', e.target.value)}
                          className="w-full text-xs p-2 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="my-5 border-t border-slate-100"></div>

                {/* Attributes */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Patient ID:</span>
                    <span className="font-bold font-mono text-[#12304A] bg-slate-100 px-2.5 py-1 rounded-md text-xs truncate">{patient.id}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">ABHA Health ID:</span>
                    <span className="font-bold text-slate-800 text-xs truncate">{patient.abhaId}</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Marital Status:</span>
                    <span className="font-bold text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.maritalStatus}
                          onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                          className="text-xs p-1.5 border rounded border-slate-300 w-28 text-right"
                        />
                      ) : patient.maritalStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Occupation:</span>
                    <span className="font-bold text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.occupation}
                          onChange={(e) => handleInputChange('occupation', e.target.value)}
                          className="text-xs p-1.5 border rounded border-slate-300 w-28 text-right"
                        />
                      ) : patient.occupation}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Primary Language:</span>
                    <span className="font-bold text-slate-700 text-right">{patient.primaryLanguage}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${patient.contact.phone}`}
                    className="bg-[#EAF3FF] hover:bg-blue-100 text-[#12304A] text-xs font-bold py-2.5 px-3 rounded-xl text-center transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current text-[#12304A] flex-shrink-0" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call Patient
                  </a>

                  <a
                    href={`mailto:${patient.contact.email}`}
                    className="bg-[#F0EBFF] hover:bg-purple-100 text-[#12304A] text-xs font-bold py-2.5 px-3 rounded-xl text-center transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current text-[#12304A] flex-shrink-0" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email Patient
                  </a>
                </div>

              </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F8F83] flex-shrink-0"></span>
                  Current Vitals Summary
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">Updated Today</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5FAF8] p-4 rounded-xl border border-[#2F8F83]/20">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Blood Pressure</p>
                  <p className="text-lg font-black text-[#12304A] mt-1.5">{patient.vitalsSnapshot.bp}</p>
                </div>

                <div className="bg-[#EAF3FF] p-4 rounded-xl border border-blue-200/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Heart Rate</p>
                  <p className="text-lg font-black text-[#12304A] mt-1.5">{patient.vitalsSnapshot.heartRate}</p>
                </div>

                <div className="bg-[#F0EBFF] p-4 rounded-xl border border-purple-200/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Blood Glucose</p>
                  <p className="text-lg font-black text-[#12304A] mt-1.5">{patient.vitalsSnapshot.glucose}</p>
                </div>

                <div className="bg-[#FDECEF] p-4 rounded-xl border border-pink-200/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Oxygen (SpO2)</p>
                  <p className="text-lg font-black text-[#12304A] mt-1.5">{patient.vitalsSnapshot.spo2}</p>
                </div>
              </div>
            </div>

          </div>

          {/* ==================== CENTER COLUMN: Main Content & Tabs (5 Cols) ==================== */}
          <div className="lg:col-span-5 min-w-0 space-y-6">

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-wrap lg:flex-nowrap gap-2 text-xs font-bold min-w-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 min-w-0 py-3 px-2 sm:px-4 rounded-xl transition text-center cursor-pointer ${activeTab === 'overview'
                  ? 'bg-[#12304A] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Personal & Contact
              </button>

              <button
                onClick={() => setActiveTab('medications')}
                className={`flex-1 min-w-0 py-3 px-2 sm:px-4 rounded-xl transition text-center cursor-pointer ${activeTab === 'medications'
                  ? 'bg-[#12304A] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Medications & Allergies
              </button>

              <button
                onClick={() => setActiveTab('checkups')}
                className={`flex-1 min-w-0 py-3 px-2 sm:px-4 rounded-xl transition text-center cursor-pointer ${activeTab === 'checkups'
                  ? 'bg-[#12304A] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Checkup History
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

                {/* Contact Section */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#2F8F83] fill-current flex-shrink-0" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contact Details
                  </h3>

                  {!isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F5FAF8] p-5 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Phone Number</p>
                        <p className="font-extrabold text-[#12304A] text-sm mt-1.5">{formatPhone(patient.contact.phone)}</p>
                      </div>

                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Email Address</p>
                        <p className="font-extrabold text-[#12304A] text-sm mt-1.5 break-all">{patient.contact.email}</p>
                      </div>

                      <div className="sm:col-span-2 pt-4 border-t border-slate-200/60">
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Residential Address</p>
                        <p className="font-semibold text-slate-800 text-xs mt-1.5 leading-relaxed break-words">{patient.contact.address}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-[#F5FAF8] p-5 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                        <input
                          type="text"
                          value={formData.contact.phone}
                          onChange={(e) => handleContactChange('phone', e.target.value)}
                          className="w-full p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) => handleContactChange('email', e.target.value)}
                          className="w-full p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Address</label>
                        <textarea
                          rows={2}
                          value={formData.contact.address}
                          onChange={(e) => handleContactChange('address', e.target.value)}
                          className="w-full p-2.5 border rounded-lg border-slate-300 mt-1 focus:outline-none focus:border-[#2F8F83]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 fill-current flex-shrink-0" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Emergency Contact
                  </h3>

                  {!isEditing ? (
                    <div className="bg-[#FDECEF] p-4 rounded-2xl border border-pink-200 text-xs flex flex-wrap justify-between items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-extrabold text-[#12304A] text-sm truncate">{patient.contact.emergencyContactName}</p>
                        <p className="text-slate-600 font-bold text-xs mt-1">Relation: {patient.contact.emergencyContactRelation}</p>
                      </div>
                      <a
                        href={`tel:${patient.contact.emergencyContactPhone}`}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-sm transition whitespace-nowrap"
                      >
                        {formatPhone(patient.contact.emergencyContactPhone)}
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FDECEF]/60 p-4 rounded-2xl border border-pink-200 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Contact Name</label>
                        <input
                          type="text"
                          value={formData.contact.emergencyContactName}
                          onChange={(e) => handleContactChange('emergencyContactName', e.target.value)}
                          className="w-full p-2.5 border rounded-md border-slate-300 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Relation</label>
                        <input
                          type="text"
                          value={formData.contact.emergencyContactRelation}
                          onChange={(e) => handleContactChange('emergencyContactRelation', e.target.value)}
                          className="w-full p-2.5 border rounded-md border-slate-300 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Phone</label>
                        <input
                          type="text"
                          value={formData.contact.emergencyContactPhone}
                          onChange={(e) => handleContactChange('emergencyContactPhone', e.target.value)}
                          className="w-full p-2.5 border rounded-md border-slate-300 mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Conditions */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-3">
                    Medical Conditions & Diagnoses
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? formData.conditions : patient.conditions).map((cond, idx) => (
                      <span
                        key={idx}
                        className="bg-[#E4F5EF] text-[#2F8F83] text-xs font-extrabold px-3 py-1.5 rounded-xl border border-[#2F8F83]/30 flex items-center gap-2"
                      >
                        {cond}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveCondition(idx)}
                            className="text-red-500 hover:text-red-700 font-bold text-sm ml-1 cursor-pointer leading-none"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add new condition (e.g. Asthma)"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="text-xs p-2.5 border rounded-md border-slate-300 flex-1"
                      />
                      <button
                        onClick={handleAddCondition}
                        className="bg-[#2F8F83] text-white text-xs px-4 py-2.5 rounded-md font-bold cursor-pointer flex-shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: MEDICATIONS */}
            {activeTab === 'medications' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

                {/* Active Prescribed Medications */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-4">
                    Active Prescribed Medications
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#12304A] text-white font-bold">
                          <th className="p-3.5">Medication</th>
                          <th className="p-3.5">Dosage</th>
                          <th className="p-3.5">Frequency</th>
                          <th className="p-3.5">Timing</th>
                          {isEditing && <th className="p-3.5">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(isEditing ? formData.medications : patient.medications).map((med) => (
                          <tr key={med.id} className="hover:bg-slate-50 transition">
                            <td className="p-3.5 font-extrabold text-[#12304A]">{med.name}</td>
                            <td className="p-3.5 text-slate-700 font-semibold">{med.dosage}</td>
                            <td className="p-3.5 text-slate-700 font-semibold">{med.frequency}</td>
                            <td className="p-3.5 text-slate-500 font-semibold">{med.timing}</td>
                            {isEditing && (
                              <td className="p-3.5">
                                <button
                                  onClick={() => handleRemoveMedication(med.id)}
                                  className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {isEditing && (
                    <div className="bg-[#F5FAF8] p-4 rounded-xl border border-slate-200 mt-4 text-xs space-y-3">
                      <p className="font-bold text-[#12304A]">Add New Medication</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newMed.name}
                          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                          className="p-2.5 border rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 500mg)"
                          value={newMed.dosage}
                          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                          className="p-2.5 border rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                          className="p-2.5 border rounded-md"
                        />
                        <input
                          type="text"
                          placeholder="Timing"
                          value={newMed.timing}
                          onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                          className="p-2.5 border rounded-md"
                        />
                      </div>
                      <button
                        onClick={handleAddMedication}
                        className="bg-[#2F8F83] text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer"
                      >
                        + Add Medication
                      </button>
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-3">
                    Known Allergies & Sensitivities
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? formData.allergies : patient.allergies).map((allg, idx) => (
                      <span
                        key={idx}
                        className="bg-red-50 text-red-700 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-2"
                      >
                        ⚠️ {allg}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveAllergy(idx)}
                            className="text-red-600 hover:text-red-900 font-bold ml-1 cursor-pointer leading-none"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add allergy (e.g. Sulfa Drugs)"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="text-xs p-2.5 border rounded-md border-slate-300 flex-1"
                      />
                      <button
                        onClick={handleAddAllergy}
                        className="bg-red-600 text-white text-xs px-4 py-2.5 rounded-md font-bold cursor-pointer flex-shrink-0"
                      >
                        Add Allergy
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: CHECKUP HISTORY */}
            {activeTab === 'checkups' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-2">
                  Recent Checkup Logs & Consultations
                </h3>

                <div className="space-y-3">
                  {patient.recentCheckups.map((ck) => (
                    <div key={ck.id} className="p-4 bg-[#F5FAF8] rounded-2xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-[#12304A] text-sm">{ck.type}</span>
                        <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">{formatDate(ck.date)}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-semibold">{ck.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Flow Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#12304A]">Basic Info Form Completed</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Proceed to record current vitals and physical symptoms.</p>
              </div>

              <button
                onClick={() => showNotification('Navigating to Step 2: Vitals Recording...')}
                className="bg-[#2F8F83] hover:bg-[#25756b] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                Proceed to Vitals →
              </button>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN: Critical Alerts & Notes (3 Cols) ==================== */}
          <div className="lg:col-span-3 min-w-0 space-y-6 lg:sticky lg:top-24 self-start">

            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 border-l-4 border-l-red-500 py-6 pl-5 pr-6">

              <h3 className="text-xs font-extrabold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 fill-current flex-shrink-0" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Critical Clinical Alerts
              </h3>

              <div className="space-y-3">
                {patient.criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border text-xs break-words ${alert.severity === 'high'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                  >
                    <p className="font-black uppercase text-[10px] tracking-wider mb-1.5">
                      {alert.type} • {alert.severity} Severity
                    </p>
                    <p className="font-bold text-xs leading-normal">{alert.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
              <h3 className="text-xs font-extrabold text-[#12304A] uppercase tracking-wider mb-1">
                Doctor Quick Actions
              </h3>

              <button
                onClick={() => showNotification('Prescription generator opened.')}
                className="w-full text-left bg-[#F5FAF8] hover:bg-[#E4F5EF] text-[#2F8F83] text-xs font-bold p-3.5 rounded-xl border border-[#2F8F83]/20 transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>💊 Generate Rx / Order Meds</span>
                <span className="flex-shrink-0">→</span>
              </button>

              <button
                onClick={() => showNotification('Lab test request form opened.')}
                className="w-full text-left bg-[#EAF3FF] hover:bg-blue-100 text-[#12304A] text-xs font-bold p-3.5 rounded-xl border border-blue-200 transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>🧪 Request Lab Investigation</span>
                <span className="flex-shrink-0">→</span>
              </button>

              <button
                onClick={() => showNotification('Follow-up appointment scheduled.')}
                className="w-full text-left bg-[#F0EBFF] hover:bg-purple-100 text-[#12304A] text-xs font-bold p-3.5 rounded-xl border border-purple-200 transition flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>📅 Schedule Follow-up Visit</span>
                <span className="flex-shrink-0">→</span>
              </button>
            </div>

            {/* Doctor Note */}
            <div className="bg-[#12304A] text-white rounded-2xl p-6 text-xs shadow-lg">
              <p className="font-extrabold text-[#E4F5EF] mb-2 text-sm">Doctor Note</p>
              <p className="text-slate-300 leading-relaxed font-semibold break-words">
                Patient presents with controlled HbA1c (6.8%). Continue current Metformin dosage. Monitor BP weekly and maintain sodium restriction.
              </p>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}