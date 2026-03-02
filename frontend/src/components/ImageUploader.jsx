import { useState, useRef, useCallback } from 'react';

export default function ImageUploader({ onImageSelected, disabled }) {
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const processFile = useCallback((file) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a JPEG, PNG, or PDF file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be under 10MB.');
            return;
        }

        setFileName(file.name);

        // Show preview for images
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            onImageSelected?.(base64, file.type);
        };
        reader.readAsDataURL(file);
    }, [onImageSelected]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    }, [processFile]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const clearImage = () => {
        setPreview(null);
        setFileName('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            <div
                className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={(e) => processFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    disabled={disabled}
                />

                {preview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                            src={preview}
                            alt="Prescription preview"
                            style={{
                                maxWidth: '280px',
                                maxHeight: '200px',
                                borderRadius: '0.5rem',
                                objectFit: 'contain',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            ✅ {fileName}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="upload-zone__icon">📄</div>
                        <div className="upload-zone__text">
                            Drag & drop prescription image here
                        </div>
                        <div className="upload-zone__hint">
                            or click to browse • JPEG, PNG, PDF up to 10MB
                        </div>
                    </>
                )}
            </div>

            {fileName && (
                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={clearImage}>
                        🗑️ Remove & Upload Different
                    </button>
                </div>
            )}
        </div>
    );
}
