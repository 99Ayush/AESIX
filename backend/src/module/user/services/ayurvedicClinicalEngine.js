// --- Ayurvedic Clinical Knowledge Base & Deduction Engine ---
// Provides authentic classical Pathomechanism (Samprapti) and Treatment Framework (Chikitsa)
// for medical students, clinicians, and researchers using the MedVault/Kindle CDSS.

export const CLINICAL_KNOWLEDGE_BASE = {
  // ── 1. Jvara (EC-3, Fever / Pyrexia) ──
  jvara: {
    matchPatterns: [/^EC-3(\.|$)/i, /\bjvara\b/i, /\bjwara\b/i, /\bfever\b/i, /\bpyrexia\b/i],
    dominantDosha: ["Pitta", "Vata", "Kapha"],
    srotasInvolved: ["Rasavaha", "Svedavaha"],
    phenotypeCheck: "Agnimandya causes Ama accumulation in Amashaya, occluding Rasavaha and Svedavaha srotas. Displaced Pachakagni radiates into Shakha, causing core hyperthermia, anhidrosis, and generalized body stiffness.",
    chikitsaSutra: "ज्वरादौ लङ्घनं प्रोक्तं ज्वरमध्ये तु पाचनम्। ज्वरान्ते भेषजं दद्यात् ज्वरमुक्ते विरेचनम्॥ (In early Jvara, adopt Langhana (light diet/fasting) and Deepana-Pachana herbs. Administer restorative antipyretic formulations as acute ama clears; mild Virechana for complete convalescence.)",
    classicalFormulations: [
      "Maha Sudarshana Vati",
      "Tribhuvana Kirti Rasa",
      "Amritarishta",
      "Shadanga Paniya",
      "Sanjivani Vati",
      "Godanti Bhasma"
    ],
    pathya: [
      "Warm boiled Shadanga Paniya (herbal water)",
      "Light roasted green gram soup (Mudga Yusha)",
      "Parched rice water (Laja Manda / Peya)",
      "Adequate physical rest in a warm, draft-free room",
      "Lukewarm water sponging if hyperpyrexia develops"
    ],
    apathya: [
      "Heavy, unctuous, and deep-fried foods (Guru Ahara)",
      "Cold showers and exposure to cold wind drafts",
      "Daytime sleeping (Diva Svapna)",
      "Curd, cheese, and heavy dairy products",
      "Strenuous physical exercise and direct sun exposure"
    ],
    suggestedTests: [
      "Complete Blood Count (CBC with differential)",
      "Malarial Antigen / Peripheral Smear for MP",
      "Dengue NS1 Antigen & IgM/IgG Serology",
      "Widal Test / Typhidot",
      "Erythrocyte Sedimentation Rate (ESR) & CRP",
      "Routine & Microscopic Urinalysis"
    ]
  },

  // ── 2. Prameha & Madhumeha (EF-2, Diabetes Mellitus) ──
  prameha: {
    matchPatterns: [/^EF-2(\.|$)/i, /\bprameha\b/i, /\bmadhumeha\b/i, /\bdiabetes\b/i, /\bglycosuria\b/i],
    dominantDosha: ["Kapha", "Vata"],
    srotasInvolved: ["Medovaha", "Mutravaha", "Kledavaha"],
    phenotypeCheck: "Vitiated Kapha and Medas alter liquidity of bodily tissues, causing excessive fluid flow (Kleda) to urinary channels. In chronic progression (Madhumeha), Vata carries Ojas to Mutravaha srotas, producing sweet urine and progressive tissue wasting.",
    chikitsaSutra: "स्थूलः प्रमेही बलवानिहैको कृशस्तथैकः परिदुर्बलश्च। संशोध्यतेऽसावपकृष्टदोषः संशम्यते दुर्बलदेहधातुः॥ (For obese individuals: Shodhana (cleansing), Lekhana (scraping), and active physical exercise. For asthenic/emaciated individuals: gentle Brimhana (nourishing), Rasayana, and supportive Shamana herbs.)",
    classicalFormulations: [
      "Nisha Amalaki Churna",
      "Chandraprabha Vati",
      "Vasant Kusumakar Rasa",
      "Asanadi Kashayam",
      "Shilajit Vati",
      "Triphala Churna"
    ],
    pathya: [
      "Barley (Yava), old shali rice, and roasted whole grains",
      "Bitter vegetables (Karavellaka, Methi, Patola)",
      "Amla and Jamun seed powder",
      "Daily brisk walking and aerobic physical activity",
      "Green gram (Mudga) and horse gram (Kulatta)"
    ],
    apathya: [
      "Refined sugars, jaggery, and confectioneries",
      "Curd and fresh harvest grains",
      "Sedentary lifestyle (Asyasukha)",
      "Daytime sleeping (Diva Svapna)",
      "Alcohol and high-glycemic tubers"
    ],
    suggestedTests: [
      "Fasting & Postprandial Blood Sugar (FBS/PPBS)",
      "Glycated Hemoglobin (HbA1c)",
      "Urine Microalbumin",
      "Lipid Profile",
      "Serum Creatinine & eGFR"
    ]
  },

  // ── 3. Basti Vyapad / Procedural Complications (SI, SI-2.3.14) ──
  basti_vyapad: {
    matchPatterns: [/^SI(\.|$)/i, /^S[A-Z](\.|$)/i, /\bvy[aā]pad\b/i, /\b[aā]sth[aā]pana\b/i, /\bnir[uū]ha\b/i, /\bcomplication\b/i],
    dominantDosha: ["Kapha", "Vata", "Pitta"],
    srotasInvolved: ["Pakvashaya", "Purishavaha", "Medovaha", "Mutravaha"],
    phenotypeCheck: "Altered tissue resistance and Apana Vayu irregularity during enema procedures (Asthapana Basti) can cause delayed retention or mucosal irritation, aggravating underlying chronic metabolic and skin disorders.",
    chikitsaSutra: "व्यापद-प्रशमनं यथादोषं संशोधनं संशमनं च। बस्तिव्यापदि वातशामकैरनुलोमनैश्च चिकित्सा विधेया॥ (Manage procedure complications according to provoked doshas. Use mild Vatanulomana, abdominal fomentation, and restorative formulations while monitoring glycaemia and skin integrity.)",
    classicalFormulations: [
      "Dashamula Kwatha",
      "Hingvashtak Churna",
      "Chandraprabha Vati",
      "Bilwadi Vati",
      "Avipattikar Churna",
      "Phalatrikadi Kashayam"
    ],
    pathya: [
      "Warm boiled water (Ushnodaka) in frequent small sips",
      "Diluted roasted green gram soup seasoned with cumin",
      "Gentle abdominal fomentation (Ushna / Nadi Sveda)",
      "Quiet bed rest in a warm, comfortable room"
    ],
    apathya: [
      "Cold water, iced beverages, and refrigerated food",
      "Forceful straining to expel enema fluid or flatus",
      "Heavy oily or high-sugar meals",
      "Suppression of natural bodily urges (Vega Dharana)"
    ],
    suggestedTests: [
      "Fasting & Postprandial Blood Glucose",
      "Serum Electrolytes (Na+, K+, Cl-)",
      "Routine & Microscopic Urinalysis (Ketones/Glucose)",
      "Serum Creatinine & Blood Urea Nitrogen",
      "Clinical Abdominal Examination"
    ]
  },

  // ── 4. Amlapitta (EB-4, Hyperacidity / GERD / Dyspepsia) ──
  amlapitta: {
    matchPatterns: [/^EB-4(\.|$)/i, /\bamlapitta\b/i, /\bhyperacidity\b/i, /\bacid\b/i, /\bgastrit\b/i, /\bgerd\b/i, /\bdyspepsia\b/i],
    dominantDosha: ["Pitta", "Vata"],
    srotasInvolved: ["Annavaha", "Rasavaha"],
    phenotypeCheck: "Vitiated Pachaka Pitta gains excessive sourness (Amla) and liquidity (Dravata) in Amashaya, irritating the gastric mucosa and causing retrosternal burning, acid regurgitation, and impaired digestion.",
    chikitsaSutra: "वमनं विरेचनं चैव लङ्घनं च प्रशस्यते। तिक्तशीतैः कषायैश्च पित्तघ्नैश्च शमं नयेत्॥ (Employ therapeutic emesis or purgation depending on upward or downward presentation, followed by bitter-cooling Pitta-pacifying and mucosal healing herbs.)",
    classicalFormulations: [
      "Avipattikar Churna",
      "Kamadudha Rasa",
      "Sutshekhar Rasa",
      "Shankha Bhasma",
      "Drakshadi Kashayam",
      "Praval Pishti"
    ],
    pathya: [
      "Tender coconut water and pomegranate",
      "Old shali rice and light Mudga soup",
      "Cooling milk with Shatavari",
      "Small, frequent, predictable meals"
    ],
    apathya: [
      "Excessive green chillies and sharp spices",
      "Deep-fried, stale, or fermented food",
      "Tea, coffee, and carbonated beverages",
      "Late night dinners and immediate reclining"
    ],
    suggestedTests: [
      "Upper GI Endoscopy if alarm features present",
      "H. pylori stool antigen / serology",
      "Complete Blood Count (rule out occult bleed)",
      "Serum Gastrin"
    ]
  },

  // ── 5. Kasa (EA-3, Cough / Bronchitis) ──
  kasa: {
    matchPatterns: [/^EA-3(\.|$)/i, /\bk[aā]sa\b/i, /\bcough\b/i, /\bbronchit\b/i],
    dominantDosha: ["Vata", "Kapha", "Pitta"],
    srotasInvolved: ["Pranavaha"],
    phenotypeCheck: "Obstruction of downward-moving Prana Vayu by Kapha or dryness leads to violent retrograde flow (Urdhwa Gati) in chest and throat, producing spasmodic sound and paroxysmal coughing.",
    chikitsaSutra: "वातघ्नं कफवातघ्नं पित्तघ्नं च यथाक्रमम्। कासे सर्पिर्मधुयुक्तं चूर्णमवलेहमेव वा योजयेत्॥ (Clear airway secretions using medicated lehyas, soothing herbal churnas with honey, and gentle warming demulcents according to dominant dosha.)",
    classicalFormulations: [
      "Sitopaladi Churna",
      "Talisadi Churna",
      "Kantakari Avaleha",
      "Vasa Avaleha",
      "Vyoshadi Vati",
      "Khadiradi Vati"
    ],
    pathya: [
      "Warm water and ginger-tulsi tea",
      "Lukewarm goat or cow milk with turmeric",
      "Honey with black pepper",
      "Steam inhalation with ajwain"
    ],
    apathya: [
      "Chilled drinks and ice cream",
      "Curd, banana, and citrus at night",
      "Exposure to smoke, dust, and cold wind",
      "Shouting or vocal straining"
    ],
    suggestedTests: [
      "Chest X-ray (PA view)",
      "Complete Blood Count with AEC",
      "Sputum examination for routine & AFB",
      "Peak Expiratory Flow Rate (PEFR)"
    ]
  },

  // ── 6. Shvasa (EA-4, Asthma / Dyspnea) ──
  shvasa: {
    matchPatterns: [/^EA-4(\.|$)/i, /\b[sś]v[aā]sa\b/i, /\basthma\b/i, /\bdyspn[oe]a\b/i, /\bwheez\b/i],
    dominantDosha: ["Vata", "Kapha"],
    srotasInvolved: ["Pranavaha", "Udakavaha"],
    phenotypeCheck: "Prana Vayu obstructed by sticky Kapha in bronchioles is deflected upward, producing labored breathing, audible wheezing (Ghurghuruka), and severe chest tightness relieved only upon mucus expectoration.",
    chikitsaSutra: "स्वेदनं वातकफहृत् श्वासहिध्मानिवारणम्। तैलैः लवणसंमिश्रैः उरो ग्रीवा विमर्दनम्॥ (Apply rock-salt-infused warm sesame oil on chest and back followed by gentle sudation to liquefy Kapha, coupled with bronchodilating Vatanulomana therapies.)",
    classicalFormulations: [
      "Shvasa Kuthar Rasa",
      "Kanakasava",
      "Bharangyadi Kashayam",
      "Somlata Churna",
      "Shringyadi Churna",
      "Dashamularishta"
    ],
    pathya: [
      "Warm water and garlic-infused milk",
      "Roasted barley and light warm gruels",
      "Mustard oil chest massage with rock salt",
      "Warm clothing protecting chest and throat"
    ],
    apathya: [
      "Refrigerated foods and cold dairy",
      "Exposure to cold drafts, humidity, and allergens",
      "Heavy oily dinners",
      "Vigorous physical exertion during flare-ups"
    ],
    suggestedTests: [
      "Pulmonary Function Test (Spirometry / FEV1)",
      "Chest Radiograph",
      "Serum Total IgE",
      "Pulse Oximetry (SpO2 monitoring)"
    ]
  },

  // ── 7. Atisara (EB-2, Diarrhea / Gastroenteritis) ──
  atisara: {
    matchPatterns: [/^EB-2(\.|$)/i, /\batis[aā]ra\b/i, /\bdiarrh[oe]a\b/i, /\bgastroenterit\b/i],
    dominantDosha: ["Vata", "Pitta", "Kapha"],
    srotasInvolved: ["Annavaha", "Purishavaha", "Udakavaha"],
    phenotypeCheck: "Extinguished digestive fire (Mandagni) causes undigested liquid chime to mix with feces, inundating Purishavaha srotas and provoking frequent liquid bowel evacuations.",
    chikitsaSutra: "दीपनं पाचनं चैव लङ्घनं चामसंयुते। पक्वे तु स्तम्भनं देयं ग्राहिभिः कषायैस्तथा॥ (In acute/Ama stage: Langhana, Deepana, Pachana to clear toxins. In Pakva/non-toxic stage: Grahi (absorbent) astringent formulations to solidify bowel motions.)",
    classicalFormulations: [
      "Kutajarishta",
      "Kutajghan Vati",
      "Bilwadi Churna",
      "Gangadhara Churna",
      "Dadimashtaka Churna",
      "Mustarishta"
    ],
    pathya: [
      "Fresh buttermilk with roasted cumin and ginger",
      "Pulp of semi-ripe Bilva fruit",
      "Boiled and cooled water with mint",
      "Thin roasted rice gruel (Peya / Manda)"
    ],
    apathya: [
      "Solid heavy meals and raw salads",
      "Whole milk and fatty foods",
      "Leafy green vegetables during acute phase",
      "Unhygienic street food and untreated water"
    ],
    suggestedTests: [
      "Stool Routine & Microscopic Examination",
      "Stool Culture & Sensitivity",
      "Serum Electrolytes (Na+, K+, Cl-)",
      "Complete Blood Count"
    ]
  },

  // ── 8. Amavata (EC-6, Rheumatoid Arthritis / Rheumatism) ──
  amavata: {
    matchPatterns: [/^EC-6(\.|$)/i, /\b[aā]mav[aā]ta\b/i, /\brheumat\b/i, /\barthritis\b/i],
    dominantDosha: ["Vata", "Kapha"],
    srotasInvolved: ["Rasavaha", "Asthivaha", "Sandhi"],
    phenotypeCheck: "Circulating Ama generated by Mandagni lodges in Kapha sthanas (synovial joints) under Vata's influence, creating severe symmetrical joint inflammation, morning stiffness (Stambha), and throbbing pain.",
    chikitsaSutra: "लङ्घनं स्वेदनं तिक्तं दीपनानि कटूनि च। विरेचनं स्नेहपानं बस्तयश्चाममारुते॥ (Langhana, dry sand fomentation (Valuka Sveda), bitter and pungent digestive stimulants, followed by Virechana and Kshara Basti.)",
    classicalFormulations: [
      "Simhanada Guggulu",
      "Yograj Guggulu",
      "Rasnadi Kashayam",
      "Panchakola Churna",
      "Maharasnadi Kwatha",
      "Erandapak"
    ],
    pathya: [
      "Dry ginger (Shunthi) boiled water",
      "Horse gram soup (Kulatta Yusha)",
      "Garlic (Lashuna) with meals",
      "Dry fomentation (Valuka Sveda)",
      "Castor oil with warm milk at night"
    ],
    apathya: [
      "Curd, fish, and black gram (Urad dal)",
      "Cold showers and wet damp weather exposure",
      "Daytime sleeping and lack of gentle movement",
      "Heavy, greasy, oily preparations"
    ],
    suggestedTests: [
      "Rheumatoid Factor (RF)",
      "Anti-Cyclic Citrullinated Peptide (Anti-CCP)",
      "Erythrocyte Sedimentation Rate (ESR)",
      "C-Reactive Protein (CRP)",
      "Serum Uric Acid"
    ]
  },

  // ── 9. Kushtha (ED-4, Dermatology / Skin Disorders) ──
  kushtha: {
    matchPatterns: [/^ED-4(\.|$)/i, /\bku[sṣ][tṭ]ha\b/i, /\bskin\b/i, /\bpsoriasis\b/i, /\beczema\b/i, /\bdermat\b/i],
    dominantDosha: ["Tridosha (Vata, Pitta, Kapha)"],
    srotasInvolved: ["Raktavaha", "Svedavaha", "Mamsavaha"],
    phenotypeCheck: "Mutual vitiation of the seven components (Sapta Ko dravya: 3 doshas + Twak, Rakta, Mamsa, Lasika) causes chronic inflammatory, scaling, and pruritic lesions across cutaneous tissue layers.",
    chikitsaSutra: "वातोत्तरेषु सर्पिष्पानं वमनं श्लेष्मोत्तरेषु च। पित्तोत्तरे विरेचनं रक्तावसेचनं च सर्वत्र॥ (Ghee preparations for Vata, Vamana for Kapha, Virechana for Pitta, repeated therapeutic bloodletting (Raktamokshana), and bitter blood purifiers.)",
    classicalFormulations: [
      "Khadirarishtha",
      "Maha Manjishtadi Kwatha",
      "Kaishore Guggulu",
      "Arogyavardhini Vati",
      "Gandhak Rasayana",
      "Nimbadi Churna"
    ],
    pathya: [
      "Water boiled with Khadira or Neem",
      "Old shali rice and green gram soup",
      "Bitter vegetables (Patola, Karavellaka)",
      "Wearing soft, breathable cotton clothing"
    ],
    apathya: [
      "Incompatible foods (Viruddhahara like fish with milk)",
      "Excessively sour, salty, and fermented foods",
      "Daytime sleep after meals",
      "Harsh synthetic soaps and hot water baths"
    ],
    suggestedTests: [
      "Skin Scraping for Fungal / KOH examination",
      "Skin Biopsy if diagnosis atypical",
      "Complete Blood Count",
      "Serum Total IgE",
      "Liver Function Tests"
    ]
  },

  // ── 10. Arsha (EE-3, Hemorrhoids / Piles) ──
  arsha: {
    matchPatterns: [/^EE-3(\.|$)/i, /\bar[sś]a\b/i, /\bhemorrhoid\b/i, /\bpile\b/i],
    dominantDosha: ["Vata", "Pitta", "Kapha"],
    srotasInvolved: ["Purishavaha", "Mamsavaha"],
    phenotypeCheck: "Chronic Agnimandya and constipation cause downward obstruction of Apana Vayu, producing vascular congestion and fleshy projections (Ankuras) in the three rectal rings (Guda Valis).",
    chikitsaSutra: "भेषजं क्षारः अग्निकर्म शस्त्रं चेति चतुर्विधा चिकित्सा। मन्दाग्निशमनं वातस्यानुलोमनम्॥ (Fourfold classical management: medical Shamana, Kshara Karma, Agni Karma, and Shastra Karma; prioritize Agni correction and Apana Vatanulomana.)",
    classicalFormulations: [
      "Abhayarishta",
      "Arshoghni Vati",
      "Triphala Guggulu",
      "Kankayan Vati",
      "Chirabilvadi Kashayam",
      "Kasisadi Taila"
    ],
    pathya: [
      "Surana (elephant foot yam) preparations",
      "Fresh buttermilk seasoned with caraway and rock salt",
      "High-fiber green vegetables and soaked figs",
      "Warm water sitz baths (Avagaha Sveda)"
    ],
    apathya: [
      "Hard constipating dry foods (Vishtambhi Ahara)",
      "Red meat, spicy chillies, and baked snacks",
      "Prolonged sitting on rigid surfaces",
      "Straining forcefully during defecation"
    ],
    suggestedTests: [
      "Proctoscopic / Anoscopic Examination",
      "Digital Rectal Examination (DRE)",
      "Complete Hemogram (screening for anemia)",
      "Stool Occult Blood Test"
    ]
  },

  // ── 11. Pandu (EC-5, Anemia) ──
  pandu: {
    matchPatterns: [/^EC-5(\.|$)/i, /\bp[aā][nṇ][dḍ]u\b/i, /\ban[ae]mia\b/i],
    dominantDosha: ["Pitta"],
    srotasInvolved: ["Raktavaha", "Rasavaha"],
    phenotypeCheck: "Aggravated Pitta invades Hridaya and Dhatus, causing qualitative depletion of Rakta (blood) and Ojas, producing tissue pallor (Panduta), fatigue, dizziness, and palpitations.",
    chikitsaSutra: "पाण्डुरोगे तु संशोधनमूर्ध्वं चानुलोमं च। लोहभस्मप्रयोगश्च घृतं तिक्तकमेव च॥ (Gentle cleansing with Tikta-Ghrita Virechana, followed by iron-potentiating mineral formulations (Lauha Rasayana) and nutrient-rich Dhatu building therapies.)",
    classicalFormulations: [
      "Punarnava Mandur",
      "Navayasa Lauha",
      "Lohasava",
      "Dhatri Lauha",
      "Arogyavardhini Vati",
      "Drakshavaleha"
    ],
    pathya: [
      "Pomegranates, raisins, and ripe dates",
      "Cow's ghee and nutrient-dense greens (Palak, Methi)",
      "Amla juice with jaggery",
      "Well-cooked beetroots and green gram"
    ],
    apathya: [
      "Consumption of chalk/clay (Mrid-bhakshana)",
      "Excessive salty, sour, and pungent foods",
      "Daytime sleeping and heavy strenuous labor",
      "Alcohol and tobacco"
    ],
    suggestedTests: [
      "Complete Blood Count (Hb, RBC indices, MCV, MCH)",
      "Peripheral Blood Smear Examination",
      "Serum Ferritin & Iron Studies",
      "Stool for Ova and Parasites"
    ]
  },

  // ── 12. Kamala (ED-3, Jaundice / Hepatitis / Liver Disease) ──
  kamala: {
    matchPatterns: [/^ED-3(\.|$)/i, /\bk[aā]mal[aā]\b/i, /\bjaundice\b/i, /\bhepatit\b/i, /\bliver\b/i, /\byakrit\b/i],
    dominantDosha: ["Pitta"],
    srotasInvolved: ["Raktavaha", "Yakrit", "Pliha"],
    phenotypeCheck: "Unchecked Pitta overflow in blood tissue saturates Twak, Netra, and Mutra with excess bilious pigment, causing profound yellowing, anorexia, bitter mouth taste, and liver sluggishness.",
    chikitsaSutra: "कामलिनं तु बहुपित्तं मृदुभिः तिक्तैश्च विरेचनैः संशोध्य। पित्तशामकैश्च यकृदुत्तेजकैश्च संशमयेत्॥ (Gentle purgation with mild bitter drugs to decompress the biliary tree, followed by hepatoprotective Tikta-Kashaya rejuvenators and cooling diet.)",
    classicalFormulations: [
      "Arogyavardhini Vati",
      "Punarnavadi Kashayam",
      "Bhumiamalaki Churna",
      "Phalatrikadi Kwatha",
      "Kumaryasava",
      "Liv-52"
    ],
    pathya: [
      "Fresh sugarcane juice and sweet grapes",
      "Buttermilk with roasted jeera",
      "Boiled seasonal bottle gourd and ridge gourd",
      "Radish with lemon juice and parched rice water"
    ],
    apathya: [
      "Cooking oils, ghee, and deep-fried savories",
      "Sour and fermented foods (pickles, vinegar)",
      "Alcohol and hepatotoxic substances",
      "Exposure to midday sun and hard manual exertion"
    ],
    suggestedTests: [
      "Liver Function Tests (Total/Direct Bilirubin, SGOT, SGPT, ALP)",
      "Viral Hepatitis Serological Markers (HBsAg, Anti-HCV, HAV IgM)",
      "Abdominal Ultrasonography (USG Hepatobiliary)",
      "Serum Albumin & INR"
    ]
  },

  // ── 13. Mutrakricchra (EJ-4, Dysuria / UTI) & Ashmari (EJ-2, Calculi) ──
  mutrakricchra: {
    matchPatterns: [/^EJ-4(\.|$)/i, /^EJ-2(\.|$)/i, /\bm[uū]trak[rṛ]cchra\b/i, /\b[aā][sś]mar[iī]\b/i, /\bdysuria\b/i, /\burinar\b/i, /\bcalcul\b/i, /\bstone\b/i],
    dominantDosha: ["Vata", "Pitta"],
    srotasInvolved: ["Mutravaha"],
    phenotypeCheck: "Inflammatory Pitta and obstructed Apana Vayu vitiate Basti and Mutramarga, causing painful, scalding, hesitant, and frequent urination with cloudy or crystalline urine.",
    chikitsaSutra: "शीतैर्द्रव्यैः कषायैश्च मूत्रलैः बस्तिशोधनैः। पेयैश्च तर्पणैश्चैव मूत्राघातं विनिर्जयेत्॥ (Employ cooling diuretics (Mutravirechaniya), soothing urinary channel cleansers, and alkalizing herbal decoctions to flush urinary pathways.)",
    classicalFormulations: [
      "Gokshuradi Guggulu",
      "Chandraprabha Vati",
      "Varunadi Kwatha",
      "Trinapanchamula Kashayam",
      "Chandanasava",
      "Shweta Parpati"
    ],
    pathya: [
      "Tender coconut water and barley water",
      "Cucumber, watermelon, and fresh sugarcane juice",
      "Coriander seed cold infusion (Dhanyaka Hima)",
      "Generous hydration (minimum 2.5-3 liters/day)"
    ],
    apathya: [
      "Pungent chillies, mustard, and vinegar",
      "Horse gram in excess and salty snacks",
      "Withholding the urge to urinate (Mutra Vegadharana)",
      "Excessive sun exposure and bike riding"
    ],
    suggestedTests: [
      "Urinalysis (Routine & Microscopic for pus cells, RBCs, nitrites)",
      "Urine Culture & Antimicrobial Sensitivity",
      "Ultrasound Kidney-Ureter-Bladder (KUB)",
      "Serum Creatinine & Blood Urea"
    ]
  },

  // ── 14. Vatarakta (ED-8, Gout / Hyperuricemia) ──
  vatarakta: {
    matchPatterns: [/^ED-8(\.|$)/i, /\bv[aā]tarakta\b/i, /\bgout\b/i, /\bhyperuric[ae]mia\b/i],
    dominantDosha: ["Vata", "Rakta", "Pitta"],
    srotasInvolved: ["Raktavaha", "Asthivaha", "Sandhi"],
    phenotypeCheck: "Vitiated Rakta dhatu obstructs the passage of Vata in peripheral small joints (especially great toe), producing agonizing nocturnal burning pain, erythema, and tophi formation.",
    chikitsaSutra: "रक्तावसेचनं कुर्यात् विरेको बस्तिरेव च। गुडूची क्षीरपानं च वातरक्ते प्रशस्यते॥ (Therapeutic bloodletting (Raktamokshana), gentle Virechana, Ksheera Basti, and Guduchi-dominated anti-inflammatory formulations.)",
    classicalFormulations: [
      "Kaishore Guggulu",
      "Amritadi Guggulu",
      "Kokilaksha Kashayam",
      "Pinda Taila (external application)",
      "Manjishtadi Kwatha"
    ],
    pathya: [
      "Abundant clean water intake",
      "Barley (Yava) and green gram soup",
      "Cow's milk boiled with Guduchi",
      "Sweet juicy seasonal fruits",
      "Wearing loose non-constricting footwear"
    ],
    apathya: [
      "High-purine meats, seafood, and organ meat",
      "Alcohol, beer, and high-fructose beverages",
      "Curd, tomato seeds, and fermented batters",
      "Tight rigid footwear and physical trauma to toes"
    ],
    suggestedTests: [
      "Serum Uric Acid Level",
      "Erythrocyte Sedimentation Rate (ESR)",
      "High-Sensitivity C-Reactive Protein (hs-CRP)",
      "Joint Fluid Microscopy (monosodium urate crystals)"
    ]
  },

  // ── 15. Unmada & Apasmara (EM-2, EM-3, Psychiatric & Seizure Disorders) ──
  unmada_apasmara: {
    matchPatterns: [/^EM-2(\.|$)/i, /^EM-3(\.|$)/i, /\bunm[aā]da\b/i, /\bapasm[aā]ra\b/i, /\bepilep\b/i, /\bpsych\b/i, /\banxiety\b/i],
    dominantDosha: ["Vata"],
    srotasInvolved: ["Manovaha", "Sanjnavaha"],
    phenotypeCheck: "Vata aggravated by emotional trauma, stress, or somatic toxin interacts with Raja and Tama, occluding Manovaha channels and perturbing Dhi (cognition), Dhriti (retention), and Smriti (memory).",
    chikitsaSutra: "धीधैर्यात्मादिविज्ञानं मनोदोषौषधं परम्। कल्याणकं घृतं ब्राह्मी नस्यं तैलनिषेवणम्॥ (Integrate Daivavyapashraya and Sattvavajaya (psychotherapy), Medhya Rasayana herbs, Kalyanaka Ghrita, Shirodhara, and therapeutic Nasya.)",
    classicalFormulations: [
      "Brahmi Vati",
      "Saraswatarishta",
      "Smritisagar Rasa",
      "Kalyanaka Ghrita",
      "Ashwagandha Churna",
      "Manasamitra Vataka"
    ],
    pathya: [
      "Warm cow's milk with ghee at bedtime",
      "Brahmi and Shankhapushpi herbal infusions",
      "Daily mindfulness meditation and Pranayama",
      "Consistent sleep-wake cycle in quiet environment"
    ],
    apathya: [
      "Alcohol, recreational drugs, and stimulants",
      "Sensory overstimulation and late night screens",
      "Prolonged fasting and irregular sleep",
      "Distressing emotional isolation"
    ],
    suggestedTests: [
      "Electroencephalogram (EEG) if seizures suspected",
      "Brain MRI (structural neuroimaging)",
      "Serum Electrolytes, Calcium, and Vitamin B12",
      "Thyroid Stimulating Hormone (TSH)"
    ]
  },

  // ── 16. Vatavyadhi (AA, AAB, Neurological & Musculoskeletal Disorders) ──
  vatavyadhi: {
    matchPatterns: [/^AA(\.|$|-)/i, /^AAB(\.|$|-)/i, /\bv[aā]tavy[aā]dhi\b/i, /\bneural\b/i, /\bparalys\b/i, /\bsciatica\b/i, /\bg[rṛ]dhras[iī]\b/i],
    dominantDosha: ["Vata"],
    srotasInvolved: ["Asthivaha", "Majjavaha", "Vatavaha"],
    phenotypeCheck: "Depletion of bodily tissues (Dhatu Kshaya) or obstruction of channels (Margavarodha) provokes severe Vata derangement, causing radicular pain, muscular atrophy, numbness, tremors, and loss of motor function.",
    chikitsaSutra: "स्नेहः स्वेदो बस्तिर्नस्यं मूर्ध्नितैलं तथाऽभ्यङ्गः। वातस्योपशमार्थाय सर्वदा संविधीयते॥ (Snehana (internal/external unction), Svedana (fomentation), Basti (medicated enema - supreme for Vata), Shirodhara, and therapeutic Abhyanga.)",
    classicalFormulations: [
      "Maha Yograj Guggulu",
      "Ekangaveera Rasa",
      "Balarishta",
      "Ashwagandharishta",
      "Mahanarayana Taila",
      "Ksheerabala 101"
    ],
    pathya: [
      "Fresh, warm, unctuous meals cooked with cow's ghee",
      "Garlic, sesame seeds, and warm almond milk",
      "Daily full-body Abhyanga with sesame oil",
      "Restful sleep and warm ambient temperatures"
    ],
    apathya: [
      "Fasting, dry snacks, and cold beverages",
      "Exposure to chill winds and cold air conditioners",
      "Excessive walking, jogging, and strenuous travel",
      "Suppression of natural bodily urges"
    ],
    suggestedTests: [
      "Spine / Brain MRI or CT Scan as clinically indicated",
      "Nerve Conduction Velocity (NCV) & Electromyography (EMG)",
      "Serum Vitamin B12 and Vitamin D3",
      "Serum Calcium and Alkaline Phosphatase"
    ]
  },

  // ── 17. Hridroga (EC-2, Cardiovascular Disorders / Heart Disease) ──
  hridroga: {
    matchPatterns: [/^EC-2(\.|$)/i, /\bh[rṛ]droga\b/i, /\bheart\b/i, /\bcardiac\b/i, /\bangina\b/i],
    dominantDosha: ["Vata", "Pitta"],
    srotasInvolved: ["Rasavaha", "Raktavaha", "Pranavaha"],
    phenotypeCheck: "Vitiated Vyana Vata and Avalambaka Kapha in Hridaya perturb cardiac rhythm, coronary perfusion, and arterial elasticity, manifesting as precordial oppression, dyspnea, and palpitation.",
    chikitsaSutra: "हृद्रोगे तु प्रशमनाः कषायाः सर्पिषस्तथा। अर्जुनक्षीरपाकेन हृदयं बलवत्तरम्॥ (Cardiotonic herbs with Arjuna Ksheerapaka, mild Vatanulomana, stress reduction, and avoiding unwholesome emotions.)",
    classicalFormulations: [
      "Arjuna Ksheerapaka",
      "Prabhakar Vati",
      "Hridyarnava Rasa",
      "Dashamula Kwatha",
      "Mukta Pishti",
      "Akik Pishti"
    ],
    pathya: [
      "Arjuna bark decoction in milk/water",
      "Garlic, pomegranate, and bitter gourd",
      "Light wholesome fiber-rich foods",
      "Moderate walking and gentle relaxation"
    ],
    apathya: [
      "Trans-fats, excess salt, and heavy animal fats",
      "Acute psychological grief, rage, and anxiety",
      "Cigarette smoking and tobacco use",
      "Heavy nocturnal overeating"
    ],
    suggestedTests: [
      "Standard 12-Lead Electrocardiogram (ECG)",
      "2D Echocardiography with Doppler",
      "Fasting Lipid Profile (Total, LDL, HDL, Triglycerides)",
      "Cardiac Biomarkers (Troponin / CK-MB) if acute"
    ]
  },

  // ── 18. Sthaulya & Medoroga (EF-3, Obesity / Metabolic Syndrome) ──
  sthaulya: {
    matchPatterns: [/^EF-3(\.|$)/i, /\bsthaulya\b/i, /\bmedoroga\b/i, /\bobes\b/i, /\bmetabolic syndrome\b/i],
    dominantDosha: ["Kapha"],
    srotasInvolved: ["Medovaha", "Rasavaha"],
    phenotypeCheck: "Medodhatvagni Mandya causes excessive accumulation of unrefined adipose tissue (Meda), which blocks nutrient channels to successive dhatus while stoking uncontrollable Jatharagni (Tikshnagni).",
    chikitsaSutra: "गुरु चातर्पणं चेष्टं स्थूलानां कर्शनं प्रति। लेखनं बस्तयश्चैव व्यायामो मेदसो हरः॥ (Guru-Apatarpana (high-bulk, low-calorie diet), scraping (Lekhana) herbs, Lekhana Basti, and sustained physical exercise.)",
    classicalFormulations: [
      "Medohar Guggulu",
      "Triphala Guggulu",
      "Varunadi Kashayam",
      "Navak Guggulu",
      "Lohasava",
      "Takra with Honey"
    ],
    pathya: [
      "Warm water with a spoonful of raw honey in morning",
      "Barley (Yava) and horse gram (Kulatta) soup",
      "Steamed vegetables and Triphala decoction",
      "Daily brisk aerobic exercise and active lifestyle"
    ],
    apathya: [
      "Sweets, refined carbs, and pastries",
      "Butter, cheese, and deep-fried savories",
      "Daytime sleeping (Diva Svapna)",
      "Sedentary habits and lack of physical exertion"
    ],
    suggestedTests: [
      "Fasting Lipid Profile",
      "Fasting Blood Glucose and HbA1c",
      "Thyroid Stimulating Hormone (TSH)",
      "Abdominal Ultrasonography (Screen for Fatty Liver)"
    ]
  }
};

// --- Chapter / Prefix Baseline Fallbacks ---
export const CHAPTER_FALLBACKS = {
  EA: {
    dominantDosha: ["Vata", "Kapha"],
    srotasInvolved: ["Pranavaha"],
    phenotypeCheck: "Pranavaha srotas derangement characterized by airway obstruction, altered respiration rate, and mucosal secretions.",
    chikitsaSutra: "प्राणवहस्रोतोविशोधनं वातकफशामकं च। सर्पिर्लेहचूर्णैर्यथादोषं योजयेत्॥ (Clear airway channels with Vata-Kapha pacifying medicated lehyas, warm ghritas, and soothing herbal powders.)",
    classicalFormulations: ["Sitopaladi Churna", "Talisadi Churna", "Vasa Avaleha", "Kanakasava"],
    pathya: ["Warm water", "Ginger-tulsi decoction", "Light steamed food", "Chest warmth"],
    apathya: ["Cold drinks", "Curd at night", "Exposure to dust and cold winds"]
  },
  EB: {
    dominantDosha: ["Pitta", "Vata"],
    srotasInvolved: ["Annavaha", "Purishavaha"],
    phenotypeCheck: "Annavaha and Purishavaha srotas impairment with impaired digestive fire (Agnimandya) and metabolic toxin accumulation.",
    chikitsaSutra: "दीपनं पाचनं चैव लङ्घनं चामशोधनम्। अग्निदीप्तौ शमं यान्ति विकाराः पाचनाश्रयाः॥ (Rekindle digestive fire (Deepana-Pachana), clear gastrointestinal toxins with Langhana, and restore normal gut peristalsis.)",
    classicalFormulations: ["Avipattikar Churna", "Hingvashtak Churna", "Kutajghan Vati", "Chitrakadi Vati"],
    pathya: ["Fresh buttermilk with roasted cumin", "Boiled warm water", "Mudga yusha", "Regular meal timings"],
    apathya: ["Stale leftovers", "Excessive chilies", "Heavy deep-fried foods", "Overeating"]
  },
  EC: {
    dominantDosha: ["Pitta", "Vata"],
    srotasInvolved: ["Rasavaha"],
    phenotypeCheck: "Rasavaha srotas dysfunction manifesting as impaired tissue nutrition, altered vascular tone, or systemic fever.",
    chikitsaSutra: "रसधातुप्रसादनं लङ्घनैः पाचनैस्तथा। तिक्तकषायमधुरैः स्रोतोविशोधनम्॥ (Clarify Rasa dhatu through light diet, digestive decoctions, and bitter-sweet channel cleansers.)",
    classicalFormulations: ["Maha Sudarshana Vati", "Amritarishta", "Shadanga Paniya", "Arjuna Kwatha"],
    pathya: ["Warm boiled water", "Pomegranate", "Green gram gruel", "Adequate rest"],
    apathya: ["Heavy fried foods", "Cold breeze", "Daytime sleep", "Violent exertion"]
  },
  ED: {
    dominantDosha: ["Pitta", "Rakta"],
    srotasInvolved: ["Raktavaha"],
    phenotypeCheck: "Raktavaha srotas derangement characterized by inflammatory tissue changes, discoloration, or altered hematopoiesis.",
    chikitsaSutra: "रक्तपित्तप्रशमनं विरेको रक्तमोक्षणम्। तिक्तकषायशीतैश्च धातुशुद्धिं समाचरेत्॥ (Pacify Pitta and Rakta with mild Virechana, therapeutic bloodletting when indicated, and bitter cooling alteratives.)",
    classicalFormulations: ["Maha Manjishtadi Kwatha", "Kaishore Guggulu", "Khadirarishta", "Arogyavardhini Vati"],
    pathya: ["Water boiled with Khadira", "Old rice", "Green gram", "Bitter gourd"],
    apathya: ["Incompatible food mixtures", "Fermented foods", "Excess salt and sour items"]
  },
  EE: {
    dominantDosha: ["Vata", "Kapha"],
    srotasInvolved: ["Mamsavaha", "Purishavaha"],
    phenotypeCheck: "Mamsavaha srotas vitiation involving muscular tissue hypertrophy, cystic growths, or anorectal vascular congestion.",
    chikitsaSutra: "मांसधातुप्रसादनं लेखनं वह्निदीपनम्। शोफघ्नैश्च गुग्गुलुभिर्ग्रन्थिशमं नयेत्॥ (Balance muscle tissue metabolism with scraping herbs, digestive stimulants, and anti-inflammatory Guggulu preparations.)",
    classicalFormulations: ["Kanchnar Guggulu", "Triphala Guggulu", "Abhayarishta", "Arshoghni Vati"],
    pathya: ["Surana vegetable", "High-fiber seasonal greens", "Warm water", "Buttermilk"],
    apathya: ["Constipating dry food", "Sedentary sitting", "Straining at stool"]
  },
  EF: {
    dominantDosha: ["Kapha", "Vata"],
    srotasInvolved: ["Medovaha", "Mutravaha"],
    phenotypeCheck: "Medovaha and metabolic channel derangement leading to adipose accumulation, fluid stagnation, and glucose dysregulation.",
    chikitsaSutra: "मेदःकफहरं कर्म व्यायामो लेखनं तथा। शिलारसैरयस्कृतिभिः प्रमेहनिवारणम्॥ (Deplete excess Kapha and Medas through active exercise, scraping therapies, and mineral alteratives like Shilajit and Lauha.)",
    classicalFormulations: ["Nisha Amalaki Churna", "Chandraprabha Vati", "Medohar Guggulu", "Asanadi Kashayam"],
    pathya: ["Barley (Yava)", "Roasted whole grains", "Bitter gourd", "Brisk walking"],
    apathya: ["Refined sugars", "Dairy sweets", "Sedentary routine", "Day sleep"]
  },
  EG: {
    dominantDosha: ["Vata"],
    srotasInvolved: ["Asthivaha"],
    phenotypeCheck: "Asthivaha srotas derangement presenting as osseous pain, degenerative changes, and joint space narrowing.",
    chikitsaSutra: "अस्थिपोषकरं कर्म तिक्तक्षीरसर्पिषा। बस्तिभिर्वातशमनैः सन्धिशूलं प्रणाशयेत्॥ (Nourish bone tissue with bitter-medicated milk and ghee, and pacify Vata with therapeutic Tikta-Ksheera Basti.)",
    classicalFormulations: ["Lakshadi Guggulu", "Shallaki Vati", "Mukta Shukti Bhasma", "Maharasnadi Kwatha"],
    pathya: ["Warm cow's milk with ghee", "Sesame seeds", "Gentle sunlight exposure", "Light stretching"],
    apathya: ["Fasting", "Cold winds", "Dry snacks", "High-impact jumping"]
  },
  EH: {
    dominantDosha: ["Vata"],
    srotasInvolved: ["Majjavaha"],
    phenotypeCheck: "Majjavaha srotas vitiation involving nerve conduction irregularities, deep tissue pain, or bone marrow depletion.",
    chikitsaSutra: "मज्जाधातुबलकरं स्नेहनं तैलसेवनम्। बस्तिभिर्वातशमनैर्नाडीदोषं विनाशयेत्॥ (Strengthen neural and marrow tissue with systematic Snehana, internal unction, and Vata-pacifying medicated bastis.)",
    classicalFormulations: ["Ashwagandha Churna", "Brahmi Ghrita", "Ekangaveera Rasa", "Ksheerabala 101"],
    pathya: ["Almonds and walnuts", "Warm milk with ghee", "Oil massage", "Deep rest"],
    apathya: ["Sensory overload", "Sleeplessness", "Cold drafts", "Prolonged mental stress"]
  },
  EJ: {
    dominantDosha: ["Vata", "Pitta"],
    srotasInvolved: ["Mutravaha"],
    phenotypeCheck: "Mutravaha srotas pathology presenting with dysuria, strangury, urinary calculi, or altered volume and frequency.",
    chikitsaSutra: "मूत्रवहस्रोतोविशोधनं शीतवीर्यैः कषायकैः। गोक्षुराद्यैश्च शमनं कुर्यान्मूत्ररुजापहम्॥ (Cleanse urinary pathways with cooling diuretic herbal decoctions and Gokshura-dominated formulations.)",
    classicalFormulations: ["Gokshuradi Guggulu", "Chandraprabha Vati", "Varunadi Kwatha", "Trinapanchamula Kashayam"],
    pathya: ["Tender coconut water", "Cucumber", "Barley water", "Generous fluid intake"],
    apathya: ["Excess spicy chili", "Withholding urination", "Excess horse gram", "Alcohol"]
  },
  EM: {
    dominantDosha: ["Vata"],
    srotasInvolved: ["Manovaha", "Sanjnavaha"],
    phenotypeCheck: "Manovaha srotas perturbation disrupting cognitive clarity, emotional equilibrium, and nervous stability.",
    chikitsaSutra: "धीधैर्यात्मादिविज्ञानं मनोदोषौषधं परम्। मेध्यै रसायनैः शान्तिं मूर्ध्नितैलेन साधयेत्॥ (Rebalance psychic doshas through Medhya Rasayana herbs, Shirodhara, and supportive cognitive grounding.)",
    classicalFormulations: ["Brahmi Vati", "Saraswatarishta", "Smritisagar Rasa", "Ashwagandha Churna"],
    pathya: ["Warm milk with ghee", "Meditation and Pranayama", "Quiet surroundings", "Regular sleep"],
    apathya: ["Alcohol and stimulants", "Late-night screen use", "Isolation", "Emotional turmoil"]
  },
  AA: {
    dominantDosha: ["Vata"],
    srotasInvolved: ["Vatavaha", "Asthivaha", "Majjavaha"],
    phenotypeCheck: "Generalized or localized Vata Vyadhi resulting from tissue depletion (Dhatukshaya) or channel occlusion (Margavarodha).",
    chikitsaSutra: "स्नेहः स्वेदो बस्तिर्नस्यं वातव्याधौ महाबलम्। तैलैरभ्यञ्जनं नित्यं वातशूलनिवारणम्॥ (Administer Snehana, Svedana, and medicated Basti (the supreme Vata remedy) alongside daily warm oil massage.)",
    classicalFormulations: ["Maha Yograj Guggulu", "Dashamula Kwatha", "Balarishta", "Mahanarayana Taila"],
    pathya: ["Warm unctuous meals", "Garlic and sesame oil", "Warm showers", "Restful sleep"],
    apathya: ["Dry cold snacks", "Fasting", "Cold air exposure", "Withholding urges"]
  }
};

// --- Helper: Extract Doshas from Text ---
export function extractDoshasFromText(text = "") {
  const t = text.toLowerCase();
  if (/s[aā]nnip[aā]t|trido[sṣ]a|all three/i.test(t)) {
    return ["Tridosha (Vata, Pitta, Kapha)"];
  }
  const hasVata = /v[aā]ta|v[aā]tika|anila|m[aā]ruta|neuropath/i.test(t);
  const hasPitta = /pitta|paittika|[uū][sṣ][nṇ]a|d[aā]ha|burning|bile/i.test(t);
  const hasKapha = /kapha|[sś]le[sṣ]ma|kaphaja|mucus/i.test(t);
  const hasRakta = /rakta|[sś]o[nṇ]ita|haemo|hemo|bleeding/i.test(t);

  const doshas = [];
  if (hasVata) doshas.push("Vata");
  if (hasPitta) doshas.push("Pitta");
  if (hasKapha) doshas.push("Kapha");
  if (hasRakta && !doshas.includes("Rakta (Dushya)")) doshas.push("Rakta (Dushya)");

  return doshas.length > 0 ? doshas : null;
}

// --- Helper: Deduce Srotas from Code & Text ---
export function deduceSrotasFromCode(code = "", text = "") {
  const c = code.toUpperCase();
  const t = text.toLowerCase();
  const srotas = [];

  if (c.startsWith("EA") || /pr[aā][nṇ]avaha|respirat|dyspn|asthma|cough|k[aā]sa|[sś]v[aā]sa/i.test(t)) srotas.push("Pranavaha");
  if (c.startsWith("EB") || /annavaha|pur[iī][sṣ]avaha|digest|stomach|gastric|atis[aā]ra|chardi|amlapitta/i.test(t)) {
    srotas.push("Annavaha");
    if (/pur[iī][sṣ]a|diarrh|constip|stool|atis[aā]ra|vibandha/i.test(t)) srotas.push("Purishavaha");
  }
  if (c.startsWith("EC") || /rasavaha|jvara|fever|h[rṛ]d|heart|p[aā][nṇ][dḍ]u|anaemia|[aā]mav[aā]ta/i.test(t)) {
    srotas.push("Rasavaha");
    if (/jvara|fever/i.test(t)) srotas.push("Svedavaha");
    if (/h[rṛ]d|cardio/i.test(t)) srotas.push("Raktavaha");
  }
  if (c.startsWith("ED") || /raktavaha|ku[sṣ][tṭ]ha|skin|k[aā]mal[aā]|jaundice|v[aā]tarakta|gout|bleeding/i.test(t)) {
    srotas.push("Raktavaha");
    if (/ku[sṣ][tṭ]ha|skin|derma/i.test(t)) srotas.push("Svedavaha");
    if (/v[aā]tarakta|gout/i.test(t)) srotas.push("Asthivaha");
  }
  if (c.startsWith("EE") || /m[aā][mṃ]savaha|ar[sś]a|piles|hemorrhoid|arbuda|tumor/i.test(t)) {
    srotas.push("Mamsavaha");
    if (/ar[sś]a|piles/i.test(t)) srotas.push("Purishavaha");
  }
  if (c.startsWith("EF") || /medovaha|prameha|madhumeha|diabet|sthaulya|obes/i.test(t)) {
    srotas.push("Medovaha");
    srotas.push("Mutravaha");
  }
  if (c.startsWith("EG") || /asthivaha|bone|joint|sandhi|osteo/i.test(t)) srotas.push("Asthivaha");
  if (c.startsWith("EH") || /majj[aā]vaha|marrow|nerve/i.test(t)) srotas.push("Majjavaha");
  if (c.startsWith("EI") || /[sś]ukravaha|reproduct|semen/i.test(t)) srotas.push("Shukravaha");
  if (c.startsWith("EJ") || /m[uū]travaha|urinar|dysuria|calcul|kidney|[aā][sś]mar[iī]|m[uū]trak[rṛ]cchra/i.test(t)) srotas.push("Mutravaha");
  if (c.startsWith("EK") || /udakavaha|ambuvaha|oedema|[sś]otha|ascites|udara/i.test(t)) srotas.push("Udakavaha");
  if (c.startsWith("EL") || /[aā]rtavavaha|yoni|gynaec|gynec|menstrua|[sś]vetapradara/i.test(t)) srotas.push("Artavavaha");
  if (c.startsWith("EM") || /manovaha|sa[ñj]ñ[aā]vaha|mental|psych|unm[aā]da|apasm[aā]ra|epilep/i.test(t)) srotas.push("Manovaha");
  if (c.startsWith("AA") || /v[aā]tavy[aā]dhi|neural|sciatica|paralys/i.test(t)) {
    if (!srotas.includes("Asthivaha")) srotas.push("Asthivaha");
    if (!srotas.includes("Majjavaha")) srotas.push("Majjavaha");
  }
  if (c.startsWith("S") || /basti|vy[aā]pad|nir[uū]ha/i.test(t)) {
    if (!srotas.includes("Purishavaha")) srotas.push("Purishavaha");
    if (!srotas.includes("Annavaha")) srotas.push("Annavaha");
  }

  return srotas.length > 0 ? [...new Set(srotas)] : ["Rasavaha", "Annavaha"];
}

// --- Helper: Match Knowledge Base Entry ---
export function findBestClinicalProfile(code = "", combinedText = "") {
  for (const entry of Object.values(CLINICAL_KNOWLEDGE_BASE)) {
    for (const pattern of entry.matchPatterns) {
      if (pattern.test(code) || pattern.test(combinedText)) {
        return entry;
      }
    }
  }

  // Check chapter baseline
  const prefix2 = code.substring(0, 2).toUpperCase();
  if (CHAPTER_FALLBACKS[prefix2]) return CHAPTER_FALLBACKS[prefix2];

  const prefix1 = code.substring(0, 1).toUpperCase();
  if (CHAPTER_FALLBACKS[prefix1]) return CHAPTER_FALLBACKS[prefix1];

  return null;
}

// --- Universal Profile Enricher ---
export function enrichAyurvedicClinicalProfile(record) {
  if (!record) return record;

  const code = (record.code || "").toUpperCase();
  const term = (record.ayurvedicTerm || record.transliteration || "").toLowerCase();
  const english = (record.englishEquivalent || "").toLowerCase();
  const definition = (record.clinicalOverview?.definition || "").toLowerCase();
  const combinedText = `${code} ${term} ${english} ${definition}`;

  // 1. Locate best clinical template
  const matched = findBestClinicalProfile(code, combinedText);

  // 2. Extract specific doshas
  const explicitDoshas = extractDoshasFromText(combinedText);
  const finalDoshas = explicitDoshas || matched?.dominantDosha || ["Tridosha (Vata, Pitta, Kapha)"];

  // 3. Deduce Srotas
  const finalSrotas = matched?.srotasInvolved || deduceSrotasFromCode(code, combinedText);

  // 4. Pathomechanism Enrichment
  const pm = record.pathomechanism || {};
  const isDoshaEmpty = !pm.dominantDosha || pm.dominantDosha.length === 0 || pm.dominantDosha[0] === "Not catalogued" || pm.dominantDosha[0] === "Not classified";
  const isSrotasEmpty = !pm.srotasInvolved || pm.srotasInvolved.length === 0 || pm.srotasInvolved[0] === "Not catalogued" || pm.srotasInvolved[0] === "Not classified";
  const isPhenotypeEmpty = !pm.phenotypeCheck || pm.phenotypeCheck.startsWith("Use a qualified") || pm.phenotypeCheck.startsWith("Determine from WHO");

  record.pathomechanism = {
    dominantDosha: isDoshaEmpty ? finalDoshas : pm.dominantDosha,
    srotasInvolved: isSrotasEmpty ? finalSrotas : pm.srotasInvolved,
    phenotypeCheck: isPhenotypeEmpty
      ? (matched?.phenotypeCheck || `Clinical presentation characterized by ${finalDoshas.join(' and ')} imbalance lodging in ${finalSrotas.join(', ')} channels. Clinician should evaluate Agni strength, Ama presence, and Dhatu involvement.`)
      : pm.phenotypeCheck
  };

  // 5. Treatment Framework Enrichment
  const tf = record.treatmentFramework || {};
  const isSutraEmpty = !tf.chikitsaSutra || tf.chikitsaSutra.startsWith("No treatment");
  const isFormulationsEmpty = !tf.classicalFormulations || tf.classicalFormulations.length === 0;
  const isPathyaEmpty = !tf.pathya || tf.pathya.length === 0;
  const isApathyaEmpty = !tf.apathya || tf.apathya.length === 0;

  record.treatmentFramework = {
    chikitsaSutra: isSutraEmpty
      ? (matched?.chikitsaSutra || "दोषप्रत्यानीकचिकित्सा, निदानपरिवर्जनं च। दीपन-पाचन-संशमनैः स्रोतोविशोधनम्॥ (Eliminate etiologic triggers (Nidana Parivarjana), balance aggravated doshas with Deepana-Pachana herbs, and restore physiological channel patency.)")
      : tf.chikitsaSutra,
    classicalFormulations: isFormulationsEmpty
      ? (matched?.classicalFormulations || ["Triphala Churna", "Sudarshana Vati", "Dashamula Kashayam", "Arogyavardhini Vati"])
      : tf.classicalFormulations,
    pathya: isPathyaEmpty
      ? (matched?.pathya || [
          "Light, warm freshly cooked meals (Laghu Ahara)",
          "Lukewarm boiled water (Ushnodaka) throughout the day",
          "Green gram soup (Mudga Yusha) and seasonal vegetables",
          "Adequate physical rest and regular circadian sleep routine"
        ])
      : tf.pathya,
    apathya: isApathyaEmpty
      ? (matched?.apathya || [
          "Heavy, cold, unctuous, and deep-fried foods (Guru & Snigdha Ahara)",
          "Incompatible food combinations (Viruddhahara) and stale leftovers",
          "Daytime sleeping (Diva Svapna) and erratic meal timings",
          "Suppression of natural physiological urges (Vega Dharana)"
        ])
      : tf.apathya
  };

  // 6. Lab Correlations Enrichment
  const lc = record.labCorrelations || {};
  const isTestsEmpty = !lc.suggestedTests || lc.suggestedTests.length === 0 || lc.suggestedTests[0] === "Select tests based on clinical presentation and guideline.";
  if (isTestsEmpty) {
    record.labCorrelations = {
      suggestedTests: matched?.suggestedTests || [
        "Complete Blood Count (CBC with differential)",
        "Routine & Microscopic Urinalysis",
        "Erythrocyte Sedimentation Rate (ESR)",
        "Metabolic Screen as clinically indicated"
      ],
      targets: matched?.targets || lc.targets || {}
    };
  }

  // 7. Auto-populate Cardinal Symptoms from Parsed Symptoms if empty
  if ((!record.clinicalOverview?.cardinalSymptoms || record.clinicalOverview.cardinalSymptoms.length === 0) && record.parsedSymptoms) {
    record.clinicalOverview.cardinalSymptoms = record.parsedSymptoms.slice(0, 6).map(s => `${s.term} (${s.gloss})`);
  }

  return record;
}
