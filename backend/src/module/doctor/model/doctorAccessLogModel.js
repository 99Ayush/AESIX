import mongoose from 'mongoose';

// Audit log: every time a doctor opens a particular patient's data
// (profile view / records view), the patient gets a notification entry.
const doctorAccessLogSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, default: 'Doctor' },
  patientId: { type: String, required: true, index: true },
  patientAbha: { type: String, default: '' },
  accessType: {
    type: String,
    enum: ['profile-view', 'forms-view', 'form-view'],
    default: 'profile-view',
    index: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

doctorAccessLogSchema.index({ patientId: 1, createdAt: -1 });

export const DoctorAccessLog = mongoose.model('DoctorAccessLog', doctorAccessLogSchema);
export default DoctorAccessLog;
