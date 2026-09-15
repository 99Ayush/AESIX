import { User } from '../../auth/model/model.js';
import SocratesAssessment from '../../user/model/socratesModel.js';
import ConsentRequest from '../model/consentRequestModel.js';

/**
 * Doctor Service Layer — Real MongoDB queries
 */

/**
 * Search patients by ABHA ID (partial match)
 */
const escapeRegExp = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function searchByAbha(abhaId = '') {
  const q = abhaId.trim();
  if (!q || q.length < 2) return [];

  // Escaped partial match (fast: projection + small limit + hard timeout).
  // ABHA is numeric with dashes; also allow name/mobile fallback when the
  // ABHA field yields nothing (doctor often types a name).
  const safe = escapeRegExp(q);
  const abhaQuery = { abhaNumber: { $regex: safe, $options: 'i' } };
  let users = await User.find(abhaQuery)
    .select('_id userId firstName lastName dob gender bloodGroup mobile email abhaNumber photoUrl city')
    .limit(10)
    .maxTimeMS(4000)
    .lean();
  if (!users.length && q.length >= 3) {
    users = await User.find({
      $or: [
        { firstName: { $regex: safe, $options: 'i' } },
        { lastName: { $regex: safe, $options: 'i' } },
        { mobile: { $regex: safe, $options: 'i' } },
      ],
    })
      .select('_id userId firstName lastName dob gender bloodGroup mobile email abhaNumber photoUrl city')
      .limit(10)
      .maxTimeMS(4000)
      .lean();
  }

  return users.map((u) => ({
    id: u._id.toString(),
    fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown',
    dob: u.dob || '',
    gender: u.gender === 'M' ? 'Male' : u.gender === 'F' ? 'Female' : (u.gender || ''),
    bloodGroup: u.bloodGroup || '',
    phone: u.mobile || '',
    email: u.email || '',
    abhaId: u.abhaNumber || '',
    photoUrl: u.photoUrl || null,
    city: u.city || '',
  }));
}

/**
 * Get full patient profile from Auth User collection
 */
export async function getPatientProfile(userId) {
  let u = null;
  try {
    u = await User.findById(userId).lean();
  } catch (_) { /* not an ObjectId — fall through to UUID/ABHA lookup */ }
  if (!u) {
    u = await User.findOne({
      $or: [{ userId }, { abhaNumber: userId }, { mobile: userId }],
    }).lean();
  }
  if (!u) return null;

  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
  const birthYear = u.dob ? new Date(u.dob).getFullYear() : null;
  const currentYear = new Date().getFullYear();

  return {
    id: u._id.toString(),
    fullName,
    dob: u.dob || '',
    age: birthYear ? currentYear - birthYear : null,
    gender: u.gender === 'M' ? 'Male' : u.gender === 'F' ? 'Female' : (u.gender || ''),
    bloodGroup: u.bloodGroup || '',
    phone: u.mobile || '',
    email: u.email || '',
    abhaId: u.abhaNumber || '',
    photoUrl: u.photoUrl || null,
    city: u.city || '',
    emergencyContactName: u.emergencyContactName || '',
    emergencyContactRelation: u.emergencyContactRelation || '',
    emergencyContactPhone: u.emergencyContactPhone || '',
  };
}

/**
 * Get SOCRATES forms for a patient (metadata only — no document URLs)
 * Also attaches the consent status for each form relative to the requesting doctor.
 */
export async function getPatientForms(patientId, doctorId = '') {
  const pid = String(patientId || '').trim();
  if (!pid || pid === 'undefined' || pid === 'null') {
    return [];
  }
  let user = null;
  try { user = await User.findById(pid).lean(); } catch (_) {}
  if (!user) {
    user = await User.findOne({ $or: [{ userId: pid }, { abhaNumber: pid }] }).lean();
  }
  const or = [{ userId: pid }, { userObjectId: pid }, { patientAbha: pid }];
  if (user) {
    const oid = user._id ? user._id.toString() : '';
    const uuid = user.userId || '';
    const abha = user.abhaNumber || '';
    if (oid) or.push({ userId: oid }, { userObjectId: oid });
    if (uuid) or.push({ userId: uuid }, { userObjectId: uuid });
    if (abha) or.push({ patientAbha: abha });
  }
  const assessments = await SocratesAssessment.find({ $or: or })
    .sort({ createdAt: -1 })
    .maxTimeMS(5000)
    .lean();

  // Fetch all consent requests from this doctor for this patient's forms
  let consentMap = {};
  if (doctorId) {
    const consents = await ConsentRequest.find({
      doctorId,
      patientId,
    }).lean();
    for (const c of consents) {
      consentMap[c.formId] = c.status;
    }
  }

  return assessments.map((a) => ({
    id: a._id.toString(),
    site: a.site,
    onset: a.onset,
    character: a.character,
    severity: a.severity,
    timeCourse: a.timeCourse,
    createdAt: a.createdAt,
    userName: a.userName || '',
    documentCount: a.documents?.length || 0,
    consentStatus: consentMap[a._id.toString()] || 'none',
  }));
}

/**
 * Create a consent request from a doctor for a specific SOCRATES form
 */
export async function requestFormAccess({ doctorId, doctorName, patientId, patientAbha, formId, formSite }) {
  // Check if a request already exists
  const existing = await ConsentRequest.findOne({ doctorId, formId });
  if (existing) {
    if (existing.status === 'rejected') {
      // Allow re-request after rejection
      existing.status = 'pending';
      existing.requestedAt = new Date();
      existing.respondedAt = null;
      await existing.save();
      return existing;
    }
    return existing; // already pending or accepted
  }

  const request = new ConsentRequest({
    doctorId,
    doctorName: doctorName || 'Doctor',
    patientId,
    patientAbha: patientAbha || '',
    formId,
    formSite: formSite || '',
  });
  await request.save();
  return request;
}

/**
 * Get all consent requests made by a doctor
 */
export async function getDoctorRequests(doctorId) {
  return ConsentRequest.find({ doctorId }).sort({ requestedAt: -1 }).lean();
}

/**
 * Get full SOCRATES form data — ONLY if consent is accepted
 */
export async function getFormWithConsent(doctorId, formId) {
  const consent = await ConsentRequest.findOne({ doctorId, formId });
  if (!consent || consent.status !== 'accepted') {
    return { authorized: false, reason: consent ? `Request is ${consent.status}` : 'No access request found' };
  }

  const form = await SocratesAssessment.findById(formId).lean();
  if (!form) {
    return { authorized: false, reason: 'Form not found' };
  }

  return {
    authorized: true,
    form: {
      id: form._id.toString(),
      userId: form.userId,
      userName: form.userName,
      site: form.site,
      onset: form.onset,
      character: form.character,
      radiation: form.radiation,
      associations: form.associations,
      timeCourse: form.timeCourse,
      exacerbatingFactors: form.exacerbatingFactors,
      severity: form.severity,
      priorHistory: form.priorHistory,
      additionalNotes: form.additionalNotes,
      documents: form.documents || [],
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    },
  };
}

/**
 * Get all consent requests for a patient (for user-side display)
 */
export async function getPatientAccessRequests(patientId) {
  return ConsentRequest.find({ patientId }).sort({ requestedAt: -1 }).lean();
}

/**
 * Patient responds to a consent request (accept/reject)
 */
export async function respondToAccessRequest(requestId, patientId, status) {
  const request = await ConsentRequest.findOne({ _id: requestId, patientId });
  if (!request) return null;

  request.status = status;
  request.respondedAt = new Date();
  await request.save();
  return request;
}

// Keep legacy exports for backward compatibility
export { searchByAbha as searchPatientsForDoctor };
export async function getPatientDetailsForDoctor(patientId) {
  const profile = await getPatientProfile(patientId);
  if (!profile) return null;
  return { patient: profile, consultationResults: [], alerts: [] };
}
