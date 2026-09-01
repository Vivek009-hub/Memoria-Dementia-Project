/**
 * AIAssistantPage.jsx — Memora AI Memory Assistant & Chat Page (Phase F9 / B11)
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
  Mic,
} from 'lucide-react';
import { VoiceAssistantBar } from '../components/VoiceAssistantBar.jsx';
import * as aiApi from '../api/ai.api.js';

export function AIAssistantPage({ patientId, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Good afternoon. I am your Memora AI companion. I can help you recall special memories, guide you through your daily routine, or talk with you about your day. How can I help you today?",
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
        text: "Conversation cleared. What would you like to talk about now?",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-28">
      {/* ── TOP HEADER ── */}
      <header className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-2">
        <div className="flex items-center space-x-2 text-[#D8B24C]">
          <Bot className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Talk to Memora
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">
          AI Companion
        </h1>
        <p className="text-sm text-[#A7A7A2] max-w-3xl leading-relaxed">
          A calm voice and text companion to help recall memories, answer daily routine questions, and suggest activities.
        </p>
      </header>

      {/* ── 2-COLUMN MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Daily Prompts & Recommendations ── */}
        <section
          aria-label="Daily Prompts"
          className="lg:col-span-5 bg-[#202020] border border-[#343434] rounded-xl p-5 space-y-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-[#343434] pb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-md text-[#D8B24C]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-[#F5F5F0] tracking-wide">
                Suggested Conversations
              </h2>
            </div>
            <button
              onClick={fetchRecs}
              disabled={loadingRecs}
              className="p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-md bg-[#151515] border border-[#343434] transition-colors disabled:opacity-50"
              title="Refresh recommendations"
              aria-label="Refresh recommendations"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingRecs ? 'animate-spin text-[#D8B24C]' : ''}`}
              />
            </button>
          </div>

          {/* Quick Memory Recall Prompts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A7A7A2] uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#D8B24C]" />
                <span>Memory Prompts</span>
              </span>
              <span className="text-[10px] text-[#74746F]">Tap to ask</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {recommendations.dailyPrompts.map((prompt, idx) => {
                const IconComp = prompt.icon || MessageSquare;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="p-3 bg-[#151515] border border-[#343434] hover:border-[#D8B24C]/50 rounded-lg flex items-center justify-between text-left group transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-md bg-[#202020] text-[#D8B24C] shrink-0 border border-[#343434]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors">
                        {prompt.text}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#74746F] group-hover:text-[#D8B24C] transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Brain Practice */}
          <div className="space-y-2.5 pt-3 border-t border-[#343434]">
            <span className="text-xs font-medium text-[#A7A7A2] uppercase tracking-wider flex items-center space-x-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-[#9B6B9E]" />
              <span>Brain Practice</span>
            </span>

            <div className="space-y-2">
              {recommendations.games.map((game, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate && onNavigate(game.route || '/app/games')}
                  className="p-3 bg-[#151515] border border-[#343434] hover:border-[#9B6B9E]/50 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-[#9B6B9E]/15 text-[#9B6B9E] border border-[#9B6B9E]/30 rounded-md">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F5F5F0] group-hover:text-[#9B6B9E] transition-colors">
                        {game.title}
                      </h3>
                      <span className="text-[10px] text-[#74746F]">
                        {game.category || 'Cognitive'} &bull; {game.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#74746F] group-hover:text-[#9B6B9E] transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Daily Routine Summary */}
          <div className="p-3.5 bg-[#151515] border border-[#343434] rounded-lg flex items-center space-x-3">
            <Clock className="w-4 h-4 text-[#D8B24C] shrink-0" />
            <div>
              <span className="text-xs font-semibold text-[#F5F5F0] block">Daily Schedule Note</span>
              <p className="text-xs text-[#A7A7A2] mt-0.5">{recommendations.routine}</p>
            </div>
          </div>
        </section>

        {/* ── RIGHT COLUMN: Conversation Interface ── */}
        <section
          aria-label="Conversation Box"
          className="lg:col-span-7 bg-[#202020] border border-[#343434] rounded-xl overflow-hidden shadow-xs flex flex-col h-[600px]"
        >
          {/* Chat Header Bar */}
          <div className="p-4 bg-[#1B1B1B] border-b border-[#343434] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#D8B24C]/10 border border-[#D8B24C]/30 flex items-center justify-center text-[#D8B24C]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F5F5F0] leading-none">
                  Memora Companion
                </h2>
                <span className="text-[11px] text-[#45B982] font-medium">
                  Connected & Ready
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSpeakEnabled(!speakEnabled)}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                  speakEnabled
                    ? 'bg-[#D8B24C]/10 border-[#D8B24C]/30 text-[#D8B24C]'
                    : 'bg-[#151515] border-[#343434] text-[#74746F]'
                }`}
                title={speakEnabled ? 'Mute voice responses' : 'Enable voice responses'}
              >
                {speakEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#D8B24C]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {speakEnabled ? 'Voice ON' : 'Muted'}
                </span>
              </button>

              <button
                onClick={clearChat}
                className="p-2 text-[#A7A7A2] hover:text-[#D95C5C] bg-[#151515] border border-[#343434] rounded-lg transition-colors"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[#151515]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'ml-auto flex-row-reverse space-x-reverse'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user'
                      ? 'bg-[#D8B24C] border-[#F0C75E] text-[#151515]'
                      : 'bg-[#202020] border-[#343434] text-[#D8B24C]'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-lg text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#D8B24C] text-[#151515] font-semibold'
                      : 'bg-[#202020] border border-[#343434] text-[#F5F5F0]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#343434]/40 opacity-70">
                    <span className="text-[10px] font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="p-1 hover:text-[#D8B24C] transition-colors"
                        title="Read message aloud"
                        aria-label="Read message aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#202020] border border-[#343434] text-[#D8B24C] flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3 bg-[#202020] border border-[#343434] rounded-lg text-[#A7A7A2] text-xs font-medium flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D8B24C]" />
                  <span>Memora is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#D95C5C]/10 border-t border-[#D95C5C]/30 text-xs font-medium text-[#D95C5C] flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 bg-[#1B1B1B] border-t border-[#343434] flex items-center space-x-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message to Memora..."
              className="flex-1 px-3.5 py-2.5 bg-[#202020] border border-[#343434] rounded-lg text-[#F5F5F0] font-normal text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] font-semibold rounded-lg transition-colors flex items-center justify-center text-sm touch-target"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>

      {/* ── FLOATING MIC BUTTON ── */}
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
