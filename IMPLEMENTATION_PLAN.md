Update the existing Mediksha SOCRATES Clinical Intake Form by adding voice accessibility.

SCOPE — STRICT:
- Work ONLY inside the frontend folder.
- Do NOT modify anything outside the frontend folder.
- Do NOT touch backend, database, APIs, server files, or authentication.
- Do NOT change the existing SOCRATES questions, form logic, validation, submission logic, or overall design.

VOICE FEATURES:
For every SOCRATES question, add:

1. 🔊 Listen
- Reads the question aloud.
- Uses the user's already-selected Mediksha website language.
- Do NOT add a language selector to the SOCRATES page.

2. 🎤 Speak
- Allows the patient to answer using their voice.
- Converts speech to text.
- Inserts the transcript into the existing answer field.
- The answer remains manually editable.
- Show a clear listening/recording state.
- Allow the user to stop listening.

LANGUAGES — ONLY THESE FOUR:
- English → en-IN
- हिंदी (Hindi) → hi-IN
- বাংলা (Bengali) → bn-IN
- தமிழ் (Tamil) → ta-IN

Do NOT add or support any other languages.

LANGUAGE LOGIC:
Use the existing global Mediksha language-selection system.

Global Mediksha language
→ SOCRATES Listen language
→ SOCRATES Speech-to-Text language

Do NOT create a separate language state or language selector.

IMPLEMENTATION:
- First inspect the frontend to find the existing SOCRATES component and the existing global language system.
- Reuse the existing language system.
- Use reusable voice logic/components instead of duplicating code for every question.
- Handle start, stop, transcript, errors, and unsupported-browser cases.
- Prevent multiple voice/listening sessions from running simultaneously.
- Preserve existing typed answers.
- Keep the current UI, layout, spacing, colors, and styling.
- Add only the required Listen and Speak controls.

IMPORTANT:
Before editing, identify the exact files that need to be changed and modify only those files inside the frontend folder.

FINAL CHECK:
Verify that:
- All SOCRATES questions have the voice controls.
- Listen uses the selected Mediksha language.
- Speak uses the selected Mediksha language.
- Only English, Hindi, Bengali, and Tamil are supported.
- Existing form functionality still works.
- No backend or files outside frontend were modified.