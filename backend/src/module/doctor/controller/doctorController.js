import { getPatientDetailsForDoctor, searchPatientsForDoctor } from '../service/doctorService.js';

export async function handleGetPatientData(req, res, next) {
  try {
    const { patientId } = req.params;
    const data = await getPatientDetailsForDoctor(patientId || 'user-1');
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

export async function handleSearchPatients(req, res, next) {
  try {
    const { q } = req.query;
    const patients = await searchPatientsForDoctor(q || '');
    return res.json({ success: true, data: patients });
  } catch (error) {
    return next(error);
  }
}
