import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, User, Sparkles, Trash2, Download, Dumbbell, Flame, Activity } from 'lucide-react';
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

interface WorkoutLog {
  title: string;
  type: string;
  durationMinutes: number;
  workoutDate: string;
}

interface NutritionLog {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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
    return [{ 
      id: '1', 
      sender: 'ai', 
      text: "Namaste! 🙏 I'm **FitCoach AI**, your personal trainer & nutrition guide.\n\n⚡ **Active Sync Enabled**: I'm independently connected to your stored **Profile Targets**, **Recent Workouts**, and **Logged Nutrition**.\n\nAsk me anything or choose a quick action below to get contextual advice tailored exactly to your recent history!", 
      timestamp: new Date() 
    }];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [recentNutrition, setRecentNutrition] = useState<NutritionLog[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

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
    if (profile.age) parts.push(`Age: ${profile.age}`);
    if (profile.weightKg) parts.push(`Weight: ${profile.weightKg}kg`);
    if (profile.heightCm) parts.push(`Height: ${profile.heightCm}cm`);
    if (profile.fitnessGoal) parts.push(`Goal: ${profile.fitnessGoal}`);
    if (profile.activityLevel) parts.push(`Activity: ${profile.activityLevel}`);
    if (profile.fitnessLevel) parts.push(`Level: ${profile.fitnessLevel}`);

    let contextBlocks = '';
    if (parts.length > 0) {
      contextBlocks += `[User Profile Context: ${parts.join(', ')}]\n`;
    }

    if (recentWorkouts.length > 0) {
      const wStrs = recentWorkouts.slice(0, 3).map(w => `${w.title} (${w.type}, ${w.durationMinutes}m)`).join(' | ');
      contextBlocks += `[Recent Logged Workouts: ${wStrs}]\n`;
    }

    if (recentNutrition.length > 0) {
      const nStrs = recentNutrition.slice(0, 4).map(n => `${n.foodName} (${n.calories}kcal, P:${n.protein}g)`).join(' | ');
      contextBlocks += `[Recent Logged Meals: ${nStrs}]\n`;
    }

    if (!contextBlocks) return userPrompt;
    return `${contextBlocks.trim()}\n\nUser Question/Prompt: ${userPrompt}`;
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
      const enrichedPrompt = buildContextPrompt(text);
      const res = await api.post('/ai/chat', { prompt: enrichedPrompt });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: res.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "⚠️ Server connectivity error. Please ensure your GROQ_API_KEY model fallback defaults are active or try again shortly.", timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const initial: Message = { id: Date.now().toString(), sender: 'ai', text: "Chat history cleared! Active sync to your workout & diet databases remains continuous. What would you like to explore next? 💪", timestamp: new Date() };
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

  // Upgraded rich markdown renderer with clear heading structures and elegant gym themes
  const renderText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) return <h2 key={i} className="chat-h2">{formatInline(trimmed.slice(2))}</h2>;
      if (trimmed.startsWith('## ')) return <h3 key={i} className="chat-h3">{formatInline(trimmed.slice(3))}</h3>;
      if (trimmed.startsWith('### ')) return <h4 key={i} className="chat-h4">{formatInline(trimmed.slice(4))}</h4>;
      if (trimmed.startsWith('#### ')) return <h5 key={i} className="chat-h5">{formatInline(trimmed.slice(5))}</h5>;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const pureText = trimmed.replace(/^[-*•]\s*/, '');
        return (
          <div key={i} className="chat-bullet">
            <span className="bullet-dot">⚡</span>
            <div className="bullet-content">{formatInline(pureText)}</div>
          </div>
        );
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
        return <strong key={i} className="chat-strong-line">{trimmed.slice(2, -2)}</strong>;
      }
      if (trimmed === '') return <div key={i} className="chat-spacer" />;
      return <p key={i} className="chat-para">{formatInline(line)}</p>;
    });
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="text-highlight">{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="animate-fade-in fitcoach-page">
      {/* Background Animated Neon Beams & Spinning Gym Accents */}
      <div className="ambient-beam beam-1" />
      <div className="ambient-beam beam-2" />
      <div className="gym-accent accent-dumbbell"><Dumbbell size={80} /></div>
      <div className="gym-accent accent-flame"><Flame size={100} /></div>

      <div className="db-greeting-row relative z-10">
        <div className="flex items-center gap-4">
          <div className="coach-icon-container">
            <Bot size={28} className="animate-pulse-slow" />
            <div className="orbit-ring" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="db-greeting-text">FitCoach AI</h1>
              <span className="live-pulse-indicator" title="Actively streaming telemetry data">
                <span className="pulse-dot" /> Live Data Sync
              </span>
            </div>
            <p className="db-greeting-sub">Independently connected to your nutrition target databases and activity logs.</p>
          </div>
        </div>
        <div className="fitcoach-header-actions">
          {profile.fitnessLevel && (
            <span className="fitcoach-level-badge">
              <Activity size={12} className="inline mr-1" /> {profile.fitnessLevel}
            </span>
          )}
          <button className="fitcoach-action-btn" onClick={exportChat} title="Export chat session"><Download size={16} /></button>
          <button className="fitcoach-action-btn danger" onClick={clearHistory} title="Clear ongoing session history"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="glass-panel chat-container relative z-10">
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
              <div className="chat-avatar"><Bot size={18} className="animate-spin" /></div>
              <div className="chat-bubble ai typing-indicator">
                <span>Analyzing Logs</span>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enriched Quick Actions */}
        {showQuickActions && !loading && (
          <div className="quick-actions">
            <div className="quick-actions-label"><Sparkles size={14} className="text-violet-400" /> Context-Aware AI Suggestions</div>
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
            className="form-control premium-input"
            placeholder="Ask about your workout history, recent nutrition calories, Indian diets..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary btn-icon-only premium-send" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FitCoach;
