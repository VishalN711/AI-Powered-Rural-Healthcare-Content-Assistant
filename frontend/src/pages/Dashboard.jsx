import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultationCard from '../components/ConsultationCard';
import { listConsultations } from '../api/mockBackend';

export default function Dashboard() {
    const navigate = useNavigate();
    const [consultations, setConsultations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchConsultations = useCallback(async () => {
        try {
            const result = await listConsultations('demo-doctor');
            setConsultations(result.consultations);
        } catch (err) {
            console.error('Failed to fetch consultations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConsultations();
        // Auto-refresh every 3 seconds to show pipeline progress
        const interval = setInterval(fetchConsultations, 3000);
        return () => clearInterval(interval);
    }, [fetchConsultations]);

    const stats = {
        total: consultations.length,
        processing: consultations.filter(c =>
            ['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated'].includes(c.status)
        ).length,
        pending: consultations.filter(c => c.status === 'pending_review').length,
        delivered: consultations.filter(c => c.status === 'delivered').length,
    };

    const filteredConsultations = filter === 'all'
        ? consultations
        : consultations.filter(c => {
            if (filter === 'processing') return ['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated'].includes(c.status);
            if (filter === 'review') return ['pending_review', 'reviewed'].includes(c.status);
            if (filter === 'delivered') return c.status === 'delivered';
            return true;
        });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                <div className="spinner">
                    <span className="spinner__circle" />
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-header__title">Doctor Dashboard</h1>
                <p className="page-header__desc">
                    Manage consultations, review generated content, and track delivery status
                </p>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        📋
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.total}</div>
                        <div className="stat-card__label">Total Consultations</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        ⚙️
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.processing}</div>
                        <div className="stat-card__label">Processing</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        👨‍⚕️
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.pending}</div>
                        <div className="stat-card__label">Pending Review</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        📨
                    </div>
                    <div>
                        <div className="stat-card__value">{stats.delivered}</div>
                        <div className="stat-card__label">Delivered</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="tabs">
                {[
                    { key: 'all', label: `All (${stats.total})` },
                    { key: 'processing', label: `Processing (${stats.processing})` },
                    { key: 'review', label: `Pending Review (${stats.pending})` },
                    { key: 'delivered', label: `Delivered (${stats.delivered})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`tab ${filter === tab.key ? 'tab--active' : ''}`}
                        onClick={() => setFilter(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Consultation List */}
            {filteredConsultations.length > 0 ? (
                <div className="consultation-list">
                    {filteredConsultations.map(c => (
                        <ConsultationCard
                            key={c.consultation_id}
                            consultation={c}
                            onClick={(id) => navigate(`/consultation/${id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state__icon">📭</div>
                    <div className="empty-state__text">
                        {filter === 'all' ? 'No consultations yet' : `No ${filter} consultations`}
                    </div>
                    <button className="btn btn--primary btn--lg" onClick={() => navigate('/new')}>
                        ➕ New Consultation
                    </button>
                </div>
            )}
        </div>
    );
}
