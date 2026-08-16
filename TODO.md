# Autism App Fix Task - Copy Button & Gemini Chatbot
Current Working Directory: e:/autism_project

## Approved Plan Steps:

### 1. ✅ Install Dependencies
- `pip install google-generativeai` ✅ (completed)
- Update requirements.txt ✅

### 2. ✅ Update app_fixed.py
- Add `risk_summary` to predict() template context ✅
- Add `/chat` POST endpoint for Gemini proxy ✅

### 3. ✅ Update templates/result.html
- Add `{{ risk_summary }}` var ✅
- Fix copyRiskToChatbot() to use pre-rendered text ✅ (now uses risk_summary)
- Change callGeminiAPI() to POST to `/chat` ✅ (backend proxy + API key input)

### 4. [READY] Test & Verify
- Kill any running Flask server (Ctrl+C)
- Set GEMINI_API_KEY: `set GEMINI_API_KEY=your_actual_key_here` (get from https://aistudio.google.com/app/apikey)
- Run `python app_fixed.py`
- Test: Upload audio/video → copy button → paste API key → ask question in chat
- Check browser console/network tab for /chat calls

### 5. [PENDING] Final Completion

**Next Step: Update requirements.txt and app_fixed.py**

