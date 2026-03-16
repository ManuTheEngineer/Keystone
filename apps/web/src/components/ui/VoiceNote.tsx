"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceNoteProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export function VoiceNote({ onTranscript, placeholder = "Tap to speak..." }: VoiceNoteProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onerror = () => {
      setRecording(false);
    };
    recognition.onend = () => {
      setRecording(false);
    };
    recognitionRef.current = recognition;
  }, []);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      if (transcript.trim()) {
        onTranscript(transcript.trim());
      }
      setTranscript("");
      setRecording(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setRecording(true);
      } catch {
        // Recognition may already be running
        setRecording(false);
      }
    }
  }

  if (!supported) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-surface-alt border border-border flex items-center justify-center shrink-0">
          <MicOff size={16} className="text-muted" />
        </div>
        <span className="text-[10px] text-muted leading-snug">
          Voice input is not supported in this browser. Try Chrome on mobile.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <button
        type="button"
        onClick={toggleRecording}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          recording
            ? "bg-danger text-white"
            : "bg-clay text-warm hover:bg-clay/90"
        }`}
        title={recording ? "Stop recording" : placeholder}
      >
        <Mic size={16} />
      </button>
      <div className="flex-1 min-w-0">
        {recording && (
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
            </span>
            <span className="text-[10px] text-danger font-medium">Recording...</span>
          </div>
        )}
        {transcript && (
          <p className="text-[11px] text-muted italic leading-relaxed">
            {transcript}
          </p>
        )}
        {!recording && !transcript && (
          <span className="text-[10px] text-muted">{placeholder}</span>
        )}
      </div>
    </div>
  );
}
