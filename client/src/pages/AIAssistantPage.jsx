/**
 * AIAssistantPage.jsx — Memora AI Memory Assistant & Chat Page (Phase F9 / B11)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, AlertTriangle, Volume2, Mic } from 'lucide-react';
import { VoiceAssistantBar } from '../components/VoiceAssistantBar.jsx';
import { PersonalizedRecommendationsCard } from '../components/PersonalizedRecommendationsCard.jsx';
import * as aiApi from '../api/ai.api.js';

export function AIAssistantPage({ patientId, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Memora AI Assistant. I can help recall your past memories, remind you of your daily tasks, or keep you company. How can I help you today?",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const speakText = (text) => {
    if (!speakEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for elder clarity
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore tts errors
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setSending(true);
    setErrorMsg('');

    try {
      const res = await aiApi.chatWithAssistant(text, patientId);
      const aiReplyText = res.data?.reply || res.reply || res.data?.message || 'I listened to your request and updated your preferences.';

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiReplyText);
    } catch (err) {
      setErrorMsg(err.message || 'The AI service is temporarily unavailable. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">Memora AI Companion</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Memory Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">
            Conversational AI companion to help recall memories, answer daily routine questions, and suggest activities.
          </p>
        </div>
      </div>

      {/* Voice Assistant Control Bar */}
      <VoiceAssistantBar
        onVoiceInput={(transcript) => handleSendMessage(transcript)}
        isListening={isListening}
        setIsListening={setIsListening}
        speakEnabled={speakEnabled}
        setSpeakEnabled={setSpeakEnabled}
      />

      {/* Personalized AI Recommendations */}
      <PersonalizedRecommendationsCard onNavigate={onNavigate} />

      {/* Chat Conversation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[520px]">
        {/* Chat History */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-950/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[10px] opacity-60 block mt-1.5 text-right font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-none text-slate-400 text-xs font-bold flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Memora AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border-t border-red-500/50 text-xs font-bold text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about your memories or routine..."
            className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-lg transition-all touch-target-xl"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
