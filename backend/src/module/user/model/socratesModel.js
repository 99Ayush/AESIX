import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String },
  fileType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const socratesSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  site: { type: String, required: true },
  onset: { type: String, required: true },
  character: { type: String, required: true },
  radiation: { type: String, default: '' },
  associations: { type: String, default: '' },
  timeCourse: { type: String, required: true },
  exacerbatingFactors: { type: String, default: '' },
  severity: { type: Number, required: true, min: 1, max: 10 },
  priorHistory: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },
  documents: [documentSchema],
}, {
  timestamps: true
});

export const SocratesAssessment = mongoose.model('SocratesAssessment', socratesSchema);
export default SocratesAssessment;
