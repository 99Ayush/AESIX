import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { searchICDAPI } from "./icdService.js";

const databasePath = fileURLToPath(new URL("../data/namaste-db.json", import.meta.url));
const catalogPath = fileURLToPath(new URL("../data/namaste-catalog.json", import.meta.url));
let database = JSON.parse(await readFile(databasePath, "utf8"));
const namasteCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
const profileByCode = new Map(database.map(record => [record.code.toLowerCase(), record]));
const catalogByCode = new Map(namasteCatalog.map(record => [record.code.toLowerCase(), record]));

export async function saveDatabase() { await writeFile(databasePath, JSON.stringify(database, null, 2) + "\n", "utf8"); }

export function searchNamasteCodes(query = "") {
  const needle = query.trim().toLowerCase();
  const matches = namasteCatalog.filter(record => !needle || [record.code, record.ayurvedicTerm, record.transliteration, record.englishEquivalent].some(value => value?.toLowerCase().includes(needle)));
  return matches.slice(0, 50).map(record => ({ ...record, ...profileByCode.get(record.code.toLowerCase()), hasEnrichedClinicalProfile: profileByCode.has(record.code.toLowerCase()) }));
}

function catalogRecord(record) {
  return {
    code: record.code,
    systemOfMedicine: "Ayurveda (NAMASTE official catalog)",
    ayurvedicTerm: record.ayurvedicTerm || record.transliteration || record.code,
    transliteration: record.transliteration || record.ayurvedicTerm || record.code,
    englishEquivalent: record.englishEquivalent || "No English equivalent supplied by source",
    icd11PrimaryCode: null,
    icd11EntityUri: null,
    prognosis: { status: "No condition-specific prognosis supplied by the terminology catalog", riskLevel: "Requires clinical assessment" },
    pathomechanism: { dominantDosha: ["Not catalogued"], srotasInvolved: ["Not catalogued"], phenotypeCheck: "Use a qualified Ayurvedic clinician's assessment." },
    clinicalOverview: { definition: record.definition || "No definition supplied by the source catalog.", cardinalSymptoms: [], redFlags: ["Escalate according to the patient's presentation and local clinical protocol."] },
    labCorrelations: { suggestedTests: [], targets: {} },
    treatmentFramework: { chikitsaSutra: "No treatment guidance is supplied by the official terminology catalog.", classicalFormulations: [], pathya: [], apathya: [] },
    source: record.source,
    parentCode: record.parentCode
  };
}

function dynamicRecord(queryCode, item = {}) {
  const title = item.title || item.matchingPhrases?.[0]?.label || queryCode;
  const entityUri = item.id || item.entityId || item.theCodeAndTitle?.id || null;
  const code = item.theCodeAndTitle?.code || item.code || queryCode;
  return {
    code, systemOfMedicine: "WHO ICD-11 (dynamically cached)", ayurvedicTerm: title, transliteration: title, englishEquivalent: title,
    icd11PrimaryCode: code, icd11EntityUri: entityUri,
    prognosis: { status: "Requires clinical assessment", riskLevel: "Determine from WHO entity and patient presentation" },
    pathomechanism: { dominantDosha: ["Not classified"], srotasInvolved: ["Not classified"], phenotypeCheck: "Use a qualified clinician's assessment; this is dynamically derived ICD-11 content." },
    clinicalOverview: { definition: "Dynamically fetched from WHO ICD-11 search.", cardinalSymptoms: [], redFlags: ["Follow condition-specific urgent-care guidance."] },
    labCorrelations: { suggestedTests: ["Select tests based on clinical presentation and guideline."], targets: {} },
    treatmentFramework: { chikitsaSutra: "No NAMASTE treatment layer is available for this dynamically cached ICD-11 result.", classicalFormulations: [], pathya: [], apathya: [] }
  };
}

export async function getOrFetchDiseaseRecord(queryCode, entityUri = null) {
  const normalized = decodeURIComponent(queryCode).toLowerCase();
  const local = profileByCode.get(normalized);
  if (local) return local;
  const catalogEntry = catalogByCode.get(normalized);
  if (catalogEntry) return catalogRecord(catalogEntry);
  if (entityUri) {
    const record = dynamicRecord(queryCode, { id: entityUri, title: queryCode });
    database.push(record);
    profileByCode.set(record.code.toLowerCase(), record);
    await saveDatabase();
    return record;
  }
  const results = await searchICDAPI(queryCode);
  const item = results.destinationEntities?.[0] || results.entities?.[0] || results.items?.[0];
  if (!item) throw new Error(`No WHO ICD-11 result found for "${queryCode}".`);
  const record = dynamicRecord(queryCode, item);
  database.push(record);
  profileByCode.set(record.code.toLowerCase(), record);
  await saveDatabase();
  return record;
}
