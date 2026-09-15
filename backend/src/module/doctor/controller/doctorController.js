import {
  searchByAbha,
  getPatientProfile,
  getPatientForms,
  requestFormAccess,
  getDoctorRequests,
  getFormWithConsent,
  logDoctorAccess,
} from '../service/doctorService.js';
import { notifyDatabaseChange } from '../../../shared/realtime.js';

const DOCTOR_ID = 'doctor-anirudh';
const DOCTOR_NAME = 'Dr. Anirudh Kanwat';

/**
 * GET /api/doctor/search-abha?abhaId=...
 */
export async function handleSearchAbha(req, res, next) {
  try {
    const { abhaId } = req.query;
    if (!abhaId || abhaId.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const patients = await searchByAbha(abhaId);
    return res.json({ success: true, data: patients });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/doctor/patient-profile/:userId
 */
export async function handleGetPatientProfile(req, res, next) {
  try {
    const { userId } = req.params;
    const profile = await getPatientProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    // Audit: notify the patient that their data was opened (fire-and-forget).
    logDoctorAccess({
      doctorId: DOCTOR_ID,
      doctorName: DOCTOR_NAME,
      patientId: profile.id,
      patientAbha: profile.abhaId || '',
      accessType: 'profile-view',
    }).then(() => {
      try { notifyDatabaseChange('update', 'doctor-access-log', profile.id); } catch { /* noop */ }
    });
    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/doctor/patient-forms/:userId
 */
export async function handleGetPatientForms(req, res, next) {
  try {
    const { userId } = req.params;
    const forms = await getPatientForms(userId, DOCTOR_ID);
    // Listing forms is refreshed automatically by the UI. Do not create an
    // access notification for every refresh; individual form access remains auditable.
    return res.json({ success: true, data: forms });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/doctor/request-access
 * Body: { patientId, patientAbha, formId, formSite }
 */
export async function handleRequestAccess(req, res, next) {
  try {
    const { patientId, patientAbha, formId, formSite } = req.body;
    if (!patientId || !formId) {
      return res.status(400).json({ success: false, error: 'patientId and formId are required' });
    }
    const request = await requestFormAccess({
      doctorId: DOCTOR_ID,
      doctorName: DOCTOR_NAME,
      patientId,
      patientAbha,
      formId,
      formSite,
    });
    try { notifyDatabaseChange('update', 'users', String(patientId)); } catch { /* noop */ }
    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key — request already exists
      return res.status(409).json({ success: false, error: 'Access request already exists for this form' });
    }
    return next(error);
  }
}

/**
 * GET /api/doctor/my-requests
 */
export async function handleGetMyRequests(req, res, next) {
  try {
    const requests = await getDoctorRequests(DOCTOR_ID);
    return res.json({ success: true, data: requests });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/doctor/form/:formId
 */
export async function handleGetFormData(req, res, next) {
  try {
    const { formId } = req.params;
    const result = await getFormWithConsent(DOCTOR_ID, formId);
    if (!result.authorized) {
      return res.status(403).json({ success: false, error: result.reason });
    }
    return res.json({ success: true, data: result.form });
  } catch (error) {
    return next(error);
  }
}
