<!-- # IMPLEMENTATION PLAN
## Patient Profile Page (Doctor's View)
### SIH 2026 | Patient Case-Taking Software

---

## PHASE 1: SETUP (30 minutes)

### 1.1 Create Folder Structure
```
src/
├── pages/
│   └── PatientProfile.jsx
├── components/
│   ├── PatientProfile/
│   │   ├── Header.jsx
│   │   ├── PatientInfoCard.jsx
│   │   └── SidebarCards.jsx
│   └── Common/
│       └── Button.jsx (optional)
├── hooks/
│   └── usePatientData.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
└── utils/
    └── formatters.js
```

### 1.2 Install Dependencies
```bash
npm install react react-dom
npm install -D tailwindcss postcss autoprefixer
npm install axios (optional, for API calls)
```

### 1.3 Configure Tailwind
```bash
# Copy provided tailwind.config.js to project root
# Create postcss.config.js
# Add @tailwind imports to src/index.css
```

### 1.4 Create postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## PHASE 2: COMPONENTS (1-2 hours)

### 2.1 Copy Provided Components
```
From handoff package, copy to project:
✓ PatientProfilePage.jsx → src/pages/
✓ Header.jsx → src/components/PatientProfile/
✓ PatientInfoCard.jsx → src/components/PatientProfile/
✓ SidebarCards.jsx → src/components/PatientProfile/
✓ tailwind.config.js → project root
```

### 2.2 Create usePatientData Hook
**File: src/hooks/usePatientData.js**
```javascript
import { useState, useEffect } from 'react';

export const usePatientData = (patientId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    
    // TODO: Replace with actual API call
    fetch(`/api/patients/${patientId}`)
      .then(r => r.json())
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { data, loading, error };
};
```

### 2.3 Create API Service
**File: src/services/api.js**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchPatient = (patientId) => {
  const token = localStorage.getItem('authToken');
  return fetch(`${API_BASE_URL}/patients/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(r => r.json())
    .then(res => res.data);
};
```

### 2.4 Create Formatters Utility
**File: src/utils/formatters.js**
```javascript
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '+$1-$2-$3');
};
```

### 2.5 Update Component Imports
**In PatientProfilePage.jsx:**
```javascript
import Header from '../components/PatientProfile/Header';
import PatientInfoCard from '../components/PatientProfile/PatientInfoCard';
import { CriticalCard, CheckupsCard, PatientPhotoCard } 
  from '../components/PatientProfile/SidebarCards';
import { usePatientData } from '../hooks/usePatientData';
```

---

## PHASE 3: STYLING (30-45 minutes)

### 3.1 Add Tailwind to Main CSS
**File: src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 3.2 Verify Tailwind Configuration
```javascript
// tailwind.config.js should have:
colors: {
  'bg-primary': '#F5FAF8',
  'green-primary': '#2F8F83',
  'navy-dark': '#12304A',
  'green-light': '#E4F5EF',
  'blue-light': '#EAF3FF',
  'purple-light': '#F0EBFF',
  'pink-light': '#FDECEF',
  'text-primary': '#183B56',
}

spacing: {
  'xs': '4px',
  'sm': '8px',
  'md': '16px',
  'lg': '24px',
  'xl': '32px',
}

fontSize: {
  'h1': ['28px', { fontWeight: '700' }],
  'h2': ['18px', { fontWeight: '700' }],
  'body': ['14px', { fontWeight: '400' }],
  'label': ['12px', { fontWeight: '700' }],
}
```

### 3.3 Test Components with Mock Data
```javascript
// PatientProfilePage.jsx includes mock data
// Run: npm run dev
// Verify layout renders correctly
// Verify colors match palette
// Test responsive behavior
```

---

## PHASE 4: DATA INTEGRATION (1-2 hours)

### 4.1 Connect to API
**Update in PatientProfilePage.jsx:**
```javascript
// Replace:
const mockPatientData = { ... };

// With:
const { data: patientData, loading, error } = usePatientData(patientId);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!patientData) return <NoData />;
```

### 4.2 Handle Loading State
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-text-primary">Loading patient data...</div>
    </div>
  );
}
```

### 4.3 Handle Error State
```javascript
if (error) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );
}
```

### 4.4 Pass Data to Components
```javascript
<Header />
<div className="flex gap-md p-xl">
  <PatientPhotoCard photo={patientData?.photo} name={patientData?.name} />
  <PatientInfoCard patient={patientData} />
  <div className="space-y-md">
    <CriticalCard alerts={patientData?.criticalAlerts} />
    <CheckupsCard checkups={patientData?.recentCheckups} />
  </div>
</div>
```

---

## PHASE 5: TESTING (45 minutes)

### 5.1 Functional Tests
- [ ] Page loads without errors
- [ ] Mock data displays correctly
- [ ] All patient fields visible
- [ ] Critical alerts show in red
- [ ] Checkups display with dates
- [ ] Navigation tabs clickable
- [ ] Language selector works

### 5.2 Responsive Tests
- [ ] Desktop (≥1200px): 3-column layout
- [ ] Tablet (768-1199px): 2-column layout
- [ ] Mobile (<768px): 1-column stacked

### 5.3 API Integration Tests
- [ ] Replace mock data with API
- [ ] Verify data renders
- [ ] Test error handling
- [ ] Test loading state
- [ ] Check for console errors

### 5.4 Edge Cases
- [ ] Missing patient photo (show placeholder)
- [ ] No medications (show "N/A")
- [ ] Empty allergies (show "None recorded")
- [ ] No checkups (show empty state)
- [ ] API timeout (show retry button)

---

## PHASE 6: POLISH (30 minutes)

### 6.1 Performance
- [ ] Cache patient data (5 min)
- [ ] Lazy load images
- [ ] Optimize re-renders
- [ ] Check bundle size

### 6.2 Accessibility
- [ ] Add alt text to images
- [ ] Add ARIA labels
- [ ] Test keyboard navigation
- [ ] Test with screen reader

### 6.3 Code Quality
- [ ] Remove console logs
- [ ] Add comments
- [ ] Fix TypeScript errors (if using)
- [ ] Run linter

### 6.4 Visual Polish
- [ ] Verify colors match exactly
- [ ] Check spacing alignment
- [ ] Test hover states
- [ ] Check font sizes

---

## API REQUIREMENTS

### Endpoint: GET /api/patients/:patientId
**Required Fields in Response:**
```javascript
{
  id: string,
  name: string,
  age: number,
  dob: string,
  bloodGroup: string,
  photo: string (URL),
  contact: {
    phone: string,
    email: string,
    address: string
  },
  medications: [{
    name: string,
    dosage: string,
    frequency: string
  }],
  allergies: string[],
  conditions: string[],
  criticalAlerts: [{
    type: string,
    text: string,
    severity: 'high' | 'medium' | 'low'
  }],
  recentCheckups: [{
    date: string,
    type: string,
    summary: string
  }]
}
```

---

## MOCK DATA STRUCTURE

**For testing without backend:**
```javascript
const mockPatient = {
  id: '13520802724',
  name: 'Rajesh Kumar',
  age: 32,
  dob: '1992-03-15',
  bloodGroup: 'O+',
  photo: null,
  contact: {
    phone: '+91-9876543210',
    email: 'rajesh@email.com',
    address: 'Delhi, India'
  },
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
  ],
  allergies: ['Penicillin'],
  conditions: ['Type 2 Diabetes'],
  criticalAlerts: [
    { type: 'allergy', text: 'Penicillin Allergy', severity: 'high' }
  ],
  recentCheckups: [
    { date: '2024-09-05', type: 'General Checkup', summary: 'BP: 130/85' }
  ]
};
```

---

## DEPLOYMENT CHECKLIST

- [ ] All components render
- [ ] No console errors
- [ ] API integrated
- [ ] Responsive design works
- [ ] Mock data removed
- [ ] Environment variables set
- [ ] Error handling in place
- [ ] Performance acceptable
- [ ] Accessibility tested
- [ ] Code reviewed

---

## TIMELINE ESTIMATE

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup | 30 min |
| 2 | Components | 1-2 hr |
| 3 | Styling | 30-45 min |
| 4 | API Integration | 1-2 hr |
| 5 | Testing | 45 min |
| 6 | Polish | 30 min |
| **TOTAL** | **Complete Implementation** | **4-6 hours** |

---

## SUCCESS CRITERIA

✅ Page loads without errors  
✅ Patient data displays correctly  
✅ Layout matches wireframe  
✅ Colors match palette exactly  
✅ Responsive on all devices  
✅ Critical alerts show prominently  
✅ Recent checkups display with dates  
✅ No console warnings/errors  
✅ API integration working  
✅ Loading/error states handled  

---

## COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| Tailwind classes not applying | Check tailwind.config.js in root, restart dev server |
| Components not rendering | Verify import paths, check file locations |
| API call fails | Check endpoint URL, verify JWT token, check network tab |
| Images not loading | Check URL format, add fallback placeholder |
| Layout broken on mobile | Verify responsive Tailwind classes |
| Colors wrong | Check hex values in tailwind.config.js |

---

## DONE ✅

When all success criteria met, this page is production-ready.

Next: Move to Doctor Dashboard page.
 -->



STRICT SCOPE: Work ONLY inside abhaId.jsx.

Do not modify, create, delete, rename, or edit any other file.

Do not touch:

Backend
Routes / routing files
basicInfo.jsx
uploadDoc.jsx
consent.jsx
index.css
vite.config.js
Components outside abhaId.jsx
Zustand/store files
APIs
Controllers
Services
Models
Database
Authentication

Do not create a new route. The route will be handled separately.

Do not modify any existing page.

Objective

Implement the ABHA ID page inside abhaId.jsx based on the provided wireframe.

Layout

Follow the wireframe closely:

┌─────────────────────────────────────────────────────────┐
│                     TOP NAVBAR                          │
│  ABHA ID      Docs      Basic Info    English   ○ LOGO │
└─────────────────────────────────────────────────────────┘


                  large whitespace


┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────┐   ┌────────────────────┐ │
│  │                          │   │                    │ │
│  │       ABHA ID CARD       │   │ pending consents   │ │
│  │                          │   │                    │ │
│  │ Patient information      │   │ ───────────────    │ │
│  │                          │   │ ───────────────    │ │
│  │                    QR    │   │ ───────────────    │ │
│  │                          │   │                    │ │
│  └──────────────────────────┘   │ view all consents │ │
│                                 └────────────────────┘ │
│                                      ┌───────────────┐ │
│                                      │    download   │ │
│                                      └───────────────┘ │
└─────────────────────────────────────────────────────────┘
Color palette

Use the same existing SIH palette:

#12304A  → Navy
#2F8F83  → Teal
#F5FAF8  → Main background
#E4F5EF  → Light teal
#EAF3FF  → Light blue
#F0EBFF  → Light purple
#FDECEF  → Light pink

Do not introduce a different theme.

Navbar

Implement the navbar visually matching the existing SIH pages.

Include:

ABHA ID
Docs
Basic Info
English selector
Profile circle
Logo

Do not implement navigation logic in this task. Only create the visual navbar inside abhaId.jsx.

ABHA ID Card

Create a large ABHA ID card on the left.

Include:

National Health Authority branding
ABHA branding
Patient name
Health ID
PHR Address
DOB
Gender
Mobile number
QR code

Use local mock data directly inside abhaId.jsx.

Pending Consents

Create the right-side card:

Pending Consents

Display multiple consent entries separated by horizontal lines.

Add:

View All Consents

as a button.

Since this task is restricted to abhaId.jsx, keep the interaction frontend-only.

Download

Add the large Download button below the pending-consents card.

Keep it frontend-only. Do not create an API or backend download functionality.

Responsive layout

Desktop:

ABHA ID CARD       |       PENDING CONSENTS
                   |       DOWNLOAD

Mobile:

ABHA ID CARD
     ↓
PENDING CONSENTS
     ↓
DOWNLOAD

Use responsive Tailwind classes and ensure there is no horizontal overflow.

Code requirements
Use React JSX.
Use the existing Tailwind setup.
Keep everything required for this page inside abhaId.jsx.
Use local mock data.
Do not import or modify unnecessary files.
Do not create new components in separate files.
Do not change project configuration.
Do not change routing.
Do not change backend code.
Final instruction

ONLY edit abhaId.jsx. Do not edit ANY other file for any reason. Do not touch the backend. Do not modify routing. Implement the ABHA ID page completely inside abhaId.jsx, following the provided wireframe and the existing SIH color palette/design language.