Update the already-created Health Code Selection page.

IMPORTANT:
- Work ONLY on the frontend page/component you just created.
- Do NOT modify any backend files, APIs, database, server logic, or other pages.
- Keep the existing AESIX colour palette and overall design exactly the same.
- Do not redesign the rest of the page.

CHANGE REQUIRED:

The current "NAMASTE CODE" and "ICD-11" buttons should be changed into SEARCH BARS.

1. NAMASTE CODE SEARCH
- Replace the existing NAMASTE CODE selection button with a rounded search input.
- The input should clearly indicate that the user should enter a NAMASTE health code.
- Include a search icon or appropriate search affordance.
- User should be able to type a code.
- Add a search/submit action.
- After searching, the frontend should be structured to display/check the corresponding data.

2. ICD-11 SEARCH
- Replace the existing ICD-11 selection button with another rounded search input.
- Clearly indicate that the user should enter an ICD-11 code.
- Include a search icon or appropriate search affordance.
- User should be able to type a code.
- Add a search/submit action.
- After searching, the frontend should be structured to display/check the corresponding data.

3. HEALTH CODE SELECTION
- Keep "SELECT HEALTH CODE" as the main heading.
- Keep NAMASTE and ICD-11 as two separate search options.
- The user should be able to search either type of code.
- Do not make them simple static buttons anymore.

4. SEARCH RESULT AREA
- Add a clean result area that can display the data returned for the entered code.
- For now, keep the implementation frontend-only.
- Use mock/local data if necessary to demonstrate the result state.
- Do NOT create or modify backend APIs.
- Include appropriate states for:
  - Empty input
  - Searching
  - Code found
  - Code not found

5. DESIGN
- Keep the exact existing AESIX colour palette.
- Keep the rounded-card design from the current implementation.
- Maintain the two-column layout and right-side medical/book illustration.
- Search bars should visually match the existing AESIX UI.
- Do not add unnecessary animations or unrelated components.

6. FUNCTIONAL FLOW

NAMASTE:
Enter NAMASTE code
→ Click search
→ Check code
→ Display corresponding data/result

ICD-11:
Enter ICD-11 code
→ Click search
→ Check code
→ Display corresponding data/result

7. RESPONSIBILITY
Implement only this frontend UI and interaction.
Do not touch backend functionality.
Do not modify other pages or components unless absolutely required for this page to work.

Before editing, inspect the current implementation you just created and modify it rather than creating a duplicate page.