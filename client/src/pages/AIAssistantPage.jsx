/**
 * AIAssistantPage.jsx — Memora AI Memory Assistant & Chat Page (Phase F9 / B11)
 * Laid out strictly according to the provided wireframe design:
 *   1. Header: Memora AI Companion / AI Memory Assistant
 *   2. 2-Column Main View:
 *      - Left: "picked for u today" (Interactive recommendations, daily memory recall prompts, activities)
 *      - Right: "chat box" (AI chat interface with history, speaker buttons, typing indicator, send controls)
 *   3. Floating Mic Button: "Tap to speak" floating in the bottom-right corner of the window screen.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  AlertTriangle,
  Volume2,
  VolumeX,
  MessageSquare,
  HelpCircle,
  Calendar,
  Heart,
  Gamepad2,
  Clock,
  Trash2,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { VoiceAssistantBar } from '../components/VoiceAssistantBar.jsx';
import * as aiApi from '../api/ai.api.js';

export function AIAssistantPage({ patientId, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Memora AI Assistant. I can help you recall special memories, guide you through your daily routine, or suggest fun games. How can I help you today?",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  // Recommendations state for "picked for u today"
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState({
    games: [
      { id: 'memory_match', title: 'Memory Match Cards', category: 'Cognitive', difficulty: 'Easy', route: '/app/games/memory_match' },
      { id: 'word_recall', title: 'Daily Word Puzzle', category: 'Language', difficulty: 'Easy', route: '/app/games/word_recall' },
    ],
    routine: 'Morning music therapy and memory photo review at 10:00 AM',
    dailyPrompts: [
      { text: "What is my agenda for today?", icon: Calendar },
      { text: "Who visited me this week?", icon: Heart },
      { text: "Remind me of my morning routine", icon: Clock },
      { text: "Tell me a calming story", icon: Lightbulb },
    ],
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchRecs = async () => {
    setLoadingRecs(true);
    try {
      const res = await aiApi.getRecommendations();
      if (res.data) {
        setRecommendations((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch {
      // Use standard fallback recommendations
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const speakText = (text) => {
    if (!speakEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Slightly slower tempo for elder accessibility
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
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
      const aiReplyText =
        res.data?.answer ||
        res.answer ||
        res.data?.reply ||
        res.reply ||
        res.data?.message ||
        "I've listened to your query. How else can I assist your memory today?";

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiReplyText);
    } catch (err) {
      setErrorMsg(
        err.message ||
          'The AI assistant is temporarily unavailable. Please try again or type a new message.'
      );
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        id: 'welcome_refresh',
        sender: 'ai',
        text: "Chat cleared! What would you like to talk about or review now?",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-28">
      {/* ── TOP BANNER HEADER (Matching Wireframe Header) ── */}
      <header className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-2 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            Memora AI Companion
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          AI Memory Assistant
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Conversational AI companion to help recall memories, answer daily routine questions, and suggest activities.
        </p>
      </header>

      {/* ── 2-COLUMN MAIN LAYOUT (Matching Wireframe Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: "picked for u today" ── */}
        <section
          aria-label="Picked for you today"
          className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Picked for u today
              </h2>
            </div>
            <button
              onClick={fetchRecs}
              disabled={loadingRecs}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition-colors disabled:opacity-50"
              title="Refresh recommendations"
              aria-label="Refresh recommendations"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingRecs ? 'animate-spin text-indigo-400' : ''}`}
              />
            </button>
          </div>

          {/* Quick Memory Recall Prompts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask AI Assistant</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold">Tap to send</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {recommendations.dailyPrompts.map((prompt, idx) => {
                const IconComp = prompt.icon || MessageSquare;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 rounded-2xl flex items-center justify-between text-left group transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/20 text-indigo-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {prompt.text}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Cognitive Games */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Games</span>
            </span>

            <div className="space-y-2.5">
              {recommendations.games.map((game, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate && onNavigate(game.route || '/app/games')}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded-xl">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {game.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {game.category || 'Cognitive'} • {game.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Daily Routine Summary */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-indigo-300 block">Daily Care Routine</span>
              <p className="text-xs text-slate-300 mt-0.5">{recommendations.routine}</p>
            </div>
          </div>
        </section>

        {/* ── RIGHT COLUMN: "chat box" ── */}
        <section
          aria-label="Interactive AI Chat Box"
          className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[650px]"
        >
          {/* Chat Header Bar */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 border border-emerald-400/30 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-none">
                  Memora Assistant
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Active & ready to help
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSpeakEnabled(!speakEnabled)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                  speakEnabled
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
                title={speakEnabled ? 'Mute voice responses' : 'Enable voice responses'}
              >
                {speakEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {speakEnabled ? 'Voice ON' : 'Muted'}
                </span>
              </button>

              <button
                onClick={clearChat}
                className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 rounded-xl transition-colors"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-950/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 max-w-[88%] ${
                  msg.sender === 'user'
                    ? 'ml-auto flex-row-reverse space-x-reverse'
                    : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                <div
                  className={`group relative p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-lg'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 opacity-70">
                    <span className="text-[10px] font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="p-1 hover:text-indigo-400 transition-colors"
                        title="Read message aloud"
                        aria-label="Read message aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl rounded-tl-none text-slate-300 text-xs font-bold flex items-center space-x-2 shadow-md">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Memora AI is recalling memories & thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/90 border-t border-red-500/50 text-xs font-bold text-red-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chat Input Bar */}
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
              className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-lg transition-all touch-target-xl flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </section>
      </div>

      {/* ── FLOATING MIC BUTTON (Fixed in Corner of Window Screen) ── */}
      <VoiceAssistantBar
        onVoiceInput={(transcript) => handleSendMessage(transcript)}
        isListening={isListening}
        setIsListening={setIsListening}
        speakEnabled={speakEnabled}
        setSpeakEnabled={setSpeakEnabled}
      />
    </div>
  );
}
