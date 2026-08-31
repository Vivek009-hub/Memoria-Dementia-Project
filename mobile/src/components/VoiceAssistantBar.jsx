/**
 * VoiceAssistantBar.jsx — Elder-Friendly Voice Input & Audio Playback Bar
 */

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

export function VoiceAssistantBar({ onVoiceInput, isListening, setIsListening, speakEnabled, setSpeakEnabled }) {
  const [voiceStatus, setVoiceStatus] = useState('Ready');

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can type your query below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Ready');
    } else {
      setIsListening(true);
      setVoiceStatus('Listening...');

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          setVoiceStatus('Processing...');
          onVoiceInput(transcript);
          setTimeout(() => setVoiceStatus('Ready'), 1500);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setVoiceStatus('Voice input unavailable');
          setTimeout(() => setVoiceStatus('Ready'), 2000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        setIsListening(false);
        setVoiceStatus('Voice error');
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-4">
      {/* Mic Action Toggle */}
      <button
        onClick={toggleListening}
        className={`p-4 rounded-2xl flex items-center space-x-3 transition-all touch-target-xl ${
          isListening
            ? 'bg-red-600 border-2 border-red-400 text-white animate-pulse shadow-lg shadow-red-600/50'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        <span className="font-extrabold text-sm uppercase tracking-wide">
          {isListening ? 'Stop Speaking' : 'Tap to Speak'}
        </span>
      </button>

      {/* Status & Visualizer */}
      <div className="flex-1 text-center hidden sm:block">
        <span className="text-xs font-bold text-slate-300 block">{voiceStatus}</span>
        {isListening && (
          <div className="flex items-center justify-center space-x-1 mt-1">
            <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Audio Playback Toggle */}
      <button
        onClick={() => setSpeakEnabled(!speakEnabled)}
        className={`p-3.5 rounded-2xl border transition-colors flex items-center space-x-2 ${
          speakEnabled
            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
            : 'bg-slate-950 border-slate-800 text-slate-500'
        }`}
        title={speakEnabled ? 'Disable TTS Read Aloud' : 'Enable TTS Read Aloud'}
      >
        {speakEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        <span className="text-xs font-extrabold hidden md:inline">
          {speakEnabled ? 'Voice Response ON' : 'Muted'}
        </span>
      </button>
    </div>
  );
}
