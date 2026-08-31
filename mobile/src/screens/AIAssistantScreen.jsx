/**
 * AIAssistantScreen.jsx — Patient-Facing AI Memory Companion Screen (Phase F5 / B11)
 *
 * Grounded memory QA UI connected strictly to Memora B11 API backend.
 * Features:
 * - Simple chat conversation interface
 * - Grounded memory answers ("Based on your memories...")
 * - No-memory fallback ("I couldn't find a memory about that...")
 * - Voice microphone toggle using Web Speech API (with permission status)
 * - Text-to-speech read aloud button
 * - Prompt recommendation chips
 * - Zero direct third-party AI provider calls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, AlertCircle, RefreshCw, HelpCircle, ShieldCheck
} from 'lucide-react';
import * as aiApi from '../api/ai.api.js';

const PROMPT_SUGGESTIONS = [
  'What memories do I have with my family?',
  'Where did I live previously?',
  'Who is in my family directory?',
  'What did I do last summer?',
];

export function AIAssistantScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am Memora, your personal memory companion. Ask me anything about your saved memories, family, or past events.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Voice speech synthesis & recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported by browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setErrorMsg('Microphone error or permission denied. Please type your question.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setLoading(true);
    setErrorMsg('');

    try {
      // Call B11 memory assistant endpoint
      const res = await aiApi.askMemoryAssistant(query.trim());
      const replyText = res.data?.answer || res.data?.response || res.data?.message || res.message || 'I found your response.';

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date(),
        sources: res.data?.memoriesUsed || res.data?.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setErrorMsg(err.message || 'Memora couldn\'t answer right now. Please try again.');
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'I\'m sorry, I couldn\'t search your memories right now. Please check your connection and try again.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      setErrorMsg('Voice input is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setErrorMsg('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleTextToSpeech = (messageId, text) => {
    if (!('speechSynthesis' in window)) {
      setErrorMsg('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      setSpeakingMessageId(messageId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Talk to Memora</span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Grounded AI</span>
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Answers are grounded strictly in your personal authorized memories.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Suggestions:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[50vh] overflow-y-auto space-y-4 shadow-inner"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMessageId === msg.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl text-sm md:text-base leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md font-medium'
                    : msg.isError
                    ? 'bg-red-950/80 border border-red-500/50 text-red-200 rounded-bl-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none shadow-md'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Memora Assistant</span>
                    </span>

                    {/* Read Aloud Button */}
                    <button
                      onClick={() => handleTextToSpeech(msg.id, msg.text)}
                      className={`p-1 rounded-md text-xs font-bold flex items-center space-x-1 transition-colors ${
                        isSpeaking
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-400 hover:text-white bg-slate-900'
                      }`}
                      aria-label="Read response aloud"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Read'}</span>
                    </button>
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              <span className="text-[10px] font-bold text-slate-500 px-2 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3 p-4 bg-slate-950 border border-slate-800 rounded-3xl w-max text-indigo-400 text-sm font-bold animate-pulse">
            <Bot className="w-5 h-5 animate-bounce" />
            <span>Memora is searching your memories...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-center space-x-2 text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl flex items-center space-x-3"
      >
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition-all ${
            isListening
              ? 'bg-red-600 text-white border-red-400 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          title={isListening ? 'Listening...' : 'Speak your question'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Listening to your voice...' : 'Ask Memora about a memory...'}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-medium text-base focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-lg transition-all touch-target-xl"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
