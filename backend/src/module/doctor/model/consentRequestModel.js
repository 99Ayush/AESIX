import mongoose from 'mongoose';

const consentRequestSchema = new mongoose.Schema({
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, default: 'Doctor' },
  patientId: { type: String, required: true, index: true },
  patientAbha: { type: String, default: '' },
  formId: { type: String, required: true, index: true },
  formSite: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true,
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null },
}, { timestamps: true });

// Prevent duplicate requests for the same doctor+form combo
consentRequestSchema.index({ doctorId: 1, formId: 1 }, { unique: true });

export const ConsentRequest = mongoose.model('ConsentRequest', consentRequestSchema);
export default ConsentRequest;
