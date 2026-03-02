import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewPanel from '../components/ReviewPanel';
import StatusBadge from '../components/StatusBadge';
import { getReview, updateReview, approveConsultation } from '../api/mockBackend';

export default function ReviewApprove() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [approved, setApproved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await getReview(id);
                setConsultation(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleSave = async (updates) => {
        setSaving(true);
        try {
            await updateReview(id, updates);
            // Refresh data after save
            const updated = await getReview(id);
            setConsultation(updated);
        } catch (err) {
            console.error('Save failed:', err);
        }
        setSaving(false);
    };

    const handleApprove = async (notes) => {
        setSaving(true);
        try {
            await approveConsultation(id, notes);
            setApproved(true);
        } catch (err) {
            console.error('Approve failed:', err);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div className="spinner">
                    <span className="spinner__circle" />
                    Loading review...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="empty-state">
                <div className="empty-state__icon">❌</div>
                <div className="empty-state__text">{error}</div>
                <button className="btn btn--primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
            </div>
        );
    }

    if (approved) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>📨</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
                    Approved & Sent!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: '450px', margin: '0 auto var(--space-xl)' }}>
                    The patient-friendly instructions are being delivered to{' '}
                    <strong>{consultation?.patient_name}</strong> via WhatsApp/SMS.
                    The status will automatically update to "Delivered" within a few seconds.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <button className="btn btn--primary btn--lg" onClick={() => navigate('/')}>
                        📊 Back to Dashboard
                    </button>
                    <button className="btn btn--secondary btn--lg" onClick={() => navigate(`/consultation/${id}`)}>
                        🔍 View Details
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button className="btn btn--secondary" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="page-header__title" style={{ marginBottom: 0 }}>
                        Review: {consultation?.patient_name}
                    </h1>
                    <p className="page-header__desc">
                        Review and approve generated content before delivery to patient
                    </p>
                </div>
                <StatusBadge status={consultation?.status} />
            </div>

            <ReviewPanel
                consultation={consultation}
                onSave={handleSave}
                onApprove={handleApprove}
                loading={saving}
            />
        </div>
    );
}
