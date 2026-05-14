import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, User, Sparkles, Trash2, Download } from 'lucide-react';
import './FitCoach.css';

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

const QUICK_ACTIONS = [
  { label: '🌱 Beginner Plan', prompt: 'Create a simple 3-day beginner workout plan for me based on my profile.' },
  { label: '🍛 Indian Muscle Food', prompt: 'What are the best high-protein Indian foods to build muscle? Give me a meal plan using dal, paneer, and other Indian foods.' },
  { label: '🔥 HIIT Workout', prompt: 'Give me a 20-minute HIIT workout I can do at home with no equipment.' },
  { label: '📊 Calculate My TDEE', prompt: 'Calculate my TDEE and suggest a calorie target for my fitness goal based on my profile data.' },
  { label: '😴 Recovery Tips', prompt: 'What are the best recovery strategies after an intense workout? Include sleep, nutrition, and stretching.' },
  { label: '💊 Supplement Guide', prompt: 'What supplements are worth taking for fitness? Keep it simple and evidence-based.' },
  { label: '🏃 Cardio vs Strength', prompt: 'Should I do more cardio or strength training for my goal? What does science say?' },
  { label: '🥗 Indian Diet Plan', prompt: 'Create a 7-day Indian vegetarian diet plan for fat loss with macros for each meal.' },
];

const HISTORY_KEY = 'fitcoach_history';

const FitCoach = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.slice(-20).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [{ id: '1', sender: 'ai', text: "Namaste! 🙏 I'm **FitCoach AI**, your personal fitness and nutrition coach. I know Indian foods, regional cuisines, and fitness science.\n\nTell me about your goals, or pick a quick topic below!", timestamp: new Date() }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Save to localStorage (last 20 messages)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
    } catch {}
  };

  const buildContextPrompt = (userPrompt: string) => {
    const parts: string[] = [];
    if (profile.age) parts.push(`Age: ${profile.age}`);
    if (profile.weightKg) parts.push(`Weight: ${profile.weightKg}kg`);
    if (profile.heightCm) parts.push(`Height: ${profile.heightCm}cm`);
    if (profile.fitnessGoal) parts.push(`Goal: ${profile.fitnessGoal}`);
    if (profile.activityLevel) parts.push(`Activity: ${profile.activityLevel}`);
    if (profile.fitnessLevel) parts.push(`Level: ${profile.fitnessLevel}`);

    if (parts.length === 0) return userPrompt;
    return `[User Profile: ${parts.join(', ')}]\n\n${userPrompt}`;
  };

  const handleSend = async (promptText?: string) => {
    const text = promptText || input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    try {
      const res = await api.post('/ai/chat', { prompt: buildContextPrompt(text) });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: res.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "⚠️ I'm having trouble connecting right now. Check your GROQ_API_KEY or try again shortly.", timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const initial: Message = { id: Date.now().toString(), sender: 'ai', text: "Chat cleared! I'm ready for a fresh start. What would you like to work on? 💪", timestamp: new Date() };
    setMessages([initial]);
    setShowQuickActions(true);
    localStorage.removeItem(HISTORY_KEY);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.sender.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fitcoach-chat.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // Simple markdown-to-JSX renderer (bold, bullets, newlines)
  const renderText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <h3 key={i} className="chat-h3">{line.slice(2)}</h3>;
      if (line.startsWith('## ')) return <h4 key={i} className="chat-h4">{line.slice(3)}</h4>;
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} className="chat-bullet">• {formatInline(line.slice(2))}</div>;
      }
      if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="chat-strong-line">{line.slice(2, -2)}</strong>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="chat-para">{formatInline(line)}</p>;
    });
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="animate-fade-in fitcoach-page">
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">FitCoach AI</h1>
          <p className="db-greeting-sub">Your personal trainer — knows Indian food, fitness science, and your profile.</p>
        </div>
        <div className="fitcoach-header-actions">
          {profile.fitnessLevel && (
            <span className="fitcoach-level-badge">
              {profile.fitnessLevel === 'BEGINNER' ? '🌱' : profile.fitnessLevel === 'INTERMEDIATE' ? '🔥' : '⚡'} {profile.fitnessLevel}
            </span>
          )}
          <button className="fitcoach-action-btn" onClick={exportChat} title="Export chat"><Download size={16} /></button>
          <button className="fitcoach-action-btn danger" onClick={clearHistory} title="Clear history"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="glass-panel chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`chat-bubble ${msg.sender}`}>
                {msg.sender === 'ai' ? renderText(msg.text) : <p className="chat-para">{msg.text}</p>}
                <div className="chat-time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrapper ai">
              <div className="chat-avatar"><Bot size={18} /></div>
              <div className="chat-bubble ai typing-indicator"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && !loading && (
          <div className="quick-actions">
            <div className="quick-actions-label"><Sparkles size={14} /> Quick topics</div>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map((qa, i) => (
                <button key={i} className="quick-action-chip" onClick={() => handleSend(qa.prompt)}>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="chat-input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Ask about workouts, Indian nutrition, your TDEE..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary btn-icon-only" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FitCoach;
