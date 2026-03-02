import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import ImageUploader from '../components/ImageUploader';
import LanguageSelector from '../components/LanguageSelector';
import { submitConsultation } from '../api/mockBackend';

export default function NewConsultation() {
    const navigate = useNavigate();

    const [inputType, setInputType] = useState('voice');
    const [language, setLanguage] = useState('hindi');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [fileData, setFileData] = useState(null);
    const [fileContentType, setFileContentType] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState('');

    const handleFileReady = (base64, contentType) => {
        setFileData(base64);
        setFileContentType(contentType);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!patientName.trim()) {
            setError('Patient name is required');
            return;
        }
        if (!patientPhone.trim()) {
            setError('Patient phone number is required');
            return;
        }
        if (!fileData) {
            setError(`Please ${inputType === 'voice' ? 'record voice instructions' : 'upload a prescription image'}`);
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitConsultation({
                inputType,
                language,
                patientPhone,
                patientName,
                doctorId: 'demo-doctor',
                doctorName: 'Dr. Sharma',
                fileData,
                fileContentType,
            });

            setSuccessId(result.consultation_id);
        } catch (err) {
            setError(`Submission failed: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (successId) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>✅</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
                    Consultation Submitted!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', maxWidth: '500px', margin: '0 auto var(--space-xl)' }}>
                    The system is processing the {inputType === 'voice' ? 'voice recording' : 'prescription image'}.
                    You can track progress on the Dashboard — it will automatically move through:
                    <br /><br />
                    <span style={{ fontSize: '0.85rem' }}>
                        Processing → Transcribing → Text Extracted → Analyzing → Content Generated → Pending Review
                    </span>
                </p>
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    display: 'inline-block',
                    marginBottom: 'var(--space-xl)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        CONSULTATION ID
                    </div>
                    <code style={{ color: 'var(--color-primary-400)', fontSize: '0.9rem' }}>
                        {successId}
                    </code>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <button className="btn btn--primary btn--lg" onClick={() => navigate('/')}>
                        📊 Track on Dashboard
                    </button>
                    <button className="btn btn--secondary btn--lg" onClick={() => navigate(`/consultation/${successId}`)}>
                        🔍 View Details
                    </button>
                    <button className="btn btn--secondary btn--lg" onClick={() => {
                        setSuccessId('');
                        setFileData(null);
                        setPatientName('');
                        setPatientPhone('');
                    }}>
                        ➕ Another Consultation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-header__title">New Consultation</h1>
                <p className="page-header__desc">
                    Record voice instructions or upload a prescription image to generate multilingual patient content
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="two-col">
                    {/* Left Column — Input */}
                    <div>
                        {/* Input Type Selection */}
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="card__header">
                                <h3 className="card__title">Input Type</h3>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <button
                                    type="button"
                                    className={`btn ${inputType === 'voice' ? 'btn--primary' : 'btn--secondary'} btn--lg`}
                                    onClick={() => { setInputType('voice'); setFileData(null); }}
                                    style={{ flex: 1 }}
                                >
                                    🎙️ Voice Recording
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${inputType === 'image' ? 'btn--primary' : 'btn--secondary'} btn--lg`}
                                    onClick={() => { setInputType('image'); setFileData(null); }}
                                    style={{ flex: 1 }}
                                >
                                    📸 Prescription Image
                                </button>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="card__header">
                                <h3 className="card__title">
                                    {inputType === 'voice' ? '🎙️ Record Instructions' : '📄 Upload Prescription'}
                                </h3>
                            </div>
                            {inputType === 'voice' ? (
                                <VoiceRecorder onRecordingComplete={handleFileReady} disabled={submitting} />
                            ) : (
                                <ImageUploader onImageSelected={handleFileReady} disabled={submitting} />
                            )}
                        </div>
                    </div>

                    {/* Right Column — Patient Info */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="card__header">
                                <h3 className="card__title">👤 Patient Information</h3>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="patient-name">Patient Name</label>
                                <input
                                    id="patient-name"
                                    type="text"
                                    className="form-input"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    placeholder="Enter patient's full name"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="patient-phone">Phone Number (WhatsApp)</label>
                                <input
                                    id="patient-phone"
                                    type="tel"
                                    className="form-input"
                                    value={patientPhone}
                                    onChange={(e) => setPatientPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    disabled={submitting}
                                />
                            </div>

                            <LanguageSelector
                                value={language}
                                onChange={setLanguage}
                                disabled={submitting}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                padding: 'var(--space-md)',
                                color: '#f87171',
                                fontSize: '0.875rem',
                                marginBottom: 'var(--space-lg)'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn--primary btn--lg"
                            style={{ width: '100%' }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="spinner">
                                    <span className="spinner__circle" />
                                    Processing...
                                </span>
                            ) : (
                                '🚀 Submit Consultation'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
