/**
 * VoiceAssistantBar.jsx — Floating Corner Voice Assistant Button (Phase F9 / B11)
 * Renders a fixed floating mic button in the corner of the window screen ("Tap to speak").
 */

import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Volume2, VolumeX } from 'lucide-react';

export function VoiceAssistantBar({
  onVoiceInput,
  isListening,
  setIsListening,
  speakEnabled,
  setSpeakEnabled,
}) {
  const [voiceStatus, setVoiceStatus] = useState('Ready');
  const [liveTranscript, setLiveTranscript] = useState('');

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(
        'Speech recognition is not supported in this browser. You can type your query in the chat box.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Ready');
      setLiveTranscript('');
    } else {
      setIsListening(true);
      setVoiceStatus('Listening...');
      setLiveTranscript('');

      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setLiveTranscript(currentText);

          if (event.results[0].isFinal) {
            setIsListening(false);
            setVoiceStatus('Processing...');
            onVoiceInput(currentText);
            setTimeout(() => {
              setVoiceStatus('Ready');
              setLiveTranscript('');
            }, 1200);
          }
        };

        recognition.onerror = (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
          setVoiceStatus('Voice error');
          setTimeout(() => {
            setVoiceStatus('Ready');
            setLiveTranscript('');
          }, 2000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setIsListening(false);
        setVoiceStatus('Voice error');
      }
    }
  };

  return (
    <aside
      aria-label="Voice Assistant Controls"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end space-y-3 pointer-events-auto select-none"
    >
      {/* Floating Audio Feedback / Transcript Tooltip */}
      {(isListening || liveTranscript || voiceStatus === 'Processing...') && (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 rounded-3xl p-4 shadow-2xl max-w-xs sm:max-w-sm text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between space-x-3 mb-2 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                {voiceStatus}
              </span>
            </div>
            {isListening && (
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-slate-200 min-h-[2.5rem] italic">
            {liveTranscript
              ? `"${liveTranscript}"`
              : isListening
              ? 'Speak your question clearly...'
              : 'Processing your voice request...'}
          </p>

          <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Memora Voice AI</span>
            <span>Tap mic to stop</span>
          </div>
        </div>
      )}

      {/* Floating Microphone Action Button */}
      <div className="relative group">
        {/* Pulsing ring animation when active */}
        {isListening && (
          <>
            <span className="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
            <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          onClick={toggleListening}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-4 touch-target-xl ${
            isListening
              ? 'bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 border-rose-300 text-white shadow-rose-600/60 animate-pulse'
              : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 border-emerald-300 text-white shadow-emerald-600/50 hover:shadow-emerald-500/70'
          }`}
          aria-label={isListening ? 'Stop voice recording' : 'Tap to speak'}
          title={isListening ? 'Stop voice recording' : 'Tap to speak'}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 sm:w-9 sm:h-9 animate-bounce" />
          ) : (
            <Mic className="w-8 h-8 sm:w-9 sm:h-9" />
          )}

          <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight mt-0.5 text-center leading-none px-1">
            {isListening ? 'Stop' : 'Tap to speak'}
          </span>
        </button>
      </div>

      {/* Voice Read Aloud Toggle Pill */}
      {setSpeakEnabled && (
        <button
          onClick={() => setSpeakEnabled(!speakEnabled)}
          className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center space-x-1.5 backdrop-blur-md shadow-lg transition-colors ${
            speakEnabled
              ? 'bg-indigo-900/80 border-indigo-500/50 text-indigo-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
          title={speakEnabled ? 'Mute AI voice responses' : 'Enable AI voice responses'}
        >
          {speakEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span>{speakEnabled ? 'Voice ON' : 'Muted'}</span>
        </button>
      )}
    </aside>
  );
}
