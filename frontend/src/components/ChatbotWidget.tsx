import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Bot, Send, Minimize2, Activity, Flame } from 'lucide-react';
import api from '../services/api';
import './ChatbotWidget.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface UserProfile {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  fitnessGoal?: string;
  activityLevel?: string;
  fitnessLevel?: string;
}

interface WorkoutLog {
  title: string;
  type: string;
  durationMinutes: number;
}

interface NutritionLog {
  foodName: string;
  calories: number;
  protein: number;
}

const WIDGET_HISTORY_KEY = 'chatbot_widget_history';

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(WIDGET_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.slice(-15).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [
      {
        id: '0',
        sender: 'ai',
        text: "Hi! I'm FitCoach, your AI trainer. \n\n⚡ **Active Sync**: Connected to your profile. Ask me about your **logged workouts**, **nutrition**, or anything fitness-related.",
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data for Context Prompting
  const [profile, setProfile] = useState<UserProfile>({});
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [recentNutrition, setRecentNutrition] = useState<NutritionLog[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
    localStorage.setItem(WIDGET_HISTORY_KEY, JSON.stringify(messages.slice(-15)));
  }, [messages, isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const loadUserData = async () => {
    try {
      const [profRes, workRes, nutRes] = await Promise.allSettled([
        api.get('/profile'),
        api.get('/workouts'),
        api.get('/nutrition')
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (workRes.status === 'fulfilled') setRecentWorkouts(workRes.value.data);
      if (nutRes.status === 'fulfilled') setRecentNutrition(nutRes.value.data);
    } catch {}
  };

  const buildContextPrompt = (userPrompt: string) => {
    const parts: string[] = [];
    if (profile.weightKg) parts.push(`Weight: ${profile.weightKg}kg`);
    if (profile.fitnessGoal) parts.push(`Goal: ${profile.fitnessGoal}`);
    if (profile.fitnessLevel) parts.push(`Level: ${profile.fitnessLevel}`);

    const directive = "CRITICAL INSTRUCTION: You are FitCoach AI. Use the Context below to directly answer the user without asking them to share details. If records are empty, give them a tailored sample routine.\n\n";

    let contextBlocks = '';
    if (parts.length > 0) contextBlocks += `[Profile: ${parts.join(', ')}]\n`;
    if (recentWorkouts.length > 0) {
      const wStrs = recentWorkouts.slice(0, 3).map(w => `${w.title} (${w.type}, ${w.durationMinutes}m)`).join(' | ');
      contextBlocks += `[Recent Workouts: ${wStrs}]\n`;
    }
    if (recentNutrition.length > 0) {
      const nStrs = recentNutrition.slice(0, 3).map(n => `${n.foodName} (${n.calories}kcal)`).join(' | ');
      contextBlocks += `[Recent Meals: ${nStrs}]\n`;
    }

    return `${directive}${contextBlocks.trim()}\n\nUser: ${userPrompt}`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const enrichedPrompt = buildContextPrompt(text);
      const res = await api.post('/ai/chat', { prompt: enrichedPrompt });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: res.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: "⚠️ Server connectivity error.", timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Flawless markdown parsing to React nodes for widget usage
  const parseInlineBold = (text: string): ReactNode[] => {
    const tokens = text.split('**');
    if (tokens.length <= 1) return [text];
    return tokens.map((token, idx) => {
      if (idx % 2 === 1 && token.trim()) {
        return <strong key={idx} className="widget-bold-pill">{token}</strong>;
      }
      return token;
    });
  };

  const renderText = (text: string) => {
    const normalized = text.replace(/={3,}|-{3,}/g, '');
    const lines = normalized.split('\n');

    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="cb-spacer" />;

      if (trimmed.startsWith('# ')) return <h4 key={i} className="cb-h4">{parseInlineBold(trimmed.slice(2))}</h4>;
      if (trimmed.startsWith('## ')) return <h5 key={i} className="cb-h5">{parseInlineBold(trimmed.slice(3))}</h5>;
      if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) return <h6 key={i} className="cb-h6">{parseInlineBold(trimmed.replace(/^#+\s*/, ''))}</h6>;

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const pureText = trimmed.replace(/^[-*•]\s*/, '');
        return (
          <div key={i} className="cb-bullet-row">
            <span className="cb-bullet-dot">⚡</span>
            <div className="cb-bullet-content">{parseInlineBold(pureText)}</div>
          </div>
        );
      }

      return <p key={i} className="cb-para">{parseInlineBold(trimmed)}</p>;
    });
  };

  return (
    <>
      <button className={`chatbot-trigger ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)} aria-label="Open AI Coach">
        <Bot size={22} className="animate-pulse" />
        <span className="trigger-badge">AI</span>
      </button>

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
                Online · Active Telemetry
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
                <div className={`cb-bubble ${msg.sender}`}>
                  {msg.sender === 'ai' ? renderText(msg.text) : <p className="cb-para">{msg.text}</p>}
                </div>
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
                  <span></span><span></span><span></span>
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
            placeholder="Review my logged workouts..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="chatbot-send" disabled={loading || !input.trim()}>
            <Send size={15} />
          </button>
        </form>
      </div>

      {isOpen && <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatbotWidget;
