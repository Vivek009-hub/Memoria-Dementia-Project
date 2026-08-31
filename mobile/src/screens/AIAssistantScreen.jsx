/**
 * AIAssistantScreen.jsx — Memora Elder AI & Voice Companion Screen (Phase F10 / B11)
 *
 * Integrates:
 * - Grounded memory QA & conversational assistance
 * - Web Speech API voice input & TTS read-aloud
 * - Personalized game & routine recommendations
 * - Regional language selection
 * - Safe navigation routing
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Volume2, VolumeX, Mic, MicOff, Sparkles, RefreshCw, AlertCircle, HelpCircle, ArrowRight
} from 'lucide-react';
import { VoiceAssistantBar } from '../components/VoiceAssistantBar.jsx';
import { PersonalizedRecommendationsCard } from '../components/PersonalizedRecommendationsCard.jsx';
import * as aiApi from '../api/ai.api.js';

export function AIAssistantScreen({ onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Memora, your personal memory and daily companion. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Read text aloud using SpeechSynthesis
  const speakText = (text) => {
    if (!speakEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elderly clarity
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  const handleSendMessage = async (textToSend = inputQuery) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg('');
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiApi.askMemoryAssistant(trimmed, selectedLang);
      const answerText = res.data?.answer || res.data?.response || res.data?.reply || 'I found relevant details in your memory vault.';

      const assistantMsg = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        sources: res.data?.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(answerText);
    } catch (err) {
      setErrorMsg(err.message || 'I had trouble connecting to the memory assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Bot className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora AI Companion</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded memory QA, daily routine guidance, and voice assistance.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-400">Language:</span>
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

      {/* Personalized Recommendations Section */}
      <PersonalizedRecommendationsCard onNavigate={onNavigate} />

      {/* Voice Assistant Controls Bar */}
      <VoiceAssistantBar
        onVoiceInput={(transcript) => handleSendMessage(transcript)}
        isListening={isListening}
        setIsListening={setIsListening}
        speakEnabled={speakEnabled}
        setSpeakEnabled={setSpeakEnabled}
      />

      {/* Prompt Suggestions */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Try asking:</span>
        {[
          'What are my reminders today?',
          'Do I have any community events?',
          'Tell me about my family memories',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-xs font-medium text-slate-300 hover:text-white transition-all whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto">
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
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'Memora AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="text-base leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-slate-400 text-sm font-bold flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Memora is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Text Query Input Form */}
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
          placeholder="Ask Memora anything..."
          className="flex-1 p-3 bg-transparent text-white font-medium text-base focus:outline-none placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all touch-target-xl"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
