/**
 * AIAssistantScreen.jsx — Memora Voice AI Companion Screen (Prompt 2 Implementation)
 *
 * Features:
 * - 5 explicit listening states: IDLE, LISTENING, PROCESSING, SPEAKING, ERROR.
 * - High-contrast, large touch-target microphone button tailored for elderly users.
 * - Automatic SpeechSynthesis (TTS) playback with elder-friendly speech rate (0.85).
 * - Routes audio through standard mobile audio output (compatible with paired Bluetooth earbuds).
 * - Bluetooth connection guidance banner.
 * - Calls POST /api/v1/ai/companion/chat (Prompt 1 Gemini Agent foundation).
 * - Displays active conversation context, routine activity, and tool confirmations.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  AlertTriangle,
  Headphones,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';
import * as aiApi from '../api/ai.api.js';
import { PersonalizedRecommendationsCard } from '../components/PersonalizedRecommendationsCard.jsx';

// 5 Explicit Companion States per Prompt 2 §13
export const COMPANION_STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  SPEAKING: 'SPEAKING',
  ERROR: 'ERROR',
};

export function AIAssistantScreen({ onNavigate }) {
  const [companionState, setCompanionState] = useState(COMPANION_STATES.IDLE);
  const [conversationId, setConversationId] = useState(null);
  const [selectedLang, setSelectedLang] = useState('en');
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [toolsUsed, setToolsUsed] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Memora, your personal companion. I'm here with you. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, companionState]);

  // Text-To-Speech Output via SpeechSynthesis
  const speakText = (text) => {
    if (!speakEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setCompanionState(COMPANION_STATES.IDLE);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setCompanionState(COMPANION_STATES.SPEAKING);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower, clearer rate for elderly patients
      utterance.pitch = 1.0;
      if (selectedLang === 'hi') utterance.lang = 'hi-IN';

      utterance.onend = () => {
        setCompanionState(COMPANION_STATES.IDLE);
      };

      utterance.onerror = () => {
        setCompanionState(COMPANION_STATES.IDLE);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setCompanionState(COMPANION_STATES.IDLE);
    }
  };

  // Main message handler calling Gemini companion chat endpoint
  const handleSendMessage = async (textToSend = inputQuery) => {
    const trimmed = textToSend.trim();
    if (!trimmed || companionState === COMPANION_STATES.PROCESSING) return;

    setErrorDetails('');
    setCompanionState(COMPANION_STATES.PROCESSING);

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    try {
      const res = await aiApi.sendCompanionChat(trimmed, conversationId, selectedLang);
      const data = res.data || {};

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.toolsUsed) setToolsUsed(data.toolsUsed);

      const replyText = data.message || "I'm here with you! What else would you like to talk about?";

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        toolsUsed: data.toolsUsed || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      setCompanionState(COMPANION_STATES.ERROR);
      setErrorDetails(
        err.message || "I'm having trouble connecting right now. Please try again in a moment."
      );
    }
  };

  // Speech Recognition trigger
  const toggleSpeechRecognition = () => {
    if (companionState === COMPANION_STATES.LISTENING) {
      setCompanionState(COMPANION_STATES.IDLE);
      return;
    }

    if (
      typeof window === 'undefined' ||
      (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))
    ) {
      alert('Voice recognition is not supported on this browser. Please type your message below.');
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setCompanionState(COMPANION_STATES.LISTENING);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setCompanionState(COMPANION_STATES.ERROR);
        setErrorDetails('Voice input interrupted. Please try tapping the microphone again.');
      };

      recognition.onend = () => {
        if (companionState === COMPANION_STATES.LISTENING) {
          setCompanionState(COMPANION_STATES.IDLE);
        }
      };

      recognition.start();
    } catch {
      setCompanionState(COMPANION_STATES.ERROR);
      setErrorDetails('Microphone permission error or voice input unavailable.');
    }
  };

  // Render Status Badge for 5 States
  const renderStatusBadge = () => {
    switch (companionState) {
      case COMPANION_STATES.LISTENING:
        return (
          <div className="flex items-center space-x-2 text-red-400 bg-red-950/60 border border-red-500/40 px-3 py-1.5 rounded-full text-xs font-black animate-pulse">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span>● Listening...</span>
          </div>
        );
      case COMPANION_STATES.PROCESSING:
        return (
          <div className="flex items-center space-x-2 text-amber-400 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-black">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>● Thinking...</span>
          </div>
        );
      case COMPANION_STATES.SPEAKING:
        return (
          <div className="flex items-center space-x-2 text-indigo-400 bg-indigo-950/60 border border-indigo-500/40 px-3 py-1.5 rounded-full text-xs font-black">
            <Volume2 className="w-3.5 h-3.5 animate-bounce text-indigo-400" />
            <span>● Speaking...</span>
          </div>
        );
      case COMPANION_STATES.ERROR:
        return (
          <div className="flex items-center space-x-2 text-rose-400 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-full text-xs font-black">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>● Connection Issue</span>
          </div>
        );
      case COMPANION_STATES.IDLE:
      default:
        return (
          <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-black">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span>● Ready</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Top Header & Companion Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Bot className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Voice Companion</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Companion</h1>
          <p className="text-sm text-slate-400 mt-1">
            Speak naturally to ask about your routine, set reminders, or talk about memories.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {renderStatusBadge()}

          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Bluetooth Earbuds Guidance Banner */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-200">
        <div className="flex items-center space-x-2.5">
          <Headphones className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>
            <strong>Bluetooth Earbuds:</strong> Connect your Bluetooth earbuds to your phone for comfortable hands-free audio.
          </span>
        </div>
        <button
          onClick={() => setSpeakEnabled(!speakEnabled)}
          className={`px-3 py-1.5 rounded-xl border font-extrabold flex items-center space-x-1.5 transition-all ${
            speakEnabled
              ? 'bg-indigo-600 border-indigo-400 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          {speakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{speakEnabled ? 'Voice ON' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Big Voice Microphone Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <div className="flex justify-center">
          <button
            onClick={toggleSpeechRecognition}
            disabled={companionState === COMPANION_STATES.PROCESSING}
            className={`p-7 rounded-full transition-all transform active:scale-95 touch-target-xl shadow-2xl flex items-center justify-center ${
              companionState === COMPANION_STATES.LISTENING
                ? 'bg-red-600 text-white border-4 border-red-300 animate-pulse shadow-red-600/60 ring-8 ring-red-500/20'
                : companionState === COMPANION_STATES.SPEAKING
                ? 'bg-indigo-600 text-white border-4 border-indigo-300 ring-8 ring-indigo-500/20 animate-bounce'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-4 border-emerald-400 shadow-emerald-600/40'
            }`}
            aria-label="Tap to speak with Memora"
          >
            {companionState === COMPANION_STATES.LISTENING ? (
              <MicOff className="w-12 h-12" />
            ) : companionState === COMPANION_STATES.SPEAKING ? (
              <Volume2 className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        <div>
          <p className="text-lg font-black text-white tracking-wide">
            {companionState === COMPANION_STATES.LISTENING
              ? 'Listening to you... Tap when done'
              : companionState === COMPANION_STATES.SPEAKING
              ? 'Memora is speaking...'
              : companionState === COMPANION_STATES.PROCESSING
              ? 'Thinking...'
              : 'Tap Microphone to Speak'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Try saying: "Remind me to turn off the stove in 15 minutes" or "What is my routine today?"
          </p>
        </div>
      </div>

      {/* Quick Reminder / Routine Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Try saying:</span>
        {[
          'Remind me to turn off the stove in 15 minutes',
          'What is my routine today?',
          'Tell me about my daughter',
          'I feel a bit bored',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-xs font-medium text-slate-300 hover:text-white transition-all whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error Notice if any */}
      {errorDetails && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorDetails}</span>
          </div>
          <button
            onClick={() => setErrorDetails('')}
            className="text-slate-400 hover:text-white font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 min-h-[300px] max-h-[450px] overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-5 shadow-md space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between text-xs opacity-75 mb-1">
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'Memora Companion'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="text-base leading-relaxed">{msg.text}</p>
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Action: {msg.toolsUsed.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {companionState === COMPANION_STATES.PROCESSING && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-slate-400 text-sm font-bold flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Memora is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Manual Text Fallback Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-3xl shadow-xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Or type a message to Memora..."
          className="flex-1 p-3 bg-transparent text-white font-medium text-base focus:outline-none placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || companionState === COMPANION_STATES.PROCESSING}
          className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all touch-target-xl"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
