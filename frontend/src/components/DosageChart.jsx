const TIME_SLOTS = [
    { key: 'morning', label: '🌅 Morning', time: '6:00 - 11:00 AM' },
    { key: 'afternoon', label: '☀️ Afternoon', time: '12:00 - 4:00 PM' },
    { key: 'evening', label: '🌇 Evening', time: '5:00 - 8:00 PM' },
    { key: 'night', label: '🌙 Night', time: '9:00 PM - 5:00 AM' },
];

export default function DosageChart({ schedule }) {
    if (!schedule || Object.keys(schedule).length === 0) {
        return (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💊</div>
                <div style={{ fontSize: '0.85rem' }}>No dosage schedule available yet</div>
            </div>
        );
    }

    return (
        <div className="dosage-chart">
            {TIME_SLOTS.map((slot) => {
                const meds = schedule[slot.key] || [];
                return (
                    <div key={slot.key} className="dosage-slot">
                        <div className="dosage-slot__title">
                            {slot.label}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                {slot.time}
                            </span>
                        </div>
                        {meds.length > 0 ? (
                            meds.map((med, idx) => (
                                <div key={idx} className="dosage-slot__item">
                                    <div className="dosage-slot__med">
                                        💊 {med.medicine || med.name || 'Medication'}
                                    </div>
                                    <div className="dosage-slot__dose">
                                        {med.dosage} {med.instructions ? `· ${med.instructions}` : ''}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                                No medication
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
