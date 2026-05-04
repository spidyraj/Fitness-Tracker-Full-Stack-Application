import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Minimize2 } from 'lucide-react';
import api from '../services/api';
import './ChatbotWidget.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      sender: 'ai',
      text: "Hi! I'm FitCoach, your AI trainer. Ask me about workouts, nutrition, recovery, or anything fitness-related.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: text });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm having trouble reaching my brain right now. Please check that the AI service is running and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className={`chatbot-trigger ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Coach"
      >
        <Bot size={22} />
        <span className="trigger-badge">AI</span>
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <Bot size={16} />
            </div>
            <div>
              <div className="chatbot-title">FitCoach AI</div>
              <div className="chatbot-subtitle">
                <span className="online-dot"></span>
                Online · Groq Llama 3.1
              </div>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>
            <Minimize2 size={16} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`cb-msg-row ${msg.sender}`}>
              {msg.sender === 'ai' && (
                <div className="cb-avatar-sm">
                  <Bot size={12} />
                </div>
              )}
              <div className="cb-bubble-wrap">
                <div className={`cb-bubble ${msg.sender}`}>{msg.text}</div>
                <div className="cb-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="cb-msg-row ai">
              <div className="cb-avatar-sm">
                <Bot size={12} />
              </div>
              <div className="cb-bubble-wrap">
                <div className="cb-bubble ai cb-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chatbot-input-row">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask me anything about fitness..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chatbot-send"
            disabled={loading || !input.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Backdrop on mobile */}
      {isOpen && <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatbotWidget;
