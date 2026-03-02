import { useState } from 'react';

export default function ReviewPanel({ consultation, onSave, onApprove, loading }) {
    const [editedSummary, setEditedSummary] = useState(consultation?.translated_summary || '');
    const [editedMessage, setEditedMessage] = useState(consultation?.whatsapp_message || '');
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        onSave?.({
            translated_summary: editedSummary,
            whatsapp_message: editedMessage,
            doctor_review_notes: notes,
        });
    };

    const handleApprove = () => {
        onApprove?.(notes || 'Approved by doctor');
    };

    return (
        <div className="fade-in">
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
                    {consultation?.original_text || 'N/A'}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card__header">
                    <h3 className="card__title">💊 Extracted Medications</h3>
                </div>
                {(consultation?.extracted_medications || []).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {consultation.extracted_medications.map((med, idx) => (
                            <div key={idx} style={{
                                background: 'var(--bg-secondary)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: '3px solid var(--color-primary-500)'
                            }}>
                                <div style={{ fontWeight: 600, color: 'var(--color-primary-400)', marginBottom: '0.25rem' }}>
                                    {med.name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {med.dosage} · {med.frequency} · {med.duration}
                                </div>
                                {med.instructions && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        📋 {med.instructions}
                                    </div>
                                )}
                                {med.needs_verification && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', marginTop: '0.25rem' }}>
                                        ⚠️ Needs verification
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No medications extracted yet
                    </div>
                )}
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card__header">
                    <h3 className="card__title">🌐 Translated Summary (Editable)</h3>
                </div>
                <textarea
                    className="form-textarea"
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={6}
                    disabled={loading}
                />
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card__header">
                    <h3 className="card__title">📱 WhatsApp Message (Editable)</h3>
                </div>
                <textarea
                    className="form-textarea"
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    rows={8}
                    disabled={loading}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
            </div>

            {consultation?.audio_s3_url && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div className="card__header">
                        <h3 className="card__title">🔊 Audio Instructions</h3>
                    </div>
                    <audio controls src={consultation.audio_s3_url} style={{ width: '100%' }} />
                </div>
            )}

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card__header">
                    <h3 className="card__title">📋 Doctor's Notes</h3>
                </div>
                <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes or corrections..."
                    rows={3}
                    disabled={loading}
                />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button className="btn btn--secondary btn--lg" onClick={handleSave} disabled={loading}>
                    💾 Save Changes
                </button>
                <button className="btn btn--accent btn--lg" onClick={handleApprove} disabled={loading}>
                    ✅ Approve & Send to Patient
                </button>
            </div>
        </div>
    );
}
