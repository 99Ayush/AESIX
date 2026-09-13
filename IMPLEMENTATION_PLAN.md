Build the MedVault Health Portal Patient Profile dashboard shown in the attached reference image.

IMPORTANT:
The reference image is the SOURCE OF TRUTH.
Recreate the UI as closely as possible. Do not redesign it, change the color palette, add unnecessary sections, or change the overall layout.

==================================================
1. PAGE STRUCTURE
==================================================

Create the page with these major sections:

A. Top navigation header
B. Welcome/header area
C. Main Patient Profile container
D. Left profile section
E. Center Patient Information section
F. Right utility section
G. Bottom Known Allergies + Vaccination cards
H. Chatbot panel inside the right utility section

Desktop layout must visually match the reference.

==================================================
2. BACKGROUND
==================================================

Use a very light mint/white healthcare background.

Approximate colors:

Background:
#EFF9F7

Primary dark navy:
#084766

Primary teal:
#0C9A9A

Secondary green:
#16B889

Light mint:
#E8F7F4

White:
#FFFFFF

Pink accent:
#F52B91

Light pink:
#FDE3EF

Purple accent:
#8B6BE8

Yellow:
#FFB800

Use very subtle borders and shadows.

Do NOT use strong dark borders.

==================================================
3. TOP NAVIGATION
==================================================

Create a white/light glass-style navigation bar across the top.

LEFT:

Shield icon
MedVault
HEALTH PORTAL

CENTER:

ABHA
Documents
Basic Info

RIGHT:

English dropdown
Notification bell
Red notification badge "0"
Circular LP avatar
Loading profile...
Dropdown arrow

Use rounded pill controls.

Navigation spacing should closely match the reference.

==================================================
4. WELCOME HEADER
==================================================

Below navbar:

LEFT:

Welcome back, Loading profile... 👋

Use a large bold dark navy/teal heading.

RIGHT:

Calendar icon
Sunday, 13 September 2026
small separator dot
Last synced 3 min ago

Keep everything horizontally aligned like the reference.

==================================================
5. MAIN PATIENT PROFILE CONTAINER
==================================================

Create one large rounded white/glass container.

Use approximately:

border-radius: 18px
border: 1px solid very-light teal
background: rgba(255,255,255,0.85)

TOP AREA:

PATIENT PROFILE

Loading profile...

Right side:

Green Active Patient pill

Edit Profile pill with pencil icon

Add a subtle horizontal divider underneath.

==================================================
6. MAIN CONTENT GRID
==================================================

Desktop:

LEFT COLUMN:
approximately 20%

CENTER COLUMN:
approximately 45%

RIGHT COLUMN:
approximately 35%

Maintain the spacing visible in the reference.

Do NOT allow the right section to overlap the center section.

==================================================
7. LEFT PROFILE SECTION
==================================================

Create the large profile/avatar area.

Use a pale mint rounded square.

Inside:

Large circular teal avatar

Text:
LP

White, bold, large initials.

Add small circular camera button at bottom-right.

Below avatar:

⭐ KNOWN ALLERGIES

Then:

+ Penicillin (Severe)

The allergy tag should be pink with rounded corners.

==================================================
8. CENTER PATIENT INFORMATION
==================================================

Create the Patient Information card.

Title:

PATIENT INFORMATION

Use two columns.

LEFT:

PATIENT ID
—

GENDER
—

CONTACT
📞 —

ADDRESS
📍 —

ABHA NUMBER
—

RIGHT:

DATE OF BIRTH
—

BLOOD TYPE
—

EMAIL
✉️ —

EMERGENCY
—

STATUS
—

Labels should be:

small
uppercase
teal
semibold

Values should be dark navy/teal.

Keep generous vertical spacing.

The card should have:

white/light glass background
subtle border
rounded corners

==================================================
9. BOTTOM ACTION CARDS
==================================================

Under the left + center content create two horizontal cards.

CARD 1:

Circular allergy icon

Known Allergies

View and manage your allergies

Chevron →

CARD 2:

Circular syringe icon

Vaccination

View your vaccination records

Chevron →

Both cards should have the same pale mint styling.

==================================================
10. RIGHT UTILITY SECTION
==================================================

This is VERY IMPORTANT.

Create a separate right-side rounded container.

Inside it place TWO buttons/cards at the TOP.

------------------------------------------
BUTTON 1
------------------------------------------

Medical Dictionary

Structure:

[ circular medical book icon ] Medical Dictionary                         →

Use:

light mint background
rounded corners
subtle border
green/teal icon
green/teal text

The button should be horizontal and wide.

------------------------------------------
BUTTON 2
------------------------------------------

Sockets

Place it DIRECTLY BELOW Medical Dictionary.

Use exactly the same card design:

[ circular medical book/socket icon ] Sockets                         →

Same:

height
padding
border radius
background
icon size
text styling
chevron position

There should be a small consistent gap between the two cards.

==================================================
11. CHATBOT PANEL
==================================================

Below Medical Dictionary and Sockets create a LARGE rounded chatbot panel.

IMPORTANT:

The chatbot MUST remain INSIDE THE RIGHT-SIDE UTILITY CONTAINER.

Do NOT place it as a floating chatbot in the bottom-right corner of the entire browser.

Do NOT place it over the navbar.

Do NOT place it outside the main profile container.

The chatbot should occupy the lower portion of the right column exactly like the reference.

Create a large pale/white rounded panel.

Inside the panel:

Place the large healthcare robot toward the LOWER-RIGHT area.

The robot should be significantly larger than the original floating chatbot.

The robot should include:

- rounded robot head
- blue/teal face
- friendly eyes
- smile
- side arms
- antenna
- teal speech bubble
- three white dots inside speech bubble

The robot should be partially anchored toward the bottom-right of the chatbot panel.

Make the chatbot large enough to visually balance the Medical Dictionary and Sockets cards above it.

Do not let the robot escape outside the panel.

==================================================
12. CHATBOT POSITION
==================================================

Use relative positioning for the chatbot panel.

Example conceptual structure:

rightUtility
 ├── medicalDictionaryButton
 ├── socketsButton
 └── chatbotPanel
       └── chatbotRobot

The robot should be:

position: absolute

bottom: approximately 0

right: approximately 20-30px

Scale the robot to approximately 60-70% of the chatbot panel height.

The speech bubble should sit above/right of the robot.

==================================================
13. CARD DESIGN
==================================================

All cards should have:

border-radius: 14-18px

Very subtle border:

rgba(20,150,150,0.12)

Very soft shadow.

Use light mint gradients only where visible in the reference.

Do NOT use heavy shadows.

==================================================
14. TYPOGRAPHY
==================================================

Use a modern rounded sans-serif.

Preferred:

Inter
or
Poppins
or
Nunito Sans

Main heading:
bold / 700-800

Section headings:
600-700

Labels:
600

Supporting text:
400-500

Keep typography visually close to the screenshot.

==================================================
15. ICONS
==================================================

Use consistent rounded healthcare-style icons.

Required:

Shield
Document
Basic Info
Globe
Bell
Calendar
Pencil
Camera
Allergy
Syringe
Phone
Email
Location
Medical Book
Chevron
Chatbot

Medical Dictionary and Sockets must use the green medical-book style icon shown in the reference.

==================================================
16. RESPONSIVE BEHAVIOR
==================================================

Desktop should match the reference image first.

Tablet:

Reduce spacing and widths.

Mobile:

Stack:

Profile
Patient Information
Medical Dictionary
Sockets
Chatbot
Known Allergies
Vaccination

Do not compromise the desktop appearance to achieve responsiveness.

==================================================
17. COMPONENT STRUCTURE
==================================================

Use reusable components.

Suggested structure:

Dashboard
├── Navbar
├── WelcomeHeader
├── PatientProfileContainer
│   ├── ProfileHeader
│   ├── ProfileSection
│   ├── PatientInformation
│   ├── UtilitySection
│   │   ├── MedicalDictionaryCard
│   │   ├── SocketsCard
│   │   └── ChatbotPanel
│   └── BottomActions
│       ├── AllergiesCard
│       └── VaccinationCard

Do not duplicate styles unnecessarily.

==================================================
18. INTERACTIONS
==================================================

Medical Dictionary:
clickable

Sockets:
clickable

Known Allergies:
clickable

Vaccination:
clickable

Edit Profile:
clickable

Language:
dropdown

Notifications:
clickable

Profile:
dropdown

Chatbot:
clickable/openable

Add hover states while keeping the same visual theme.

Hover should be subtle:
slight elevation
slight background change
smooth transition

Do not introduce bright unrelated colors.

==================================================
19. VISUAL ACCURACY
==================================================

After implementing the page:

1. Render the application.
2. Compare it with the supplied reference image.
3. Adjust:
   - card widths
   - card heights
   - margins
   - padding
   - font sizes
   - font weights
   - icon sizes
   - border radius
   - colors
   - alignment
   - chatbot size
   - chatbot position
   - Medical Dictionary position
   - Sockets position
4. Repeat until the rendered UI visually matches the reference as closely as possible.

PRIORITY ORDER:

1. Overall layout
2. Positioning
3. Dimensions
4. Colors
5. Typography
6. Icons
7. Shadows/borders
8. Responsive behavior

==================================================
FINAL REQUIREMENT
==================================================

The final page must look like the supplied MedVault reference image.

Do not move the chatbot outside the right panel.

Do not shrink the chatbot back to a small floating icon.

Keep Medical Dictionary at the top of the right section.

Keep Sockets immediately below Medical Dictionary.

Keep the large chatbot panel below both buttons.

Preserve the existing MedVault color palette and visual style throughout the entire page.