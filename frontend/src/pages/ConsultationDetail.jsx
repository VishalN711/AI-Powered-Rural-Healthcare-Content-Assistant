import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import DosageChart from '../components/DosageChart';
import { getConsultation } from '../api/mockBackend';

export default function ConsultationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const result = await getConsultation(id);
            setConsultation(result.consultation);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
        // Auto-refresh to show processing progress
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div className="spinner">
                    <span className="spinner__circle" />
                    Loading consultation...
                </div>
            </div>
        );
    }

    if (error || !consultation) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">❓</div>
                <div className="empty-state__text">{error || 'Consultation not found'}</div>
                <button className="btn btn--primary" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    const formatDate = (iso) => {
        if (!iso) return 'N/A';
        return new Date(iso).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const isProcessing = ['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated'].includes(consultation.status);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button className="btn btn--secondary" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="page-header__title" style={{ marginBottom: 0 }}>
                        {consultation.patient_name}
                    </h1>
                    <p className="page-header__desc">
                        {consultation.patient_phone} · {formatDate(consultation.created_at)}
                    </p>
                </div>
                <StatusBadge status={consultation.status} />
            </div>

            {/* Info Row */}
            <div className="stats-row" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        {consultation.input_type === 'voice' ? '🎙️' : '📸'}
                    </div>
                    <div>
                        <div className="stat-card__value" style={{ fontSize: '1rem' }}>
                            {consultation.input_type === 'voice' ? 'Voice Recording' : 'Prescription Image'}
                        </div>
                        <div className="stat-card__label">Input Type</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        🌐
                    </div>
                    <div>
                        <div className="stat-card__value" style={{ fontSize: '1rem', textTransform: 'capitalize' }}>
                            {consultation.language}
                        </div>
                        <div className="stat-card__label">Language</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        💊
                    </div>
                    <div>
                        <div className="stat-card__value" style={{ fontSize: '1rem' }}>
                            {consultation.extracted_medications?.length || 0}
                        </div>
                        <div className="stat-card__label">Medications</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        📅
                    </div>
                    <div>
                        <div className="stat-card__value" style={{ fontSize: '0.85rem' }}>
                            {consultation.delivered_at ? formatDate(consultation.delivered_at) : 'Pending'}
                        </div>
                        <div className="stat-card__label">Delivered At</div>
                    </div>
                </div>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: 'var(--space-md)' }}>
                        <span className="spinner__circle" />
                        Processing in progress...
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        {['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated', 'pending_review'].map((stage, idx) => {
                            const stageLabels = {
                                processing: 'Queued', transcribing: 'Transcribing', text_extracted: 'OCR Done',
                                info_extracted: 'AI Analysis', content_generated: 'Content Ready', pending_review: 'Ready for Review'
                            };
                            const currentIdx = ['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated', 'pending_review'].indexOf(consultation.status);
                            const isComplete = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                                <span key={stage} style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    background: isComplete ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: isComplete ? '#34d399' : isCurrent ? '#60a5fa' : 'var(--text-muted)',
                                    border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : isCurrent ? 'rgba(59,130,246,0.3)' : 'var(--border-color)'}`,
                                }}>
                                    {isComplete ? '✓ ' : isCurrent ? '● ' : ''}{stageLabels[stage]}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="two-col">
                <div>
                    {/* Original Text */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="card__header">
                            <h3 className="card__title">📝 Original Text</h3>
                        </div>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            lineHeight: 1.7,
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {consultation.original_text || (
                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    ⏳ Waiting for text extraction...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="card__header">
                            <h3 className="card__title">💊 Extracted Medications</h3>
                        </div>
                        {(consultation.extracted_medications || []).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {consultation.extracted_medications.map((med, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-secondary)',
                                        padding: 'var(--space-md)',
                                        borderRadius: 'var(--radius-sm)',
                                        borderLeft: '3px solid var(--color-primary-500)'
                                    }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-primary-400)' }}>
                                            {med.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {med.dosage} · {med.frequency} · {med.duration}
                                        </div>
                                        {med.instructions && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                📋 {med.instructions}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                ⏳ Waiting for AI analysis...
                            </div>
                        )}
                    </div>

                    {/* Precautions */}
                    {consultation.precautions?.length > 0 && (
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="card__header">
                                <h3 className="card__title">⚠️ Precautions</h3>
                            </div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {consultation.precautions.map((p, idx) => (
                                    <li key={idx} style={{
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        border: '1px solid rgba(245, 158, 11, 0.15)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        ⚠️ {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div>
                    {/* Translated Summary */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="card__header">
                            <h3 className="card__title">🌐 Translated Summary ({consultation.language})</h3>
                        </div>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: 'var(--space-lg)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.95rem',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {consultation.translated_summary || (
                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    ⏳ Waiting for content generation...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Dosage Chart */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="card__header">
                            <h3 className="card__title">📅 Dosage Schedule</h3>
                        </div>
                        <DosageChart schedule={consultation.dosage_schedule} />
                    </div>

                    {/* Actions */}
                    {(consultation.status === 'pending_review' || consultation.status === 'reviewed') && (
                        <button
                            className="btn btn--accent btn--lg"
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/review/${id}`)}
                        >
                            ✏️ Review & Approve
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
