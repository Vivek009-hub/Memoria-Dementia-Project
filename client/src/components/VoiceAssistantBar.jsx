/**
 * VoiceAssistantBar.jsx — Floating Corner Voice Assistant Button (Phase F9 / B11)
 * Renders a fixed floating mic button in the corner of the window screen ("Tap to speak").
 */

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

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
        <div className="bg-[#1B1B1B] border border-[#343434] rounded-xl p-4 shadow-xl max-w-xs sm:max-w-sm text-[#E8E8E8] transition-all">
          <div className="flex items-center justify-between space-x-3 mb-2 border-b border-[#343434] pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#DDBB55] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#DDBB55]">
                {voiceStatus}
              </span>
            </div>
            {isListening && (
              <div className="flex items-center space-x-1">
                <span className="w-1 h-3 bg-[#DDBB55] rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-[#DDBB55] rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-2 bg-[#DDBB55] rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          <p className="text-xs text-[#A0A0A0] min-h-[2rem] italic">
            {liveTranscript
              ? `"${liveTranscript}"`
              : isListening
              ? 'Speak clearly...'
              : 'Processing request...'}
          </p>

          <div className="mt-2 text-[10px] text-[#747474] font-medium uppercase tracking-wider flex items-center justify-between">
            <span>Memora Voice Assistant</span>
            <span>Tap mic to stop</span>
          </div>
        </div>
      )}

      {/* Floating Microphone Action Button */}
      <div className="relative group">
        {/* Subtle pulsing ring animation when active */}
        {isListening && (
          <span className="absolute -inset-2 rounded-full bg-[#DDBB55]/20 animate-ping pointer-events-none" />
        )}

        <button
          onClick={toggleListening}
          className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-150 transform hover:scale-105 active:scale-95 border-2 ${
            isListening
              ? 'bg-[#C95C5C] border-[#E88888] text-[#1E1E1E]'
              : 'bg-[#DDBB55] hover:bg-[#E8C968] border-[#E8C968] text-[#1E1E1E]'
          }`}
          aria-label={isListening ? 'Stop voice recording' : 'Tap to speak'}
          title={isListening ? 'Stop voice recording' : 'Tap to speak'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}

          <span className="text-[10px] font-semibold uppercase tracking-tight mt-0.5 text-center leading-none">
            {isListening ? 'Stop' : 'Speak'}
          </span>
        </button>
      </div>

      {/* Voice Read Aloud Toggle Pill */}
      {setSpeakEnabled && (
        <button
          onClick={() => setSpeakEnabled(!speakEnabled)}
          className={`px-3 py-1 rounded-md border text-[11px] font-medium flex items-center space-x-1.5 shadow-md transition-colors ${
            speakEnabled
              ? 'bg-[#252525] border-[#343434] text-[#DDBB55]'
              : 'bg-[#1B1B1B] border-[#343434] text-[#747474]'
          }`}
          title={speakEnabled ? 'Mute AI voice responses' : 'Enable AI voice responses'}
        >
          {speakEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#DDBB55]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span>{speakEnabled ? 'Voice ON' : 'Muted'}</span>
        </button>
      )}
    </aside>
  );
}

