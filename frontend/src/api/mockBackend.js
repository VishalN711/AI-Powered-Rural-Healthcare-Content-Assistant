/**
 * Mock Backend Service
 * Simulates the entire AWS Lambda pipeline locally so the frontend
 * works end-to-end without needing AWS credentials or deployment.
 * All data is stored in-memory and persists for the browser session.
 */

// ── Simulated Bedrock AI Responses ──

const MOCK_EXTRACTIONS = {
    hindi: {
        medications: [
            { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days', instructions: 'Take after food', needs_verification: false },
            { name: 'Azithromycin', dosage: '500mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take after breakfast', needs_verification: false },
        ],
        precautions: ['Avoid cold drinks', 'Avoid spicy food', 'Warm water gargling twice daily', 'Complete the full course of antibiotics'],
        diagnosis: 'Mild fever with throat infection',
        follow_up: 'Review after 5 days if symptoms persist',
        summary: '🏥 आपकी दवाई की जानकारी:\n\nआपको हल्का बुखार और गले का इन्फेक्शन है।\n\n💊 दवाइयाँ:\n1. पैरासिटामोल 500mg - दिन में 2 बार, खाने के बाद (3 दिन)\n2. एज़िथ्रोमाइसिन 500mg - दिन में 1 बार, नाश्ते के बाद (5 दिन)\n\n⚠️ सावधानियाँ:\n• ठंडे पेय न पियें\n• मसालेदार खाना न खाएं\n• दिन में 2 बार गर्म पानी से गरारे करें\n• एंटीबायोटिक का पूरा कोर्स करें\n\n📅 5 दिन बाद लक्षण बने रहें तो डॉक्टर से मिलें',
        whatsapp: '🏥 *डॉक्टर की सलाह*\n\n💊 *दवाइयाँ:*\n\n🌅 *सुबह:*\n• पैरासिटामोल 500mg - खाने के बाद\n• एज़िथ्रोमाइसिन 500mg - नाश्ते के बाद\n\n🌇 *शाम:*\n• पैरासिटामोल 500mg - खाने के बाद\n\n⚠️ *ध्यान रखें:*\n• ठंडे पेय न पियें\n• मसालेदार खाना न खाएं\n• गर्म पानी से गरारे करें\n\n📅 5 दिन बाद दोबारा आएं',
        schedule: {
            morning: [
                { medicine: 'पैरासिटामोल (Paracetamol)', dosage: '500mg - 1 गोली', instructions: 'नाश्ते के बाद' },
                { medicine: 'एज़िथ्रोमाइसिन (Azithromycin)', dosage: '500mg - 1 गोली', instructions: 'नाश्ते के बाद' },
            ],
            afternoon: [],
            evening: [
                { medicine: 'पैरासिटामोल (Paracetamol)', dosage: '500mg - 1 गोली', instructions: 'खाने के बाद' },
            ],
            night: [],
        },
    },
    tamil: {
        medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily (morning & night)', duration: 'Ongoing', instructions: 'Take after food', needs_verification: false },
            { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (night)', duration: 'Ongoing', instructions: 'Take before sleep', needs_verification: false },
            { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily (morning)', duration: 'Ongoing', instructions: 'Take before breakfast on empty stomach', needs_verification: false },
        ],
        precautions: ['Low salt diet', 'Exercise daily for 30 minutes', 'Monitor blood sugar regularly', 'Avoid sugary foods'],
        diagnosis: 'Type 2 Diabetes with mild hypertension',
        follow_up: 'Review after 1 month with blood reports',
        summary: '🏥 உங்கள் மருந்து தகவல்:\n\nஉங்களுக்கு டைப் 2 நீரிழிவு மற்றும் லேசான உயர் இரத்த அழுத்தம் உள்ளது.\n\n💊 மருந்துகள்:\n1. மெட்ஃபார்மின் 500mg - தினமும் 2 முறை, உணவுக்குப் பிறகு\n2. அம்லோடிபின் 5mg - தினமும் 1 முறை, இரவில் தூங்கும் முன்\n3. ஓமிப்ரசோல் 20mg - தினமும் 1 முறை, காலை வெறும் வயிற்றில்\n\n⚠️ கவனிக்க வேண்டியவை:\n• குறைந்த உப்பு உணவு\n• தினமும் 30 நிமிடம் உடற்பயிற்சி\n• இரத்த சர்க்கரையை தொடர்ந்து கண்காணிக்கவும்\n\n📅 1 மாதம் கழித்து இரத்த பரிசோதனை அறிக்கையுடன் வரவும்',
        whatsapp: '🏥 *மருத்துவர் அறிவுறுத்தல்*\n\n💊 *மருந்துகள்:*\n\n🌅 *காலை:*\n• மெட்ஃபார்மின் 500mg - உணவுக்குப் பிறகு\n• ஓமிப்ரசோல் 20mg - வெறும் வயிற்றில்\n\n🌙 *இரவு:*\n• மெட்ஃபார்மின் 500mg - உணவுக்குப் பிறகு\n• அம்லோடிபின் 5mg - தூங்கும் முன்\n\n⚠️ *கவனிக்கவும்:*\n• குறைந்த உப்பு உணவு\n• தினமும் உடற்பயிற்சி\n\n📅 1 மாதம் கழித்து வரவும்',
        schedule: {
            morning: [
                { medicine: 'மெட்ஃபார்மின் (Metformin)', dosage: '500mg', instructions: 'உணவுக்குப் பிறகு' },
                { medicine: 'ஓமிப்ரசோல் (Omeprazole)', dosage: '20mg', instructions: 'வெறும் வயிற்றில்' },
            ],
            afternoon: [],
            evening: [],
            night: [
                { medicine: 'மெட்ஃபார்மின் (Metformin)', dosage: '500mg', instructions: 'உணவுக்குப் பிறகு' },
                { medicine: 'அம்லோடிபின் (Amlodipine)', dosage: '5mg', instructions: 'தூங்கும் முன்' },
            ],
        },
    },
    telugu: {
        medications: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take with food', needs_verification: false },
            { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after food', needs_verification: false },
        ],
        precautions: ['Complete the full antibiotic course', 'Stay hydrated', 'Rest adequately', 'Avoid strenuous activity'],
        diagnosis: 'Bacterial infection with inflammation',
        follow_up: 'Review after 7 days',
        summary: '🏥 మీ మందుల సమాచారం:\n\nమీకు బ్యాక్టీరియల్ ఇన్ఫెక్షన్ మరియు వాపు ఉంది.\n\n💊 మందులు:\n1. అమోక్సిసిల్లిన్ 500mg - రోజుకు 3 సార్లు, భోజనంతో (7 రోజులు)\n2. ఐబుప్రోఫెన్ 400mg - రోజుకు 2 సార్లు, భోజనం తర్వాత (5 రోజులు)\n\n⚠️ జాగ్రత్తలు:\n• యాంటీబయాటిక్ కోర్సు పూర్తి చేయండి\n• ఎక్కువ నీరు తాగండి\n• తగినంత విశ్రాంతి తీసుకోండి\n\n📅 7 రోజుల తర్వాత తిరిగి రండి',
        whatsapp: '🏥 *డాక్టర్ సలహా*\n\n💊 *మందులు:*\n\n🌅 *ఉదయం:*\n• అమోక్సిసిల్లిన్ 500mg - భోజనంతో\n• ఐబుప్రోఫెన్ 400mg - భోజనం తర్వాత\n\n🌞 *మధ్యాహ్నం:*\n• అమోక్సిసిల్లిన్ 500mg - భోజనంతో\n\n🌇 *సాయంత్రం:*\n• అమోక్సిసిల్లిన్ 500mg - భోజనంతో\n• ఐబుప్రోఫెన్ 400mg - భోజనం తర్వాత\n\n📅 7 రోజుల తర్వాత రండి',
        schedule: {
            morning: [
                { medicine: 'అమోక్సిసిల్లిన్ (Amoxicillin)', dosage: '500mg', instructions: 'భోజనంతో' },
                { medicine: 'ఐబుప్రోఫెన్ (Ibuprofen)', dosage: '400mg', instructions: 'భోజనం తర్వాత' },
            ],
            afternoon: [
                { medicine: 'అమోక్సిసిల్లిన్ (Amoxicillin)', dosage: '500mg', instructions: 'భోజనంతో' },
            ],
            evening: [
                { medicine: 'అమోక్సిసిల్లిన్ (Amoxicillin)', dosage: '500mg', instructions: 'భోజనంతో' },
                { medicine: 'ఐబుప్రోఫెన్ (Ibuprofen)', dosage: '400mg', instructions: 'భోజనం తర్వాత' },
            ],
            night: [],
        },
    },
    bengali: {
        medications: [
            { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '10 days', instructions: 'Take at night before sleep', needs_verification: false },
            { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily', duration: '14 days', instructions: 'Take at night', needs_verification: false },
            { name: 'Salbutamol Inhaler', dosage: '2 puffs', frequency: 'As needed', duration: '1 month', instructions: 'Use during breathing difficulty', needs_verification: false },
        ],
        precautions: ['Avoid dust and smoke', 'Keep inhaler handy', 'Avoid cold air exposure', 'Follow up if symptoms worsen'],
        diagnosis: 'Allergic rhinitis with mild asthma',
        follow_up: 'Review after 2 weeks',
        summary: '🏥 আপনার ওষুধের তথ্য:\n\nআপনার অ্যালার্জিক রাইনাইটিস এবং হালকা হাঁপানি আছে।\n\n💊 ওষুধ:\n1. সেটিরিজিন 10mg - দিনে 1 বার, রাতে ঘুমানোর আগে (10 দিন)\n2. মন্টেলুকাস্ট 10mg - দিনে 1 বার, রাতে (14 দিন)\n3. সালবিউটামল ইনহেলার - 2 পাফ, শ্বাসকষ্ট হলে\n\n⚠️ সাবধানতা:\n• ধুলো এবং ধোঁয়া এড়িয়ে চলুন\n• ইনহেলার কাছে রাখুন\n• ঠান্ডা বাতাস এড়িয়ে চলুন\n\n📅 2 সপ্তাহ পর আবার আসুন',
        whatsapp: '🏥 *ডাক্তারের পরামর্শ*\n\n💊 *ওষুধ:*\n\n🌙 *রাতে:*\n• সেটিরিজিন 10mg - ঘুমানোর আগে\n• মন্টেলুকাস্ট 10mg\n\n🆘 *প্রয়োজনমতো:*\n• সালবিউটামল ইনহেলার - 2 পাফ\n\n⚠️ *সাবধানতা:*\n• ধুলো ও ধোঁয়া এড়ান\n• ইনহেলার কাছে রাখুন\n\n📅 2 সপ্তাহ পর আসুন',
        schedule: {
            morning: [],
            afternoon: [],
            evening: [],
            night: [
                { medicine: 'সেটিরিজিন (Cetirizine)', dosage: '10mg', instructions: 'ঘুমানোর আগে' },
                { medicine: 'মন্টেলুকাস্ট (Montelukast)', dosage: '10mg', instructions: 'রাতে' },
            ],
        },
    },
    marathi: {
        medications: [
            { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', duration: '14 days', instructions: 'Take before breakfast', needs_verification: false },
            { name: 'Domperidone', dosage: '10mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take 15 min before meals', needs_verification: false },
        ],
        precautions: ['Avoid oily and spicy food', 'Eat small frequent meals', 'Do not lie down immediately after eating', 'Avoid tea/coffee on empty stomach'],
        diagnosis: 'Acid reflux (GERD)',
        follow_up: 'Review after 2 weeks',
        summary: '🏥 तुमच्या औषधांची माहिती:\n\nतुम्हाला ॲसिड रिफ्लक्स (GERD) आहे.\n\n💊 औषधे:\n1. पँटोप्राझोल 40mg - दिवसातून 1 वेळा, नाश्त्यापूर्वी (14 दिवस)\n2. डोम्पेरिडोन 10mg - दिवसातून 3 वेळा, जेवणापूर्वी 15 मिनिटे (7 दिवस)\n\n⚠️ काळजी:\n• तेलकट आणि मसालेदार अन्न टाळा\n• कमी प्रमाणात वारंवार खा\n• खाल्ल्यानंतर लगेच आडवे होऊ नका\n\n📅 2 आठवड्यांनंतर पुन्हा या',
        whatsapp: '🏥 *डॉक्टरांचा सल्ला*\n\n💊 *औषधे:*\n\n🌅 *सकाळी:*\n• पँटोप्राझोल 40mg - नाश्त्यापूर्वी\n• डोम्पेरिडोन 10mg - जेवणापूर्वी\n\n🌞 *दुपारी:*\n• डोम्पेरिडोन 10mg - जेवणापूर्वी\n\n🌇 *संध्याकाळी:*\n• डोम्पेरिडोन 10mg - जेवणापूर्वी\n\n📅 2 आठवड्यांनंतर या',
        schedule: {
            morning: [
                { medicine: 'पँटोप्राझोल (Pantoprazole)', dosage: '40mg', instructions: 'नाश्त्यापूर्वी' },
                { medicine: 'डोम्पेरिडोन (Domperidone)', dosage: '10mg', instructions: 'जेवणापूर्वी 15 मिनिटे' },
            ],
            afternoon: [
                { medicine: 'डोम्पेरिडोन (Domperidone)', dosage: '10mg', instructions: 'जेवणापूर्वी 15 मिनिटे' },
            ],
            evening: [
                { medicine: 'डोम्पेरिडोन (Domperidone)', dosage: '10mg', instructions: 'जेवणापूर्वी 15 मिनिटे' },
            ],
            night: [],
        },
    },
    gujarati: {
        medications: [
            { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take at night', needs_verification: false },
            { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take after lunch', needs_verification: false },
            { name: 'Ramipril', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take in the morning', needs_verification: false },
        ],
        precautions: ['Regular exercise', 'Low fat diet', 'No smoking', 'Monitor blood pressure daily', 'Annual heart checkup'],
        diagnosis: 'Cardiovascular risk management - Post-MI follow-up',
        follow_up: 'Review after 3 months with lipid profile',
        summary: '🏥 તમારી દવાની માહિતી:\n\nહૃદય રોગ નિવારણ માટે દવાઓ.\n\n💊 દવાઓ:\n1. એટોર્વાસ્ટેટિન 10mg - દિવસમાં 1 વખત, રાત્રે\n2. એસ્પિરિન 75mg - દિવસમાં 1 વખત, બપોરના ભોજન પછી\n3. રામિપ્રિલ 5mg - દિવસમાં 1 વખત, સવારે\n\n⚠️ સાવચેતી:\n• નિયમિત વ્યાયામ કરો\n• ઓછી ચરબીવાળો ખોરાક\n• ધૂમ્રપાન ન કરો\n• બ્લડ પ્રેશર રોજ તપાસો\n\n📅 3 મહિના પછી લિપિડ પ્રોફાઈલ સાથે આવો',
        whatsapp: '🏥 *ડૉક્ટરની સલાહ*\n\n💊 *દવાઓ:*\n\n🌅 *સવારે:*\n• રામિપ્રિલ 5mg\n\n🌞 *બપોરે:*\n• એસ્પિરિન 75mg - ભોજન પછી\n\n🌙 *રાત્રે:*\n• એટોર્વાસ્ટેટિન 10mg\n\n⚠️ *સાવચેતી:*\n• નિયમિત વ્યાયામ\n• ઓછી ચરબીવાળો ખોરાક\n• ધૂમ્રપાન ન કરો\n\n📅 3 મહિના પછી આવો',
        schedule: {
            morning: [
                { medicine: 'રામિપ્રિલ (Ramipril)', dosage: '5mg', instructions: 'સવારે' },
            ],
            afternoon: [
                { medicine: 'એસ્પિરિન (Aspirin)', dosage: '75mg', instructions: 'ભોજન પછી' },
            ],
            evening: [],
            night: [
                { medicine: 'એટોર્વાસ્ટેટિન (Atorvastatin)', dosage: '10mg', instructions: 'રાત્રે' },
            ],
        },
    },
};

// Original doctor notes to simulate per language
const ORIGINAL_TEXTS = {
    hindi: 'Patient has mild fever and throat infection. Prescribing Paracetamol 500mg twice daily for 3 days. Azithromycin 500mg once daily for 5 days. Advise warm water gargling. Avoid cold drinks and spicy food. Follow-up after 5 days.',
    tamil: 'Tab Metformin 500mg 1-0-1\nTab Amlodipine 5mg 0-0-1\nCap Omeprazole 20mg 1-0-0\nAdv: Low salt diet, Exercise daily\nReview after 1 month',
    telugu: 'Bacterial infection with inflammation noted. Rx: Amoxicillin 500mg TID x 7 days. Ibuprofen 400mg BD x 5 days. Adv rest, hydration. Review in 1 week.',
    bengali: 'Allergic rhinitis with mild asthma. Tab Cetirizine 10mg HS x 10 days. Tab Montelukast 10mg HS x 14 days. Salbutamol inhaler 2 puffs SOS. Avoid dust/smoke.',
    marathi: 'GERD - Acid reflux. Tab Pantoprazole 40mg OD AC x 14 days. Tab Domperidone 10mg TID AC x 7 days. Avoid oily/spicy food. Small frequent meals.',
    gujarati: 'Post-MI follow-up. Tab Atorvastatin 10mg HS. Tab Aspirin 75mg OD after lunch. Tab Ramipril 5mg OD morning. Low fat diet, regular exercise, no smoking. Review 3 months with lipid profile.',
};

// ── In-Memory Store ──

const STORAGE_KEY = 'healthcare_consultations';

function loadStore() {
    try {
        const data = sessionStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch (e) { /* ignore */ }
    return null;
}

function saveStore(store) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getStore() {
    let store = loadStore();
    if (!store) {
        store = initializeMockData();
        saveStore(store);
    }
    return store;
}

function initializeMockData() {
    const now = Date.now();
    return {
        consultations: {
            'demo-001': createFullConsultation('demo-001', {
                patient_name: 'Ramesh Kumar', patient_phone: '+91 98765 43210',
                input_type: 'voice', language: 'hindi', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'delivered',
                created_at: new Date(now - 7200000).toISOString(),
                delivered_at: new Date(now - 6600000).toISOString(),
            }),
            'demo-002': createFullConsultation('demo-002', {
                patient_name: 'Lakshmi Devi', patient_phone: '+91 87654 32109',
                input_type: 'image', language: 'tamil', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'pending_review',
                created_at: new Date(now - 3600000).toISOString(),
            }),
            'demo-003': createFullConsultation('demo-003', {
                patient_name: 'Suresh Patel', patient_phone: '+91 76543 21098',
                input_type: 'voice', language: 'gujarati', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'pending_review',
                created_at: new Date(now - 1800000).toISOString(),
            }),
            'demo-004': createFullConsultation('demo-004', {
                patient_name: 'Anita Roy', patient_phone: '+91 65432 10987',
                input_type: 'image', language: 'bengali', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'delivered',
                created_at: new Date(now - 14400000).toISOString(),
                delivered_at: new Date(now - 13800000).toISOString(),
            }),
            'demo-005': createFullConsultation('demo-005', {
                patient_name: 'Priya Deshmukh', patient_phone: '+91 54321 09876',
                input_type: 'voice', language: 'marathi', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'approved',
                created_at: new Date(now - 900000).toISOString(),
            }),
            'demo-006': createFullConsultation('demo-006', {
                patient_name: 'Ravi Reddy', patient_phone: '+91 43210 98765',
                input_type: 'image', language: 'telugu', doctor_id: 'demo-doctor',
                doctor_name: 'Dr. Sharma', status: 'processing',
                created_at: new Date(now - 300000).toISOString(),
            }),
        },
    };
}

function createFullConsultation(id, overrides) {
    const lang = overrides.language || 'hindi';
    const mockData = MOCK_EXTRACTIONS[lang] || MOCK_EXTRACTIONS.hindi;
    const isProcessing = overrides.status === 'processing';

    return {
        consultation_id: id,
        doctor_id: overrides.doctor_id || 'demo-doctor',
        doctor_name: overrides.doctor_name || 'Dr. Demo',
        patient_name: overrides.patient_name || 'Unknown Patient',
        patient_phone: overrides.patient_phone || '+91 00000 00000',
        input_type: overrides.input_type || 'voice',
        language: lang,
        status: overrides.status || 'processing',
        created_at: overrides.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        delivered_at: overrides.delivered_at || '',

        // These are filled in when not processing
        original_text: isProcessing ? '' : (ORIGINAL_TEXTS[lang] || ORIGINAL_TEXTS.hindi),
        extracted_medications: isProcessing ? [] : mockData.medications,
        dosage_schedule: isProcessing ? {} : mockData.schedule,
        precautions: isProcessing ? [] : mockData.precautions,
        precautions_translated: isProcessing ? [] : mockData.precautions,
        diagnosis: isProcessing ? '' : mockData.diagnosis,
        follow_up: isProcessing ? '' : mockData.follow_up,
        translated_summary: isProcessing ? '' : mockData.summary,
        whatsapp_message: isProcessing ? '' : mockData.whatsapp,
        audio_s3_url: '',
        language_used: lang,
    };
}


// ── Public API (mirrors api/client.js interface) ──

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function submitConsultation({ inputType, language, patientPhone, patientName, doctorId, doctorName }) {
    await delay(800); // Simulate network
    const id = `cons-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const store = getStore();

    const consultation = createFullConsultation(id, {
        patient_name: patientName,
        patient_phone: patientPhone,
        input_type: inputType,
        language,
        doctor_id: doctorId || 'demo-doctor',
        doctor_name: doctorName || 'Dr. Demo',
        status: 'processing',
        created_at: new Date().toISOString(),
    });

    store.consultations[id] = consultation;
    saveStore(store);

    // Simulate the processing pipeline (runs in background)
    simulateProcessingPipeline(id);

    return { consultation_id: id, status: 'processing', message: 'Consultation created successfully' };
}

async function simulateProcessingPipeline(id) {
    const stages = [
        { status: 'transcribing', delay: 2000 },
        { status: 'text_extracted', delay: 2000 },
        { status: 'info_extracted', delay: 3000 },
        { status: 'content_generated', delay: 2000 },
        { status: 'pending_review', delay: 1000 },
    ];

    for (const stage of stages) {
        await delay(stage.delay);
        const store = getStore();
        const c = store.consultations[id];
        if (!c) return;

        c.status = stage.status;

        // Fill in data at appropriate stages
        const lang = c.language;
        const mockData = MOCK_EXTRACTIONS[lang] || MOCK_EXTRACTIONS.hindi;

        if (stage.status === 'text_extracted') {
            c.original_text = ORIGINAL_TEXTS[lang] || ORIGINAL_TEXTS.hindi;
        }
        if (stage.status === 'info_extracted') {
            c.extracted_medications = mockData.medications;
            c.precautions = mockData.precautions;
            c.diagnosis = mockData.diagnosis;
            c.follow_up = mockData.follow_up;
        }
        if (stage.status === 'content_generated') {
            c.translated_summary = mockData.summary;
            c.whatsapp_message = mockData.whatsapp;
            c.dosage_schedule = mockData.schedule;
            c.precautions_translated = mockData.precautions;
        }

        c.updated_at = new Date().toISOString();
        saveStore(store);
    }
}

export async function getConsultation(consultationId) {
    await delay(300);
    const store = getStore();
    const c = store.consultations[consultationId];
    if (!c) throw new Error('Consultation not found');
    return { consultation: c };
}

export async function listConsultations(doctorId) {
    await delay(300);
    const store = getStore();
    const all = Object.values(store.consultations)
        .filter(c => !doctorId || c.doctor_id === doctorId || doctorId === 'demo-doctor')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { consultations: all, count: all.length };
}

export async function getReview(consultationId) {
    await delay(300);
    const store = getStore();
    const c = store.consultations[consultationId];
    if (!c) throw new Error('Consultation not found');
    return c;
}

export async function updateReview(consultationId, updates) {
    await delay(500);
    const store = getStore();
    const c = store.consultations[consultationId];
    if (!c) throw new Error('Consultation not found');

    const allowed = ['translated_summary', 'dosage_schedule', 'precautions', 'extracted_medications', 'whatsapp_message', 'doctor_review_notes'];
    for (const key of allowed) {
        if (updates[key] !== undefined) c[key] = updates[key];
    }
    c.status = 'reviewed';
    c.updated_at = new Date().toISOString();
    saveStore(store);

    return { consultation_id: consultationId, message: 'Updated', updated_fields: Object.keys(updates) };
}

export async function approveConsultation(consultationId, notes = '') {
    await delay(600);
    const store = getStore();
    const c = store.consultations[consultationId];
    if (!c) throw new Error('Consultation not found');

    c.status = 'approved';
    c.doctor_review_notes = notes || 'Approved by doctor';
    c.updated_at = new Date().toISOString();
    saveStore(store);

    // Simulate delivery after 2 seconds
    setTimeout(() => {
        const s = getStore();
        const cn = s.consultations[consultationId];
        if (cn) {
            cn.status = 'delivered';
            cn.delivered_at = new Date().toISOString();
            saveStore(s);
        }
    }, 2000);

    return { consultation_id: consultationId, status: 'approved', message: 'Approved. Delivery in progress.' };
}
