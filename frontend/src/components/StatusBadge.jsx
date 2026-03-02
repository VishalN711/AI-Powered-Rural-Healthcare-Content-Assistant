const STATUS_MAP = {
    processing: { label: 'Processing', className: 'badge--processing', icon: '⚙️' },
    transcribing: { label: 'Transcribing', className: 'badge--processing', icon: '🎤' },
    text_extracted: { label: 'Text Extracted', className: 'badge--processing', icon: '📝' },
    info_extracted: { label: 'Analyzing', className: 'badge--processing', icon: '🔬' },
    content_generated: { label: 'Content Ready', className: 'badge--processing', icon: '📄' },
    pending_review: { label: 'Pending Review', className: 'badge--pending', icon: '👨‍⚕️' },
    reviewed: { label: 'Reviewed', className: 'badge--pending', icon: '✏️' },
    approved: { label: 'Approved', className: 'badge--approved', icon: '✅' },
    delivered: { label: 'Delivered', className: 'badge--delivered', icon: '📨' },
    failed: { label: 'Failed', className: 'badge--failed', icon: '❌' },
    delivery_failed: { label: 'Delivery Failed', className: 'badge--failed', icon: '⚠️' },
};

export default function StatusBadge({ status }) {
    const config = STATUS_MAP[status] || { label: status, className: 'badge--processing', icon: '❓' };

    const isAnimated = ['processing', 'transcribing', 'text_extracted', 'info_extracted', 'content_generated'].includes(status);

    return (
        <span className={`badge ${config.className}`}>
            {isAnimated && <span className="badge__dot" />}
            {config.icon} {config.label}
        </span>
    );
}
