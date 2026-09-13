import 'dotenv/config';
import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { notifyDatabaseChange } from '../../shared/realtime.js';
import { searchNamasteCodes, getOrFetchDiseaseRecord } from './services/namasteService.js';
import { searchICDAPI, lookupICDCode, fetchICDEntityDetails } from './services/icdService.js';
import { User, UserSession } from '../auth/model/model.js';
import multer from 'multer';
import { uploadBufferToCloudinary } from '../../shared/cloudinary.js';
import SocratesAssessment from './model/socratesModel.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
const dataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'user.json');
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
let mongoCollection;
let mongoConnecting;
let mongoUnavailableUntil = 0;
const seed = {
  profile: {
    id: 'user-1',
    name: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    occupation: '',
    primaryLanguage: '',
    contact: {
      phone: '',
      email: '',
      address: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: ''
    },
    medications: [],
    allergies: [],
    conditions: [],
    criticalAlerts: []
  },
  abha: {
    number: '',
    phrAddress: '',
    verificationStatus: 'Unlinked',
    issuedDate: ''
  },
  consents: [],
  documents: []
};
const copySeed = () => JSON.parse(JSON.stringify(seed));
const getCollection = async () => {
  if (!mongoUri) return null;
  if (mongoCollection) return mongoCollection;
  if (Date.now() < mongoUnavailableUntil) return null;
  if (!mongoConnecting) {
    mongoConnecting = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 })
      .connect()
      .then((client) => {
        mongoCollection = client.db(process.env.MONGODB_DB || 'aesix').collection('users');
        return mongoCollection;
      })
      .catch((error) => {
        mongoConnecting = null;
        mongoUnavailableUntil = Date.now() + 30000;
        console.error(`MongoDB unavailable; using local demo data: ${error.message}`);
        return null;
      });
  }
  return mongoConnecting;
};
const readMock = async () => { try { return JSON.parse(await fs.readFile(dataFile, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; const data = copySeed(); await fs.writeFile(dataFile, JSON.stringify(data, null, 2)); return data; } };
const resolveAuthUser = async (req) => {
  try {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const session = await UserSession.findOne({ xToken: token }).sort({ createdAt: -1 });
      if (session?.userId) {
        const user = await User.findOne({ userId: session.userId });
        if (user) return user;
      }
    }
    // Fallback: check most recently verified user session or user
    const latestSession = await UserSession.findOne().sort({ createdAt: -1 });
    if (latestSession?.userId) {
      const user = await User.findOne({ userId: latestSession.userId });
      if (user) return user;
    }
    const latestUser = await User.findOne().sort({ updatedAt: -1 });
    return latestUser || null;
  } catch (err) {
    console.error('Error resolving authenticated user:', err.message);
    return null;
  }
};

const mergeUserWithData = (data, authUser) => {
  if (!authUser) return data;
  const fullName = `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.fullName || data.profile.name;
  return {
    ...data,
    profile: {
      ...data.profile,
      id: authUser.userId || authUser._id?.toString() || data.profile.id,
      name: fullName,
      dob: authUser.dob || authUser.dateOfBirth || data.profile.dob,
      gender: authUser.gender === 'M' ? 'Male' : (authUser.gender === 'F' ? 'Female' : (authUser.gender || data.profile.gender)),
      contact: {
        ...data.profile.contact,
        phone: authUser.mobile || authUser.phone || data.profile.contact.phone,
        email: authUser.email || data.profile.contact.email,
        address: authUser.city || authUser.address || data.profile.contact.address,
        emergencyContactName: authUser.emergencyContactName || data.profile.contact.emergencyContactName || 'Family Member',
        emergencyContactRelation: authUser.emergencyContactRelation || data.profile.contact.emergencyContactRelation || 'Relative',
        emergencyContactPhone: authUser.emergencyContactPhone || authUser.mobile || authUser.phone || data.profile.contact.emergencyContactPhone,
      },
    },
    abha: {
      ...data.abha,
      number: authUser.abhaNumber || data.abha.number,
      phrAddress: authUser.abhaAddress || (authUser.phrAddress?.[0]) || data.abha.phrAddress,
      verificationStatus: authUser.kycVerified ? 'Verified' : (authUser.abhaStatus || 'Linked'),
    },
  };
};

const read = async (req = null) => {
  const collection = await getCollection();
  let data;
  if (!collection) {
    data = await readMock();
  } else {
    const stored = await collection.findOne({ _id: 'user-1' });
    if (stored) {
      const { _id, ...rest } = stored;
      data = rest;
    } else {
      data = copySeed();
      await collection.insertOne({ _id: 'user-1', ...data, createdAt: new Date() });
    }
  }

  if (req) {
    const authUser = await resolveAuthUser(req);
    data = mergeUserWithData(data, authUser);
  }
  return data;
};

const write = async (data) => {
  const collection = await getCollection();
  if (!collection) {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
  } else {
    await collection.replaceOne({ _id: 'user-1' }, { _id: 'user-1', ...data, updatedAt: new Date() }, { upsert: true });
  }
  notifyDatabaseChange('update', 'users', 'user-1');
};
const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ success: false, error });

router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await read(req);
    respond(res, {
      profile: data.profile,
      abha: data.abha,
      pendingConsents: data.consents.filter((item) => item.status === 'pending'),
      documentCount: data.documents.length,
    });
  } catch (e) {
    next(e);
  }
});

router.route('/profile')
  .get(async (req, res, next) => {
    try {
      const data = await read(req);
      respond(res, data.profile);
    } catch (e) {
      next(e);
    }
  })
  .patch(async (req, res, next) => {
    try {
      const data = await read(req);
      Object.assign(data.profile, req.body);
      await write(data);
      respond(res, data.profile);
    } catch (e) {
      next(e);
    }
  });

router.get('/abha', async (req, res, next) => {
  try {
    const data = await read(req);
    respond(res, {
      ...data.abha,
      name: data.profile.name,
      dob: data.profile.dob,
      gender: data.profile.gender,
      bloodGroup: data.profile.bloodGroup,
      contact: data.profile.contact,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/consents', async (req, res, next) => { try { const data = await read(); respond(res, data.consents.filter((item) => !req.query.status || item.status === req.query.status).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))); } catch (e) { next(e); } });
router.patch('/consents/:id', async (req, res, next) => { try { if (!['accepted', 'rejected'].includes(req.body.status)) return fail(res, 'status must be accepted or rejected'); const data = await read(); const consent = data.consents.find((item) => item.id === req.params.id); if (!consent) return fail(res, 'Consent not found', 404); consent.status = req.body.status; consent.respondedAt = new Date().toISOString(); await write(data); respond(res, consent); } catch (e) { next(e); } });
router.get('/documents', async (req, res, next) => { try { const { documents } = await read(); const q = req.query.q?.toLowerCase(); const items = documents.filter((item) => (!req.query.type || item.type === req.query.type) && (!q || item.title.toLowerCase().includes(q) || item.fileName.toLowerCase().includes(q))).sort((a, b) => (req.query.order === 'oldest' ? 1 : -1) * a.createdAt.localeCompare(b.createdAt)).map(({ content, ...item }) => item); respond(res, items); } catch (e) { next(e); } });
router.post('/documents', async (req, res, next) => { try { const { title, type, fileName, mimeType, size, content } = req.body; if (!title || !fileName || !content || !['disease', 'prescription', 'discharge summary'].includes(type)) return fail(res, 'title, type, fileName, and content are required'); const data = await read(); const item = { id: randomUUID(), title: title.trim(), type, fileName, mimeType: mimeType || 'application/octet-stream', size: Number(size) || 0, content, createdAt: new Date().toISOString() }; data.documents.push(item); await write(data); const { content: _, ...saved } = item; respond(res, saved, 201); } catch (e) { next(e); } });
router.get('/documents/:id/download', async (req, res, next) => { try { const item = (await read()).documents.find((doc) => doc.id === req.params.id); if (!item) return fail(res, 'Document not found', 404); res.type(item.mimeType).attachment(item.fileName).send(Buffer.from(item.content, 'base64')); } catch (e) { next(e); } });
router.delete('/documents/:id', async (req, res, next) => { try { const data = await read(); const index = data.documents.findIndex((doc) => doc.id === req.params.id); if (index < 0) return fail(res, 'Document not found', 404); data.documents.splice(index, 1); await write(data); res.status(204).end(); } catch (e) { next(e); } });

// SOCRATES Symptom Assessment & Cloudinary Document Upload
router.post('/socrates', upload.array('documents', 5), async (req, res, next) => {
  try {
    const authUser = await resolveAuthUser(req);
    const userId = authUser?._id?.toString() || authUser?.userId || req.body.userId || 'guest_user';
    const userName = authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : (req.body.userName || 'Patient');

    const {
      site,
      onset,
      character,
      radiation,
      associations,
      timeCourse,
      exacerbatingFactors,
      severity,
      priorHistory,
      additionalNotes
    } = req.body;

    if (!site || !onset || !character || !timeCourse || !severity) {
      return res.status(400).json({ success: false, error: 'Site, Onset, Character, Time course, and Severity are required fields.' });
    }

    const uploadedDocs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadBufferToCloudinary(file.buffer, file.originalname);
          uploadedDocs.push({
            name: file.originalname,
            url: result.secure_url,
            publicId: result.public_id,
            fileType: file.mimetype,
            uploadedAt: new Date()
          });
        } catch (uploadErr) {
          console.error(`Failed to upload ${file.originalname} to Cloudinary:`, uploadErr);
          uploadedDocs.push({
            name: file.originalname,
            url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            fileType: file.mimetype,
            uploadedAt: new Date()
          });
        }
      }
    }

    const assessment = new SocratesAssessment({
      userId,
      userName,
      site,
      onset,
      character,
      radiation: radiation || '',
      associations: associations || '',
      timeCourse,
      exacerbatingFactors: exacerbatingFactors || '',
      severity: Number(severity),
      priorHistory: priorHistory || '',
      additionalNotes: additionalNotes || '',
      documents: uploadedDocs
    });

    await assessment.save();
    notifyDatabaseChange('socrates_submission', { id: assessment._id, userId });

    res.status(201).json({
      success: true,
      message: 'SOCRATES assessment saved successfully',
      assessment
    });
  } catch (error) {
    console.error('Error saving SOCRATES assessment:', error);
    next(error);
  }
});

router.get('/socrates', async (req, res, next) => {
  try {
    const authUser = await resolveAuthUser(req);
    const userId = authUser?._id?.toString() || authUser?.userId;
    const query = userId ? { userId } : {};
    const assessments = await SocratesAssessment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
});

router.get('/socrates/patient/:userId', async (req, res, next) => {
  try {
    const assessments = await SocratesAssessment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {

  try {
    const id = req.params.id;
    let foundUser = null;
    if (id && id !== 'user-1') {
      try {
        foundUser = await User.findById(id);
      } catch (_) {}
      if (!foundUser) {
        foundUser = await User.findOne({ $or: [{ userId: id }, { aadhaar: id }, { abhaNumber: id }] });
      }
    }
    const data = await read(req);
    if (foundUser) {
      const merged = mergeUserWithData(data, foundUser);
      return respond(res, {
        ...merged.profile,
        fullName: merged.profile.name,
        abhaNumber: merged.abha.number,
        phrAddress: merged.abha.phrAddress,
      });
    }
    respond(res, data.profile);
  } catch (e) {
    next(e);
  }
});

// CDSS / Health Codes (NAMASTE & WHO ICD-11)
router.get('/cdss/search/namaste', (req, res) => {
  try {
    res.json({ success: true, results: searchNamasteCodes(req.query.q || '') });
  } catch (e) {
    fail(res, e.message, 500);
  }
});

router.get('/cdss/search/icd11', async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    if (/^[A-Za-z0-9][A-Za-z0-9./&-]*$/.test(query)) {
      const exactMatch = await lookupICDCode(query.toUpperCase());
      if (exactMatch) return res.json({ success: true, destinationEntities: [exactMatch], source: 'WHO ICD-11 codeinfo' });
    }
    const data = await searchICDAPI(query);
    res.json({ success: true, ...data });
  } catch (error) {
    fail(res, error.message, 502);
  }
});

router.get('/cdss/disease/:code', async (req, res, next) => {
  try {
    const record = await getOrFetchDiseaseRecord(req.params.code, req.query.entityUri);
    let icd11Details = null;
    if (record.icd11EntityUri) {
      try {
        icd11Details = await fetchICDEntityDetails(record.icd11EntityUri);
      } catch (error) {
        icd11Details = { unavailable: true, message: error.message };
      }
    }
    res.json({ success: true, ...record, icd11Details });
  } catch (error) {
    fail(res, error.message, 502);
  }
});

export default router;


