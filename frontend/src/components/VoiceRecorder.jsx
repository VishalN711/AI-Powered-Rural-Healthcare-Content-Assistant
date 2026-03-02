import { useState, useRef, useCallback } from 'react';

export default function VoiceRecorder({ onRecordingComplete, disabled }) {
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const mediaRecorder = useRef(null);
    const timerInterval = useRef(null);
    const chunks = useRef([]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            chunks.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));

                // Convert to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    onRecordingComplete?.(base64, 'audio/webm');
                };
                reader.readAsDataURL(blob);

                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.current = recorder;
            recorder.start();
            setIsRecording(true);
            setTimer(0);

            timerInterval.current = setInterval(() => {
                setTimer(prev => {
                    if (prev >= 299) { // 5 min max
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Please allow microphone access to record voice instructions.');
        }
    }, [onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
        }
        setIsRecording(false);
        clearInterval(timerInterval.current);
    }, []);

    const clearRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setTimer(0);
    };

    return (
        <div className="recorder">
            <button
                type="button"
                className={`recorder__button ${isRecording ? 'recorder__button--recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
            >
                {isRecording ? '⏹️' : '🎙️'}
            </button>

            <div className="recorder__timer">{formatTime(timer)}</div>

            <div className="recorder__status">
                {isRecording
                    ? '🔴 Recording... tap to stop'
                    : audioBlob
                        ? '✅ Recording saved'
                        : 'Tap to start recording'
                }
            </div>

            {audioUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <audio controls src={audioUrl} style={{ maxWidth: '280px' }} />
                    <button type="button" className="btn btn--secondary btn--sm" onClick={clearRecording}>
                        🗑️ Clear & Re-record
                    </button>
                </div>
            )}
        </div>
    );
}
