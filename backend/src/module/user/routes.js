import 'dotenv/config';
import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';

const router = Router();
const dataFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'user.json');
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
let mongoCollection;
let mongoConnecting;
let mongoUnavailableUntil = 0;
const seed = {
  profile: {
    id: 'user-1', name: 'Rajesh Kumar', dob: '1992-03-15', gender: 'Male', bloodGroup: 'O+', maritalStatus: 'Married', occupation: 'Software Engineer', primaryLanguage: 'Hindi / English',
    contact: { phone: '9876543210', email: 'rajesh.kumar@example.com', address: 'House #104, Green Park Extension, New Delhi - 110016', emergencyContactName: 'Sunita Kumar', emergencyContactRelation: 'Spouse', emergencyContactPhone: '9876543211' },
    medications: [{ id: 'med-1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', timing: 'After Meals' }], allergies: ['Penicillin (Severe)'], conditions: ['Type 2 Diabetes'], criticalAlerts: []
  },
  abha: { number: '91-8472-1029-4821', phrAddress: 'rajesh.kumar@abdm', verificationStatus: 'Verified', issuedDate: '2023-01-12' },
  consents: [{ id: 'consent-1', requester: 'Apex Diagnostics Lab', purpose: 'Lab Report & Scan Access', requestedAt: '2026-09-09', status: 'pending' }, { id: 'consent-2', requester: 'Genomics India Lab', purpose: 'DNA Variant Data Access', requestedAt: '2026-09-11', status: 'pending' }],
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
const read = async () => {
  const collection = await getCollection();
  if (!collection) return readMock();
  const stored = await collection.findOne({ _id: 'user-1' });
  if (stored) { const { _id, ...data } = stored; return data; }
  const data = copySeed();
  await collection.insertOne({ _id: 'user-1', ...data, createdAt: new Date() });
  return data;
};
const write = async (data) => {
  const collection = await getCollection();
  if (!collection) return fs.writeFile(dataFile, JSON.stringify(data, null, 2));
  await collection.replaceOne({ _id: 'user-1' }, { _id: 'user-1', ...data, updatedAt: new Date() }, { upsert: true });
};
const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, error, status = 400) => res.status(status).json({ success: false, error });

router.get('/dashboard', async (_req, res, next) => { try { const data = await read(); respond(res, { profile: data.profile, abha: data.abha, pendingConsents: data.consents.filter((item) => item.status === 'pending'), documentCount: data.documents.length }); } catch (e) { next(e); } });
router.route('/profile').get(async (_req, res, next) => { try { respond(res, (await read()).profile); } catch (e) { next(e); } }).patch(async (req, res, next) => { try { const data = await read(); Object.assign(data.profile, req.body); await write(data); respond(res, data.profile); } catch (e) { next(e); } });
router.get('/abha', async (_req, res, next) => { try { const data = await read(); respond(res, { ...data.abha, name: data.profile.name, dob: data.profile.dob, gender: data.profile.gender, bloodGroup: data.profile.bloodGroup, contact: data.profile.contact }); } catch (e) { next(e); } });
router.get('/consents', async (req, res, next) => { try { const data = await read(); respond(res, data.consents.filter((item) => !req.query.status || item.status === req.query.status).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))); } catch (e) { next(e); } });
router.patch('/consents/:id', async (req, res, next) => { try { if (!['accepted', 'rejected'].includes(req.body.status)) return fail(res, 'status must be accepted or rejected'); const data = await read(); const consent = data.consents.find((item) => item.id === req.params.id); if (!consent) return fail(res, 'Consent not found', 404); consent.status = req.body.status; consent.respondedAt = new Date().toISOString(); await write(data); respond(res, consent); } catch (e) { next(e); } });
router.get('/documents', async (req, res, next) => { try { const { documents } = await read(); const q = req.query.q?.toLowerCase(); const items = documents.filter((item) => (!req.query.type || item.type === req.query.type) && (!q || item.title.toLowerCase().includes(q) || item.fileName.toLowerCase().includes(q))).sort((a, b) => (req.query.order === 'oldest' ? 1 : -1) * a.createdAt.localeCompare(b.createdAt)).map(({ content, ...item }) => item); respond(res, items); } catch (e) { next(e); } });
router.post('/documents', async (req, res, next) => { try { const { title, type, fileName, mimeType, size, content } = req.body; if (!title || !fileName || !content || !['disease', 'prescription', 'discharge summary'].includes(type)) return fail(res, 'title, type, fileName, and content are required'); const data = await read(); const item = { id: randomUUID(), title: title.trim(), type, fileName, mimeType: mimeType || 'application/octet-stream', size: Number(size) || 0, content, createdAt: new Date().toISOString() }; data.documents.push(item); await write(data); const { content: _, ...saved } = item; respond(res, saved, 201); } catch (e) { next(e); } });
router.get('/documents/:id/download', async (req, res, next) => { try { const item = (await read()).documents.find((doc) => doc.id === req.params.id); if (!item) return fail(res, 'Document not found', 404); res.type(item.mimeType).attachment(item.fileName).send(Buffer.from(item.content, 'base64')); } catch (e) { next(e); } });
router.delete('/documents/:id', async (req, res, next) => { try { const data = await read(); const index = data.documents.findIndex((doc) => doc.id === req.params.id); if (index < 0) return fail(res, 'Document not found', 404); data.documents.splice(index, 1); await write(data); res.status(204).end(); } catch (e) { next(e); } });

export default router;
