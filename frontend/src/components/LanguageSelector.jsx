const LANGUAGES = [
    { code: 'hindi', label: 'Hindi (हिन्दी)', flag: '🇮🇳' },
    { code: 'tamil', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'telugu', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'bengali', label: 'Bengali (বাংলা)', flag: '🇮🇳' },
    { code: 'marathi', label: 'Marathi (मराठी)', flag: '🇮🇳' },
    { code: 'gujarati', label: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
];

export default function LanguageSelector({ value, onChange, disabled }) {
    return (
        <div className="form-group">
            <label className="form-label">Patient's Preferred Language</label>
            <select
                className="form-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export { LANGUAGES };
