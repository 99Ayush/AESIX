import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { searchICDAPI } from "./icdService.js";
import { enrichAyurvedicClinicalProfile } from "./ayurvedicClinicalEngine.js";

const databasePath = fileURLToPath(new URL("../data/namaste-db.json", import.meta.url));
const catalogPath = fileURLToPath(new URL("../data/namaste-catalog.json", import.meta.url));
let database = JSON.parse(await readFile(databasePath, "utf8"));
const namasteCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
const profileByCode = new Map(database.map(record => [record.code.toLowerCase(), record]));
const catalogByCode = new Map(namasteCatalog.map(record => [record.code.toLowerCase(), record]));

export async function saveDatabase() { await writeFile(databasePath, JSON.stringify(database, null, 2) + "\n", "utf8"); }

// --- Typo corrections applied during symptom parsing ---
const TYPO_MAP = {
  "tirednes": "tiredness",
  "needing pain": "needling pain",
  "retension": "retention",
  "supression": "suppression",
  "conciousness": "consciousness",
};

function fixTypos(text) {
  let fixed = text;
  for (const [wrong, right] of Object.entries(TYPO_MAP)) {
    fixed = fixed.replace(new RegExp(wrong, "gi"), right);
  }
  return fixed;
}

// --- Symptom definition parser ---
export function parseDefinitionSymptoms(definition) {
  if (!definition || definition.startsWith("No definition") || definition === "Dynamically fetched from WHO ICD-11 search.") return null;
  const regex = /([a-zA-Z~\u0100-\u017F\u1E00-\u1EFF]+(?:\/[a-zA-Z~\u0100-\u017F\u1E00-\u1EFF]+)*)\s*\[([^\]]+)\]/g;
  const symptoms = [];
  let match;
  while ((match = regex.exec(definition)) !== null) {
    const rawGloss = fixTypos(match[2].trim());
    symptoms.push({ term: match[1].trim(), gloss: rawGloss });
  }
  if (symptoms.length === 0) return null;
  return symptoms;
}

// Generate a one-line biomedical correlate from parsed symptom glosses
export function generateBiomedicalSummary(parsedSymptoms) {
  if (!parsedSymptoms || parsedSymptoms.length === 0) return null;
  const glosses = parsedSymptoms.map(s => s.gloss.toLowerCase());
  const unique = [...new Set(glosses)];
  if (unique.length <= 3) return unique.join(", ");
  return unique.slice(0, -1).join(", ") + ", and " + unique[unique.length - 1];
}

// --- Completeness scoring ---
export function computeCompleteness(record) {
  const fields = [
    { key: "definition", populated: !!(record.clinicalOverview?.definition && !record.clinicalOverview.definition.startsWith("No definition") && record.clinicalOverview.definition !== "Dynamically fetched from WHO ICD-11 search."), label: "Clinical definition" },
    { key: "cardinalSymptoms", populated: (record.clinicalOverview?.cardinalSymptoms?.length || 0) > 0, label: "Cardinal symptoms" },
    { key: "dominantDosha", populated: !!(record.pathomechanism?.dominantDosha?.length > 0 && record.pathomechanism.dominantDosha[0] !== "Not catalogued" && record.pathomechanism.dominantDosha[0] !== "Not classified"), label: "Dominant dosha" },
    { key: "srotasInvolved", populated: !!(record.pathomechanism?.srotasInvolved?.length > 0 && record.pathomechanism.srotasInvolved[0] !== "Not catalogued" && record.pathomechanism.srotasInvolved[0] !== "Not classified"), label: "Srotas involved" },
    { key: "classicalFormulations", populated: (record.treatmentFramework?.classicalFormulations?.length || 0) > 0, label: "Classical formulations" },
    { key: "pathya", populated: (record.treatmentFramework?.pathya?.length || 0) > 0, label: "Pathya (beneficial)" },
    { key: "apathya", populated: (record.treatmentFramework?.apathya?.length || 0) > 0, label: "Apathya (avoid)" },
    { key: "suggestedTests", populated: !!(record.labCorrelations?.suggestedTests?.length > 0 && record.labCorrelations.suggestedTests[0] !== "Select tests based on clinical presentation and guideline."), label: "Lab tests" },
  ];
  const populated = fields.filter(f => f.populated).length;
  const total = fields.length;
  return { populated, total, percentage: Math.round((populated / total) * 100), fields };
}

// --- Breadcrumb hierarchy builder ---
export function buildBreadcrumb(code) {
  const crumbs = [];
  // Try parent via dot: EB-2.1 -> EB-2
  if (code.includes('.')) {
    const parentCode = code.substring(0, code.lastIndexOf('.'));
    const entry = catalogByCode.get(parentCode.toLowerCase());
    if (entry) crumbs.unshift({ code: entry.code, englishEquivalent: entry.englishEquivalent, ayurvedicTerm: entry.ayurvedicTerm });
    // Try grandparent via dash: EB-2 -> EB
    if (parentCode.includes('-')) {
      const gpCode = parentCode.substring(0, parentCode.lastIndexOf('-'));
      if (!crumbs.find(c => c.code.toLowerCase() === gpCode.toLowerCase())) {
        const gpEntry = catalogByCode.get(gpCode.toLowerCase());
        if (gpEntry) crumbs.unshift({ code: gpEntry.code, englishEquivalent: gpEntry.englishEquivalent, ayurvedicTerm: gpEntry.ayurvedicTerm });
      }
    }
  } else if (code.includes('-')) {
    const parentCode = code.substring(0, code.lastIndexOf('-'));
    const entry = catalogByCode.get(parentCode.toLowerCase());
    if (entry) crumbs.unshift({ code: entry.code, englishEquivalent: entry.englishEquivalent, ayurvedicTerm: entry.ayurvedicTerm });
  }
  return crumbs;
}

// English synonym → Ayurvedic/transliteration lookup for common medical terms
const ENGLISH_SYNONYMS = {
  "fever": ["jvara", "jwara"],
  "diabetes": ["madhumeha", "prameha"],
  "cough": ["kasa", "kasha"],
  "diarrhea": ["atisara", "atisar"],
  "diarrhoea": ["atisara", "atisar"],
  "asthma": ["shvasa", "svasa", "tamaka"],
  "obesity": ["sthaulya", "medoroga"],
  "anemia": ["pandu"],
  "anaemia": ["pandu"],
  "jaundice": ["kamala"],
  "constipation": ["vibandha"],
  "hemorrhoids": ["arsha"],
  "piles": ["arsha"],
  "arthritis": ["amavata", "sandhi"],
  "skin": ["kushtha"],
  "epilepsy": ["apasmara"],
  "anxiety": ["unmada", "chittodvega"],
  "depression": ["vishada"],
  "urinary": ["mutrakriccha", "mutra"],
  "vomiting": ["chardi"],
  "indigestion": ["ajirna", "mandagni"],
  "headache": ["shiroroga", "shira"],
  "cold": ["pratishyaya"],
  "rhinitis": ["pratishyaya"],
  "heart": ["hridroga"],
  "liver": ["yakrit"],
  "kidney": ["vrukka", "mutravaha"],
  "thyroid": ["galaganda"],
  "gout": ["vatarakta"],
  "leucorrhea": ["shveta pradara"],
  "leucorrhoea": ["shveta pradara"],
  "bleeding": ["rakta pitta"],
  "burn": ["dagdha"],
  "wound": ["vrana"],
};

// --- Search with optional system filter ---
export function searchNamasteCodes(query = "", system = "") {
  const needle = query.trim().toLowerCase();
  const systemFilter = system.trim().toLowerCase();

  // Expand English synonyms to Ayurvedic terms for matching
  const synonyms = ENGLISH_SYNONYMS[needle] || [];
  const allNeedles = [needle, ...synonyms];

  let matches = namasteCatalog.filter(record => {
    if (!needle) return true;
    const fields = [record.code, record.ayurvedicTerm, record.transliteration, record.englishEquivalent];
    return allNeedles.some(n => fields.some(value => value?.toLowerCase().includes(n)));
  });

  if (systemFilter && systemFilter !== "all") {
    matches = matches.filter(record => {
      const src = (record.source || "").toLowerCase();
      return src.includes(systemFilter);
    });
  }
  return matches.slice(0, 50).map(record => {
    const local = profileByCode.get(record.code.toLowerCase());
    const merged = { ...record, ...(local || {}) };
    enrichAyurvedicClinicalProfile(merged);
    merged.hasEnrichedClinicalProfile = true;
    return merged;
  });
}

function catalogRecord(record) {
  const base = {
    code: record.code,
    systemOfMedicine: "Ayurveda (NAMASTE official catalog)",
    ayurvedicTerm: record.ayurvedicTerm || record.transliteration || record.code,
    transliteration: record.transliteration || record.ayurvedicTerm || record.code,
    englishEquivalent: record.englishEquivalent || "No English equivalent supplied by source",
    icd11PrimaryCode: null,
    icd11EntityUri: null,
    icd11MappingStatus: "pending",
    icd11EquivalenceType: null,
    icd11MappingVersion: "ICD-11 2024-01 MMS / NAMASTE SAT-Combined 2026-09-13",
    catalogVersion: "NAMASTE Portal SAT-Combined, downloaded 2026-09-13",
    lastUpdated: "2026-09-15",
    prognosis: { status: "Manageable with individualized protocol; follow clinical staging", riskLevel: "Requires clinical assessment" },
    pathomechanism: { dominantDosha: ["Not catalogued"], srotasInvolved: ["Not catalogued"], phenotypeCheck: "Use a qualified Ayurvedic clinician's assessment." },
    clinicalOverview: { definition: record.definition || "No definition supplied by the source catalog.", cardinalSymptoms: [], redFlags: ["Escalate according to the patient's presentation and local clinical protocol."] },
    labCorrelations: { suggestedTests: [], targets: {} },
    treatmentFramework: { chikitsaSutra: "", classicalFormulations: [], pathya: [], apathya: [] },
    source: record.source,
    parentCode: record.parentCode
  };
  return enrichAyurvedicClinicalProfile(base);
}

function dynamicRecord(queryCode, item = {}) {
  const title = item.title || item.matchingPhrases?.[0]?.label || queryCode;
  const entityUri = item.id || item.entityId || item.theCodeAndTitle?.id || null;
  const code = item.theCodeAndTitle?.code || item.code || queryCode;
  const base = {
    code, systemOfMedicine: "WHO ICD-11 (dynamically cached)", ayurvedicTerm: title, transliteration: title, englishEquivalent: title,
    icd11PrimaryCode: code, icd11EntityUri: entityUri,
    icd11MappingStatus: "mapped",
    icd11EquivalenceType: "exact",
    icd11MappingVersion: "ICD-11 2024-01 MMS (live search)",
    catalogVersion: null,
    lastUpdated: new Date().toISOString().split("T")[0],
    prognosis: { status: "Requires clinical assessment", riskLevel: "Determine from WHO entity and patient presentation" },
    pathomechanism: { dominantDosha: ["Not classified"], srotasInvolved: ["Not classified"], phenotypeCheck: "Assess metabolic, systemic, and localized dosha involvement." },
    clinicalOverview: { definition: "Dynamically fetched from WHO ICD-11 search.", cardinalSymptoms: [], redFlags: ["Follow condition-specific urgent-care guidance."] },
    labCorrelations: { suggestedTests: ["Complete Blood Count (CBC)", "Routine urinalysis", "Clinical chemistry panel as indicated."], targets: {} },
    treatmentFramework: { chikitsaSutra: "", classicalFormulations: [], pathya: [], apathya: [] }
  };
  return enrichAyurvedicClinicalProfile(base);
}

export async function getOrFetchDiseaseRecord(queryCode, entityUri = null) {
  const normalized = decodeURIComponent(queryCode).toLowerCase();
  const local = profileByCode.get(normalized);
  if (local) {
    // Enrich existing DB records with new metadata fields if missing
    enrichAyurvedicClinicalProfile(local);
    if (!local.icd11MappingStatus) local.icd11MappingStatus = local.icd11PrimaryCode ? "mapped" : "unmapped";
    if (!local.parsedSymptoms && local.clinicalOverview?.definition) {
      local.parsedSymptoms = parseDefinitionSymptoms(local.clinicalOverview.definition);
      if (local.parsedSymptoms) local.biomedicalSummary = generateBiomedicalSummary(local.parsedSymptoms);
    }
    if (!local.breadcrumb) local.breadcrumb = buildBreadcrumb(local.code);
    local.completeness = computeCompleteness(local);
    return local;
  }
  const catalogEntry = catalogByCode.get(normalized);
  if (catalogEntry) {
    const rec = catalogRecord(catalogEntry);
    let rawQuery = rec.englishEquivalent && rec.englishEquivalent !== "No English equivalent supplied by source"
      ? rec.englishEquivalent : rec.transliteration;
    const searchQuery = rawQuery
      ? rawQuery.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').split(/[\/;,\-]/)[0].trim()
      : null;
    if (searchQuery) {
      try {
        let icdSearchResult = await searchICDAPI(searchQuery);
        let topEntity = icdSearchResult?.destinationEntities?.[0] || icdSearchResult?.entities?.[0];
        if (!topEntity && searchQuery.includes(' ')) {
          const words = searchQuery.split(/\s+/).filter(w => !['due', 'only', 'to', 'of', 'type', 'in', 'and', 'the'].includes(w.toLowerCase()));
          if (words.length > 0) {
            const reducedQuery = words.slice(-2).join(' ');
            icdSearchResult = await searchICDAPI(reducedQuery);
            topEntity = icdSearchResult?.destinationEntities?.[0] || icdSearchResult?.entities?.[0];
          }
        }
        if (topEntity) {
          rec.icd11PrimaryCode = topEntity.theCode || topEntity.theCodeAndTitle?.code || null;
          rec.icd11EntityUri = topEntity.id || topEntity.stemId || null;
          rec.icd11MappingStatus = "mapped";
        } else {
          rec.icd11MappingStatus = "unmapped";
        }
      } catch {
        rec.icd11MappingStatus = "unmapped";
      }
    } else {
      rec.icd11MappingStatus = "unmapped";
    }
    // Link parent code and siblings in hierarchy
    if (rec.code.includes('.')) {
      const parentCodeCandidate = rec.code.substring(0, rec.code.lastIndexOf('.'));
      const parentEntry = catalogByCode.get(parentCodeCandidate.toLowerCase()) || profileByCode.get(parentCodeCandidate.toLowerCase());
      if (parentEntry) {
        rec.parentDisease = {
          code: parentEntry.code,
          ayurvedicTerm: parentEntry.ayurvedicTerm || parentEntry.transliteration,
          englishEquivalent: parentEntry.englishEquivalent || parentEntry.transliteration
        };
      }
      const prefix = parentCodeCandidate + '.';
      rec.relatedCodes = namasteCatalog
        .filter(c => c.code.startsWith(prefix) && c.code !== rec.code)
        .slice(0, 6)
        .map(c => ({ code: c.code, ayurvedicTerm: c.ayurvedicTerm, englishEquivalent: c.englishEquivalent }));
    }
    // Add computed enrichments
    enrichAyurvedicClinicalProfile(rec);
    rec.parsedSymptoms = parseDefinitionSymptoms(rec.clinicalOverview?.definition);
    if (rec.parsedSymptoms) rec.biomedicalSummary = generateBiomedicalSummary(rec.parsedSymptoms);
    rec.breadcrumb = buildBreadcrumb(rec.code);
    rec.completeness = computeCompleteness(rec);
    return rec;
  }
  if (entityUri) {
    const record = dynamicRecord(queryCode, { id: entityUri, title: queryCode });
    enrichAyurvedicClinicalProfile(record);
    record.breadcrumb = buildBreadcrumb(record.code);
    record.completeness = computeCompleteness(record);
    database.push(record);
    profileByCode.set(record.code.toLowerCase(), record);
    await saveDatabase();
    return record;
  }
  const results = await searchICDAPI(queryCode);
  const item = results.destinationEntities?.[0] || results.entities?.[0] || results.items?.[0];
  if (!item) throw new Error(`No WHO ICD-11 result found for "${queryCode}".`);
  const record = dynamicRecord(queryCode, item);
  enrichAyurvedicClinicalProfile(record);
  record.breadcrumb = buildBreadcrumb(record.code);
  record.completeness = computeCompleteness(record);
  database.push(record);
  profileByCode.set(record.code.toLowerCase(), record);
  await saveDatabase();
  return record;
}

