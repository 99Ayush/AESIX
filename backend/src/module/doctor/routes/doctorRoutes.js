import { Router } from 'express';
import { handleGetPatientData, handleSearchPatients } from '../controller/doctorController.js';

const router = Router();

router.get('/patients', handleSearchPatients);
router.get('/patient/:patientId?', handleGetPatientData);

export default router;
