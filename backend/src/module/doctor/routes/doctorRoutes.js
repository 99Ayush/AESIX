import { Router } from 'express';
import {
  handleSearchAbha,
  handleGetPatientProfile,
  handleGetPatientForms,
  handleRequestAccess,
  handleGetMyRequests,
  handleGetFormData,
} from '../controller/doctorController.js';

const router = Router();

// Search patients by ABHA ID
router.get('/search-abha', handleSearchAbha);

// Get patient profile
router.get('/patient-profile/:userId', handleGetPatientProfile);

// Get patient SOCRATES forms (metadata + consent status)
router.get('/patient-forms/:userId', handleGetPatientForms);

// Request access to a specific form
router.post('/request-access', handleRequestAccess);

// List all requests made by this doctor
router.get('/my-requests', handleGetMyRequests);

// Get full form data (only if consent accepted)
router.get('/form/:formId', handleGetFormData);

export default router;
