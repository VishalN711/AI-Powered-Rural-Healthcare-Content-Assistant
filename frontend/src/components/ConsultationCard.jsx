import StatusBadge from './StatusBadge';

export default function ConsultationCard({ consultation, onClick }) {
    const {
        consultation_id,
        patient_name,
        patient_phone,
        input_type,
        language,
        status,
        created_at,
    } = consultation;

    const timeAgo = (isoDate) => {
        if (!isoDate) return '';
        const diff = Date.now() - new Date(isoDate).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="consultation-item fade-in" onClick={() => onClick?.(consultation_id)}>
            <div className={`consultation-item__icon consultation-item__icon--${input_type}`}>
                {input_type === 'voice' ? '🎙️' : '📸'}
            </div>
            <div className="consultation-item__info">
                <div className="consultation-item__patient">
                    {patient_name || 'Unknown Patient'}
                </div>
                <div className="consultation-item__meta">
                    {patient_phone} · {language} · {timeAgo(created_at)}
                </div>
            </div>
            <StatusBadge status={status} />
        </div>
    );
}
