
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Check, Loader2, Play, Pause, AlertCircle } from 'lucide-react';
import Button from './Button';
import { apiUploadVoice, ApiStatus } from '../services/api';

interface VoiceNoteRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onCancel: () => void;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onTranscriptionComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<ApiStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(40).fill(20));

  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setWaveform(prev => {
          const next = [...prev];
          next.shift();
          next.push(Math.floor(Math.random() * 60) + 10);
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setError(null);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    // Simulate File Creation
    const mockFile = new File(["voice"], "insight.wav", { type: "audio/wav" });
    
    const result = await apiUploadVoice({
      orgId: 'org-1',
      conversationId: 'current-session',
      audioFile: mockFile
    }, (newStatus) => setStatus(newStatus));

    if (result.success && result.transcription) {
      setStatus('success');
      setTimeout(() => {
        onTranscriptionComplete(result.transcription!);
      }, 1000);
    } else {
      setError(result.error || "Failed to process audio.");
      setStatus('error');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Mic size={120} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        <div>
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-2">Voice Synthesis Pipeline</p>
          <h3 className="text-2xl font-bold tracking-tight">
            {isRecording ? 'Capturing Insights...' : 
             status === 'uploading' ? 'Syncing Evidence Vault...' : 
             status === 'transcribing' ? 'Converting to Semantic Text...' : 
             status === 'embedding' ? 'Generating Vector Mapping...' : 
             status === 'success' ? 'Intelligence Captured' : 'Ready to contribute'}
          </h3>
        </div>

        <div className="flex items-end justify-center gap-1 h-20 w-full px-4">
          {waveform.map((h, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full transition-all duration-150 ${
                isRecording ? 'bg-purple-500' : 'bg-slate-700'
              }`}
              style={{ height: isRecording ? `${h}%` : '4px' }}
            />
          ))}
        </div>

        <div className="text-3xl font-mono font-medium text-slate-300">
          {formatTime(recordingTime)}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex items-center gap-6">
          {!isRecording && (status === 'idle' || status === 'error' || status === 'success') && (
            <button 
              onClick={startRecording}
              className="w-20 h-20 rounded-full formly-gradient flex items-center justify-center shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform active:scale-95"
            >
              <Mic size={32} />
            </button>
          )}

          {isRecording && (
            <button 
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/20 hover:scale-105 transition-transform animate-pulse"
            >
              <Square size={32} />
            </button>
          )}

          {(status !== 'idle' && status !== 'error' && status !== 'success' && !isRecording) && (
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
          )}

          {status === 'success' && !isRecording && (
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={32} />
            </div>
          )}
        </div>

        <div className="flex gap-4 w-full">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 border-none"
          >
            <Trash2 size={18} className="mr-2" /> Cancel
          </Button>
          {status === 'success' && (
            <Button className="flex-1" onClick={() => onTranscriptionComplete("")}>
              Integrated
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;
