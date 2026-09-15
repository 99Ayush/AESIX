// node test-language.mjs — verifies all 4 languages across every tab + small blocks.
// Run from frontend/:  node test-language.mjs
import {
  words,
  LANG_ORDER,
  translatedFromEnglish,
  recoverEnglishSource,
  translated,
  resolveNodeSource,
  convoCodeForGlobal,
  globalForConvoCode,
} from './src/module/user/translations.js';

let pass = 0;
let fail = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { pass += 1; }
  else { fail += 1; failures.push(`${name} ${detail}`); }
}

// 1. Representative UI strings from EVERY tab, incl. small blocks/badges/options.
const tabStrings = [
  // header nav (all tabs)
  'MedVault', 'Health Portal', 'ABHA', 'Documents', 'Basic Info', 'Profile', 'Sign Out',
  // landing
  'Welcome back,', 'Last synced 3 min ago', 'Doctor Access Requests',
  'Pending Doctor Access Requests', 'No pending requests from doctors.',
  'A doctor is requesting consent to view your clinical SOCRATES assessment forms.',
  'Requested access to:', 'Form:', 'Accept', 'Reject', 'Grant Access', 'Decline',
  'Patient Profile', 'Active Patient', 'Edit Profile', 'Patient Information',
  'Patient ID', 'Gender', 'Contact', 'Address', 'ABHA Number', 'Date of Birth',
  'Blood Type', 'Email', 'Emergency', 'Status', 'Medical Dictionary',
  'Hiee', 'What can I do for you?', 'Known Allergies',
  'View and manage your allergies', 'Vaccination', 'View your vaccination records',
  // basic info small blocks
  'Print Summary', 'Call Patient', 'Email Patient', 'Current Vitals Summary',
  'Personal & Contact', 'Medications & Allergies', 'Checkup History', 'Contact Details',
  'Full Name', 'Age', 'DOB', 'Marital Status:', 'Occupation:', 'Language:',
  'Blood Pressure', 'Heart Rate', 'Blood Glucose', 'Oxygen (SpO2)',
  'Phone Number', 'Email Address', 'Residential Address', 'Emergency Contact',
  'Contact Name', 'Relation', 'Medical Conditions & Diagnoses',
  'Active Prescribed Medications', 'Medication', 'Dosage', 'Frequency', 'Timing',
  'Action', 'Delete', 'Add New Medication', 'Add Medication', 'Add Allergy',
  'Recent Checkup Logs', 'Critical Clinical Alerts', 'Doctor Quick Actions',
  'Generate Rx / Order Meds', 'Request Lab Investigation', 'Schedule Follow-up Visit',
  'Doctor Note', 'Clinical Directory (NAMASTE / ICD-11)', 'Patient Record #',
  // consent tab
  'Consents', 'Manage patient data access permissions, consent requests, and authorization records.',
  'Active:', 'Consent Status', 'Accepted', 'Rejected', 'Pending', 'All Records',
  'ABDM Consent Architecture', 'Consent Records', 'Showing:', 'Requested by:',
  'Requested:', 'Expiry:', 'Scope:', 'Details', 'Accept', 'Reject', 'Revoke Access',
  'No Consent Records Found', 'View All Consents', 'Requester / Organization',
  'Detailed Purpose', 'Granted Date', 'Expiration Date', 'Grant Consent',
  'Reject Consent', 'Revoke Consent', 'Close',
  // ABHA tab
  'Ayushman Bharat Health Account (ABHA)', 'National Health Authority',
  'Govt. of India', 'Scan QR Code', 'ABHA Health Number', 'PHR / ABHA Address',
  'ABDM Compliant Card', 'Pending Consents', 'Action Needed',
  'Download Official ABHA Card (PDF)', 'Male', 'Female', 'Family Member', 'Blood Group:',
  // upload docs tab
  'Sort By:', 'NEWEST 1ST', 'OLDEST 1ST', 'Disease', 'Prescription', 'Discharge Summary',
  'Upload Medical Document', 'browse files', 'Supported formats', 'Max file size',
  'Remove',   'Document Title', 'Category', 'Categories', 'e.g. Lab Report Sep 2026',
  'Disease / Scan Report', 'Confirm Upload & Save Record', 'Patient Medical Records',
  'Filter:', 'Sort:', 'Uploaded on:', 'View Document', 'Delete Record',
  'No Documents Found', 'Clear Filters', 'Download Document',
  // directory tabs
  'Clinical Directory', 'Dashboard', 'Directory', 'CDSS & Terminology Service',
  'WHO ICD-11 Code Search', 'NAMASTE Code Search', 'Search', 'Samples',
  'entries found', 'entities found', 'Loading', 'Enriched', 'Copy Code', 'Copy',
  'Code', 'Copy NAMASTE code to clipboard', 'Print this clinical record', 'Copied',
  'ICD-11 Mapping Available', 'ICD-11 Mapping Pending', 'No ICD-11 Mapping Found',
  'ICD-11 Code:', 'WHO Entity:', 'View on WHO ICD-11 Browser', 'Triage:', 'Risk:',
  'Risk Level', 'Clinical Overview', 'Cardinal Symptoms', 'Symptom', 'English Meaning',
  'Biomedical Correlate', 'Biomedical Correlation', 'Pathomechanism (Samprapti)',
  'Pathomechanism', 'Dominant Dosha', 'Srotas Involved', 'Tridosha Assessment Required',
  'Samprapti & Clinical Phenotype', 'Treatment Framework (Chikitsa)',
  'Chikitsa Sutra (Guiding Principle)', 'Chikitsa Sutra (Classical Principle)',
  'Therapeutic Framework', 'Classical Formulations', "Pathya (Do's)",
  'Pathya (Beneficial)', 'Apathya (Avoid)', 'Lab Correlations', 'Suggested Tests',
  'Targets', 'WHO ICD-11 Global Record', 'Official WHO Portal',
  'Related Codes (Siblings)', 'Source:', 'Catalog:', 'Version:', 'Last Updated:',
  'Select a Medical Code', 'Select a NAMASTE Code', 'Select an ICD-11 Code',
  'Prognosis', 'Red Flags', 'All', 'Ayurveda', 'Yoga', 'Unani', 'Siddha',
  'Homeopathy', 'Definition', 'TM2 Code', 'WHO ICD-11 Metadata',
  // socrates tab
  'New Assessment', 'Assessment', 'Assessment History', 'SOCRATES Clinical Intake Form',
  'SOCRATES Symptom Engine', 'Site', 'Onset', 'Character', 'Radiation', 'Associations',
  'Time Course', 'Exacerbating & Relieving Factors', 'Factors', 'Severity',
  'Previous History', 'Prior History', 'Notes', 'Mild', 'Moderate', 'Severe', 'Unbearable',
  'Sudden (Instantaneous)', 'Gradual (Over hours/days)', 'Insidious (Over weeks/months)',
  'Intermittent (Occasional episodes)', 'Sharp / Stabbing', 'Dull / Aching', 'Burning',
  'Throbbing / Pulsating', 'Tightness / Pressure', 'Cramping / Spasmodic',
  'Numbness / Tingling', 'Nausea / Vomiting', 'Shortness of breath',
  'Sweating / Cold clammy skin', 'Dizziness / Lightheadedness', 'Fever / Chills',
  'Fatigue / Weakness', 'Loss of appetite', 'Heart palpitations',
  'Describe custom character...', 'Any other associated symptoms...',
  'Additional context or notes for the reviewing physician...',
  'Upload Supporting Documents to Cloudinary', 'Selected Files',
  'Submit SOCRATES Assessment', 'Uploading to Cloudinary...',
  'Past SOCRATES Submissions', 'Refresh', 'No SOCRATES assessments recorded yet.',
  'Fill New Assessment', 'Cloudinary Uploaded Documents',
  // profile tab
  'ABDM Verified Patient', 'View Official ABHA Card', 'Upload Medical Reports',
  'Manage Consent Requests', 'Demographic & Registration Details',
  'Verification Status:', 'Primary Email:', 'Mobile Number:', 'Primary Care Hospital:',
  'Attending Doctor:', 'Health Insurance:', 'Quick Shortcuts',
  // placeholders / inputs
  'Search records...', 'Search consent...', 'Search patient record...',
  'Add condition...', 'Add allergy...',
  // encyclopedia + audit-gap coverage (every page, every word)
  'Age / DOB:', 'Also known as', 'CLINICAL EVALUATION TOOLS', 'Clinical Impression:',
  'Clinical meaning', 'Could not load record', 'Download File', 'Download Official PDF Report',
  'Evaluation', 'Excludes', 'Includes', 'Inspect Full Lab Report',
  'Is it continuous, constant, or coming in waves? How long does each episode last?',
  'Key Result Highlights:', 'Mapping:',
  'Mention previous episodes, diagnosed conditions, or relevant family history.',
  'Menu', 'NEWEST FIRST', 'OLDEST FIRST', 'Observed Result', 'Ordering Physician:',
  'Parameter', 'Parent:', 'Pathologist:', 'Please fill in the following required fields:',
  'Previous Records', 'Ref ID:', 'Reference Range', 'Report Date:', 'SOCRATES Intake',
  'Sample Ref ID:', 'Sanskrit term',
  'Select all descriptor terms that match what you are feeling.',
  'Select an entity from the left to view the full WHO ICD-11 clinical record.',
  'Specify the exact body location where you feel the discomfort (e.g. Center of chest, Upper right abdomen, Left forehead).',
  'Stored', 'Updated:', 'Verify on WHO', 'View ICD record', 'WHO ICD-11 (Global)', 'WHO browser',
  'e.g., Worsened by deep inspiration or bending over; Relieved by antacids or lying flat.',
  'Disease encyclopedia', 'Encyclopedia definition', 'Symptoms encyclopedia',
  'Classification code', 'Ayurvedic term', 'Equivalence', 'System',
  'Classification hierarchy', 'Investigations', 'Samprapti (pathomechanism)', 'Chikitsa (treatment)',
  'Verify on official WHO ICD-11 browser', 'NAMASTE (Ayurveda)', 'Search WHO browser', 'Open',
  'This ICD-11 entity corresponds to:', 'Same ICD shared by (reverse peers)',
  'Click to select lab reports, prescriptions, or images (PDF, JPG, PNG up to 10MB each)',
  'You can upload a maximum of 5 documents.',
  'Please select or specify at least one Character description.', 'Please select a file first!',
  'Health Portal & AI Assistant', 'NAMASTE (Ayurveda)',
  'Type a term or code above to search through the standardized medical library.',
  'Loading encyclopedia entry', 'Resolving clean definitions, symptoms and WHO links.',
  'Search the AYUSH NAMASTE clinical terms catalog',
  'Search across the WHO ICD-11 international disease classifications.',
  'Search across 4,500+ official AYUSH NAMASTE clinical terms and live WHO ICD-11 international disease classifications.',
  // doctor activity bell (yellow): access logs + consent requests
  'Doctor activity', 'Doctor activity notifications', 'Consent requests', 'Consent request',
  'Tap to review', 'Doctor access logs', 'No new notifications',
  'viewed your profile', 'viewed your records', 'viewed your form',
  'View all in Consent page',
];

// Brand acronyms stay English by design.
const keepEnglish = new Set(['MedVault', 'ABHA', 'SOCRATES']);

// 2. Every tab string must render in all 4 languages (or be intentionally English).
let uncovered = [];
for (const s of tabStrings) {
  if (keepEnglish.has(s)) continue;
  for (const lang of ['Hindi', 'Bengali', 'Tamil']) {
    const out = translatedFromEnglish(s, lang);
    if (out === s) uncovered.push(`${lang}: ${s}`);
  }
}
check('coverage: all tab strings in HI/BN/TA', uncovered.length === 0,
  uncovered.length ? `\n  MISSING:\n  - ${uncovered.join('\n  - ')}` : '');

// 3. Round-trip: EN -> XX -> EN must recover the source (no stuck/mixed language).
// rtAllow: known stable near-equivalents (placeholder case variant restores to
// the canonical button-case key, which re-translates identically — stable).
const rtAllow = { 'Add allergy...': 'Add Allergy...' };
let rtFail = [];
for (const s of tabStrings) {
  if (keepEnglish.has(s)) continue;
  for (const lang of ['Hindi', 'Bengali', 'Tamil']) {
    const fwd = translatedFromEnglish(s, lang);
    const back = recoverEnglishSource(fwd);
    const want = rtAllow[s] || s;
    // compare affix-insensitively: trailing ':' etc. is re-attached, allow exact
    if (back !== want) rtFail.push(`${lang}: ${s} -> ${fwd} -> ${back}`);
  }
}
check('round-trip EN->XX->EN', rtFail.length === 0,
  rtFail.length ? `\n  BROKEN:\n  - ${rtFail.slice(0, 20).join('\n  - ')}` : '');

// 4. Direct language switching HI -> TA must not leak Hindi (mixed-language bug).
let switchFail = [];
for (const s of ['Patient Profile', 'Save Changes', 'Welcome back,', 'Clinical Overview']) {
  const hi = translatedFromEnglish(s, 'Hindi');
  const ta = translated(hi, 'Tamil'); // simulates DOM holding Hindi when Tamil clicked
  const expected = translatedFromEnglish(s, 'Tamil');
  if (ta !== expected) switchFail.push(`${s}: got ${ta}, want ${expected}`);
}
check('switch HI->TA shows only Tamil', switchFail.length === 0, switchFail.join('; '));

// 5. Small blocks with emoji/symbol affixes.
const affixCases = [
  ['📅 NEWEST 1ST', 'Hindi'], ['+ Add Medication', 'Bengali'],
  ['Hiee 👋', 'Tamil'], ['View All Consents →', 'Hindi'],
  ['• Last synced 3 min ago', 'Bengali'], ['✏️ Edit Profile', 'Tamil'],
  ['🌿 NAMASTE (Ayurveda)', 'Hindi'],
];
for (const [s, lang] of affixCases) {
  const out = translated(s, lang);
  check(`affix "${s}" -> ${lang}`, out !== s, `got "${out}"`);
}

// 6. Dynamic sentence keeps user data untranslated, translates the label part.
const dyn = translated('Welcome back, Ayush 👋', 'Hindi');
check('dynamic keeps name', dyn.includes('Ayush') && dyn.includes('वापस स्वागत है'),
  `got "${dyn}"`);

// 7. Word-boundary safety: substrings must not corrupt larger words.
for (const [s, lang] of [['Stage 2', 'Hindi'], ['Message', 'Bengali']]) {
  const out = translatedFromEnglish(s, lang);
  check(`boundary "${s}" untouched`, out === s, `got "${out}"`);
}
// Partial translation is correct when only part of a phrase is in the dictionary.
check('partial "Address Book" -> TA',
  translatedFromEnglish('Address Book', 'Tamil') === 'முகவரி Book',
  `got "${translatedFromEnglish('Address Book', 'Tamil')}"`);
{
  const out = translatedFromEnglish('Manage Consent Requests', 'Hindi');
  check('boundary Manage (no Age-split)', out === 'सहमति अनुरोध प्रबंधित करें', `got "${out}"`);
}

// 8. English restore works.
for (const s of ['रोगी प्रोफ़ाइल', 'সব সম্মতি দেখুন', 'அனைத்து ஒப்புதல்களையும் பார்க்கவும்']) {
  const back = translated(s, 'English');
  check(`restore "${s}"`, ['Patient Profile', 'View All Consents', 'View All Consents'].includes(back), `got "${back}"`);
}

// 8. English restore works.
for (const s of ['रोगी प्रोफ़ाइल', 'সব সম্মতি দেখুন', 'அனைத்து ஒப்புதல்களையும் பார்க்கவும்']) {
  const back = translated(s, 'English');
  check(`restore "${s}"`, ['Patient Profile', 'View All Consents', 'View All Consents'].includes(back), `got "${back}"`);
}

// 9. DOCTOR pages: every tab/button in all 4 languages (no English leftovers,
//    no random mixing). Grouped per component for actionable failures.
const doctorPages = {
  'DoctorDashboard': ['View Mode:', 'Complete Overview', 'Patient Data View', 'SOCRATES Forms', 'Consultation Results', 'Patient Directory', 'Search for a Patient', "Enter a patient's ABHA ID in the search bar above to view their profile and SOCRATES assessments.", 'Loading health records...', 'Loading SOCRATES forms...', 'Search failed — please retry'],
  'DoctorHeader': ['DOCTOR PORTAL', 'AESIX Patient Health Records', 'Go to Home Dashboard', 'Home'],
  'DoctorSidebar': ['Profile', 'Senior Consultant', 'Online', 'Search Area', 'Dashboard Overview', 'Active Patient', 'yrs'],
  'PatientSearchBar': ['Search patient by ABHA ID, name, or mobile...', 'patient found', 'patients found', 'Searching…', 'Blood:', 'No patients found for'],
  'PatientProfileCard': ['basic details of the patient/user', 'photo', 'ID:', 'Full Name:', 'Age / DOB:', 'Gender / Blood Group:', 'Phone Number:', 'Email Address:', 'Address:', 'Emergency Contact:', 'Active Conditions:', 'Known Allergies', 'Current Medications:', 'Detail'],
  'PatientDirectoryView': ['Patient Records Directory', 'Comprehensive list of registered clinic patients & ABHA health records', 'Registered Patients', 'Last Visit:', 'Recent', 'View Patient Data', 'View Consultations', 'Active Care', 'Follow-up Due', 'Critical Alert', 'Routine Review', 'Low', 'High Risk', 'Low Risk', 'Contact:'],
  'SocratesFormsList': ['No SOCRATES Forms Found', 'This patient has not submitted any SOCRATES symptom assessments yet.', 'SOCRATES Symptom Assessments', 'form', 'forms', 'Site:', 'Character:', 'Onset:', 'Time:', 'Documents:', 'Request Access', 'Pending Approval', 'View Form', 'Re-request Access', 'Processing...', 'Access Granted', 'Waiting for patient', 'Request Rejected', 'Could not load form data. Access may have been revoked.', 'Access request sent for', 'Failed:'],
  'SocratesFormDetail': ['SOCRATES Assessment', 'Pain Assessment', 'Patient:', 'Close modal', 'Pain Severity Level', 'High / Severe', 'Moderate', 'Mild / Low', 'Site (Location)', 'Onset (Start & Mode)', 'Character (Type of Pain)', 'Radiation (Spread)', 'Associated Symptoms', 'Time Course (Pattern)', 'Exacerbating / Relieving Factors', 'Prior Clinical History', 'Additional Patient Notes', 'Attached Clinical Reports & Files', 'Medical Record', 'Attachment', 'View File', 'Close Assessment', 'Not specified', 'None reported'],
  'ConsultationResults': ['Consultation Results', 'Visits', 'No consultation records available for this user.', 'Chief Complaint:', 'Diagnosis:', 'BP:', 'Pulse:', 'Temp:', 'Prescribed Medications:', 'GenAI Triage Note:', 'Doctor Notes:'],
  'AlertsSection': ['Alerts', 'Active', 'No critical alerts or warnings logged for this patient.', 'Logged on:'],
};
const doctorKeepEnglish = new Set(['N/A', '/10']);
for (const [page, strings] of Object.entries(doctorPages)) {
  const missing = [];
  const mixed = [];
  for (const s of strings) {
    if (doctorKeepEnglish.has(s)) continue;
    for (const lang of ['Hindi', 'Bengali', 'Tamil']) {
      const out = translatedFromEnglish(s, lang);
      if (out === s) { missing.push(`${lang}: ${s}`); continue; }
      if (s.length > 60) {
        // Long sentences can't round-trip exactly (grammar words have no
        // mapping). The true invariant is idempotency: re-translating the
        // output must not drift into a third/mixed language.
        const again = translated(out, lang);
        if (again !== out) mixed.push(`${lang}: UNSTABLE ${s} -> ${out} -> ${again}`);
        continue;
      }
      const back = recoverEnglishSource(out);
      const norm = (x) => x.replace(/[^\p{L}\p{N}&/'’().,—-]+/gu, ' ').trim().toLowerCase();
      if (norm(back) !== norm(s) && back !== s) mixed.push(`${lang}: ${s} -> ${out} -> ${back}`);
    }
  }
  check(`doctor ${page}: full coverage`, missing.length === 0,
    missing.length ? `\n  MISSING:\n  - ${missing.join('\n  - ')}` : '');
  check(`doctor ${page}: no mixed-language round-trip`, mixed.length === 0,
    mixed.length ? `\n  MIXED:\n  - ${mixed.join('\n  - ')}` : '');
}

// 10. GENAI chatbot UI labels in all 4 languages.
const genAiStrings = ['Medical AI Chatbot', 'Powered by Groq', 'Daily Med Talk', 'Convo:', 'Voice to Voice Convo', 'Groq Active', 'Type your medical query or start voice conversation...', 'Voice Convo', 'Mic ON', 'Mic OFF', 'Send', 'Launch Voice to Voice Conversation Mode', 'Mute Mic', 'Unmute Mic', 'Send Message', 'You', 'Medical AI', 'Analyzing query with Groq...', 'Medical Emergency', 'Symptom Consultation', 'Voice-to-Voice Mode • Soothing Assessment', 'Exit Voice Mode', 'Exit Voice Chat', 'Listening... Speak naturally', 'Thinking & Analyzing with AI...', 'Medical AI Speaking...', 'Ready for Voice Conversation. Tap mic below or start speaking.', 'Say your symptoms, medical query, or question...', 'Mic Off', 'Mic Active', 'End Convo', 'Unmute Microphone', 'Mute Microphone', 'You:', 'Medical AI:'];
{
  const missing = [];
  for (const s of genAiStrings) {
    for (const lang of ['Hindi', 'Bengali', 'Tamil']) {
      if (translatedFromEnglish(s, lang) === s) missing.push(`${lang}: ${s}`);
    }
  }
  check('genAi: full coverage HI/BN/TA', missing.length === 0,
    missing.length ? `\n  MISSING:\n  - ${missing.join('\n  - ')}` : '');
}

// 11. AUTH pages in all 4 languages.
const authStrings = ['Your Health,', 'All In One Place', 'Access your complete medical journey securely with verified digital records, ABHA sync, and consent-driven privacy.', 'Secure, Encrypted Access', 'Lifetime ABDM Health Records', 'Direct Connect with Verified Doctors', 'Better Care Starts with You', 'New to MedVault?', 'Create Account', 'Welcome Back!', 'Sign in using your verified health identification', 'Select your ABHA Account', 'Account', 'Aadhaar', 'Mobile', 'Aadhaar Number', 'Mobile Number', 'ABHA Number', 'Enter 10-digit mobile number', '14-digit ABHA Number (XX-XXXX-XXXX-XXXX)', 'Enter 6-Digit OTP', 'Send OTP', 'Sending OTP…', 'Verify OTP', 'Verifying…', 'Resend OTP', "Didn't receive OTP?", 'Back to Home', 'Data protected & ABDM compliant', 'Create Your', 'Health Profile', 'Link your Aadhaar & ABHA to access a unified digital health ecosystem with secure consent access.', 'Secure Government ABDM Gateway', 'All Records In One Place', 'AI Health Assistant & Insights', 'Already have an account?', 'Login', 'Register with MedVault', 'Create your verified ABDM digital health account', 'Aadhaar & OTP', 'Personal', 'Contact', 'Complete', 'Account Created Successfully!', 'Redirecting you to your health dashboard...', 'Verified', 'Verify OTP & Continue', 'Personal Information', 'First Name', 'Last Name', '10-digit Mobile', 'City / Pincode', 'Male', 'Female', 'Other', 'Next: Contact Details', 'Emergency Contact (Optional)', 'Contact Name', 'Contact Phone', 'Creating Profile…', 'Back to Login', 'Protected by ABDM Guidelines', 'Aadhaar must be exactly 12 digits', 'Failed to send registration OTP', 'Registration failed. Please try again.', 'Mobile number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'];
{
  const missing = [];
  for (const s of authStrings) {
    for (const lang of ['Hindi', 'Bengali', 'Tamil']) {
      if (translatedFromEnglish(s, lang) === s) missing.push(`${lang}: ${s}`);
    }
  }
  check('auth: full coverage HI/BN/TA', missing.length === 0,
    missing.length ? `\n  MISSING:\n  - ${missing.join('\n  - ')}` : '');
}

// 12. Stale-cache fix: React re-rendering a node with FRESH content must win
//     over the cached translation source (kills stale/wrong-language buttons).
check('stale badge count adopts fresh value',
  resolveNodeSource('4', '3') === '4', `got "${resolveNodeSource('4', '3')}"`);
check('stale name adopts fresh value',
  resolveNodeSource('Anita Sharma', 'Patient') === 'Anita Sharma');
check('translation of cached source keeps cache',
  resolveNodeSource('रोगी प्रोफ़ाइल', 'Patient Profile') === 'Patient Profile',
  `got "${resolveNodeSource('रोगी प्रोफ़ाइल', 'Patient Profile')}"`);
check('tamil of cached source keeps cache',
  resolveNodeSource('நோயாளி சுயவிவரம்', 'Patient Profile') === 'Patient Profile');
check('placeholder re-render adopts fresh English',
  resolveNodeSource('Search records...', 'Search consent...') === 'Search records...',
  `got "${resolveNodeSource('Search records...', 'Search consent...')}"`);

// 13. Universal sync: global <-> chatbot conversation language mapping.
check('map Hindi->hi', convoCodeForGlobal('Hindi') === 'hi');
check('map English->en', convoCodeForGlobal('English') === 'en');
check('map Bengali->en (AI answers EN)', convoCodeForGlobal('Bengali') === 'en');
check('map Tamil->en (AI answers EN)', convoCodeForGlobal('Tamil') === 'en');
check('map hi->Hindi', globalForConvoCode('hi') === 'Hindi');
check('map en->English', globalForConvoCode('en') === 'English');

// 14. Duplicate target strings are only allowed when STABLE: every English key
//     sharing a translation must forward-translate back to that same string,
//     so no switching path can drift or mix languages. Guards future edits.
{
  const byValue = new Map();
  for (const [en, vals] of Object.entries(words)) {
    vals.forEach((v, i) => {
      const k = `${LANG_ORDER[i]}:${String(v).toLowerCase()}`;
      if (!byValue.has(k)) byValue.set(k, []);
      byValue.get(k).push(en);
    });
  }
  const unstable = [];
  for (const [k, keys] of byValue) {
    if (keys.length < 2) continue;
    const [lang, val] = [k.split(':')[0], k.slice(k.indexOf(':') + 1)];
    for (const en of keys) {
      const idx = LANG_ORDER.indexOf(lang);
      const fwd = translatedFromEnglish(en, lang);
      if (fwd.toLowerCase() !== val) unstable.push(`${lang}: ${en} -> ${fwd} (shared value: ${val})`);
    }
  }
  check('shared translations are drift-stable', unstable.length === 0,
    unstable.length ? `\n  UNSTABLE:\n  - ${unstable.join('\n  - ')}` : '');
}

console.log(`\nlang-test: ${pass} passed, ${fail} failed, ${Object.keys(words).length} keys`);
if (failures.length) {
  console.log('FAILURES:');
  failures.forEach((f) => console.log(` - ${f}`));
  process.exit(1);
} else {
  console.log('ALL LANGUAGE CHECKS PASSED (English, Hindi, Bengali, Tamil)');
}
