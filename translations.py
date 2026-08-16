"""
Multi-language support for the autism project
"""

LANGUAGES = {
    'en': 'English',
    'ta': 'Tamil',
    'hi': 'Hindi'
}

# Translation strings
TRANSLATIONS = {
    'en': {
        'title': 'Autism Risk Assessment',
        'risk_score': 'Risk Score',
        'interpretation': 'Interpretation',
        'next_steps': 'Recommended Next Steps',
        'visualizations': 'Visualizations',
        'chatbot_title': 'Ask Your Doubts',
        'copy_button': '📋 Copy Risk Info to Chatbot',
        'send': 'Send',
        'ask_question': 'Ask a question...',
        'history': 'Assessment History',
        'compare': 'Compare Assessments',
        'export': 'Export Report',
        'export_pdf': 'Export as PDF',
        'export_excel': 'Export as Excel',
        'date': 'Date',
        'score': 'Score',
        'language': 'Language',
        'loading': 'Loading...',
        'no_history': 'No assessment history found.',
        'select_language': 'Select Language',
        'home': 'Home',
        'back': 'Back',
        'error': 'Error',
        'success': 'Success',
    },
    'ta': {
        'title': 'மாணவன் ஆபத்து மதிப்பீடு',
        'risk_score': 'ஆபத்து மதிப்பெண்',
        'interpretation': 'விளக்கம்',
        'next_steps': 'பரிந்துரைக்கப்பட்ட அடுத்த படிகள்',
        'visualizations': 'தரவுத்திரள்கள்',
        'chatbot_title': 'உங்கள் சந்தேகങ்களைக் கேளுங்கள்',
        'copy_button': '📋 ஆபத்து தகவலை சேட்பாட்டிற்கு நகலெடுக்கவும்',
        'send': 'அனுப்பவும்',
        'ask_question': 'ஒரு கேள்வி கேளுங்கள்...',
        'history': 'மதிப்பீட்டு வரலாறு',
        'compare': 'மதிப்பீடுகளைத் ஒப்பிடுக',
        'export': 'அறிக்கை ஏற்றுமதி செய்க',
        'export_pdf': 'PDF ஆக ஏற்றுமதி செய்க',
        'export_excel': 'எக்செல் ஆக ஏற்றுமதி செய்க',
        'date': 'தேதி',
        'score': 'மதிப்பெண்',
        'language': 'மொழி',
        'loading': 'ஏற்றுக்கொள்ளப்படுகிறது...',
        'no_history': 'மதிப்பீட்டு வரலாறு காணப்படவில்லை.',
        'select_language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
        'home': 'முகப்பு',
        'back': 'பின்னோக்கி',
        'error': 'பிழை',
        'success': 'வெற்றி',
    },
    'hi': {
        'title': 'आत्मकेंद्रित जोखिम मूल्यांकन',
        'risk_score': 'जोखिम स्कोर',
        'interpretation': 'व्याख्या',
        'next_steps': 'अनुशंसित अगले कदम',
        'visualizations': 'डेटा विज़ुअलाइज़ेशन',
        'chatbot_title': 'अपनी शंकाओं को पूछें',
        'copy_button': '📋 जोखिम जानकारी को चैटबॉट में कॉपी करें',
        'send': 'भेजें',
        'ask_question': 'एक सवाल पूछें...',
        'history': 'मूल्यांकन इतिहास',
        'compare': 'मूल्यांकन की तुलना करें',
        'export': 'रिपोर्ट निर्यात करें',
        'export_pdf': 'PDF के रूप में निर्यात करें',
        'export_excel': 'एक्सेल के रूप में निर्यात करें',
        'date': 'तिथि',
        'score': 'स्कोर',
        'language': 'भाषा',
        'loading': 'लोड हो रहा है...',
        'no_history': 'कोई मूल्यांकन इतिहास नहीं मिला।',
        'select_language': 'भाषा चुनें',
        'home': 'होम',
        'back': 'पीछे',
        'error': 'त्रुटि',
        'success': 'सफलता',
    }
}

def get_translation(key, language='en'):
    """Get translation for a key in specified language"""
    if language not in TRANSLATIONS:
        language = 'en'
    return TRANSLATIONS[language].get(key, key)

def get_all_translations(language='en'):
    """Get all translations for a language"""
    if language not in TRANSLATIONS:
        language = 'en'
    return TRANSLATIONS[language]
