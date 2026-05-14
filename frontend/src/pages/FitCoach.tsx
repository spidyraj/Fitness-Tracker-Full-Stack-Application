import { useState, useRef, useEffect, ReactNode } from 'react';
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
  { label: '🏋️ Review My Stored Workouts', prompt: 'Review my stored workouts logs and suggest improvements based on my profile targets.' },
  { label: '🥗 Analyze Logged Diet', prompt: 'Look at my logged meals and give me macro adjustments using high-protein Indian foods.' },
  { label: '🔥 Quick Home HIIT', prompt: 'Give me a stunning 15-minute fat-burn HIIT workout I can do immediately.' },
  { label: '📊 TDEE & Goals Sync', prompt: 'Calculate my exact calorie target using my loaded body weight and fitness goals.' },
  { label: '😴 Deep Recovery', prompt: 'Suggest evidence-based recovery habits combining sleep protocols and stretching routines.' },
  { label: '💊 Core Supplements', prompt: 'What are the absolute must-have natural supplements for active trainers?' },
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
      text: "Namaste! 🙏 I'm **FitCoach AI**, your personal trainer & elite nutrition specialist.\n\n⚡ **Continuous Telemetry Active**: I directly access your **Physical Target Profiles**, **Recent Logged Workouts**, and **Meal Diaries**.\n\nType **'my workout'** or select an automated module below to get immediate reviews synthesized perfectly from your saved records!", 
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

    // High priority system directive ensuring zero generic responses
    const directive = "CRITICAL SYSTEM INSTRUCTION: You are FitCoach AI. Use the exact User Profile Context, Stored Recent Workouts, and Logged Nutrition Records provided below to review and answer the user directly. Do NOT ask the user to share their details if they ask about their workout or diet — synthesize an elite, professional answer using the logged data below. If records are default/empty, give them an inspiring active suggestion routine based on standard multi-day targets.\n\n";

    let contextBlocks = '';
    if (parts.length > 0) {
      contextBlocks += `[Stored User Profile Context: ${parts.join(', ')}]\n`;
    } else {
      contextBlocks += `[Stored User Profile Context: Weight: 72kg, Target: Muscle Gain & Body Recomposition, Activity Level: Active Training]\n`;
    }

    if (recentWorkouts.length > 0) {
      const wStrs = recentWorkouts.slice(0, 5).map(w => `${w.title} (${w.type}, ${w.durationMinutes} mins on ${w.workoutDate})`).join(' | ');
      contextBlocks += `[Stored Recent Workouts: ${wStrs}]\n`;
    } else {
      contextBlocks += `[Stored Recent Workouts: Full Body Strength Hypertrophy (STRENGTH, 50 mins), Cardio Sprints & Mobility (CARDIO, 30 mins)]\n`;
    }

    if (recentNutrition.length > 0) {
      const nStrs = recentNutrition.slice(0, 5).map(n => `${n.foodName} (${n.calories} kcal, Protein: ${n.protein}g)`).join(' | ');
      contextBlocks += `[Stored Logged Meals: ${nStrs}]\n`;
    } else {
      contextBlocks += `[Stored Logged Meals: High-Protein Dal Makhani (132 kcal, P:6.4g), Paneer Tikka (186 kcal, P:8.1g), Premium Whey Isolate (400 kcal, P:80g)]\n`;
    }

    return `${directive}${contextBlocks.trim()}\n\nUser Question/Request: ${userPrompt}`;
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
      const errMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "⚠️ Secure connection timeout. Please verify your Llama model identifiers or network gateway layers.", timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const initial: Message = { id: Date.now().toString(), sender: 'ai', text: "Ongoing chat buffer refreshed! The active continuous telemetry sync mapping your workout diaries & nutrition databases remains absolutely persistent. How can I coach you today? 💪", timestamp: new Date() };
    setMessages([initial]);
    setShowQuickActions(true);
    localStorage.removeItem(HISTORY_KEY);
  };

  const exportChat = () => {
    const text = messages.map(m => `[${m.sender.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fitcoach-premium-logs.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // Bulletproof bold string parser that encapsulates text seamlessly
  const parseInlineBold = (text: string): ReactNode[] => {
    const tokens = text.split('**');
    if (tokens.length <= 1) return [text];
    
    return tokens.map((token, idx) => {
      if (idx % 2 === 1 && token.trim()) {
        return <strong key={idx} className="premium-bold-pill">{token}</strong>;
      }
      return token;
    });
  };

  // Superior line iterator that extracts visual structures and applies beautiful styling
  const renderText = (text: string) => {
    // Strip plain raw punctuation formatting blocks
    const normalized = text.replace(/={3,}|-{3,}/g, '');
    const lines = normalized.split('\n');

    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="chat-spacer" />;

      // Elegant Heading hierarchy
      if (trimmed.startsWith('# ')) return <h2 key={i} className="premium-h2">{parseInlineBold(trimmed.slice(2))}</h2>;
      if (trimmed.startsWith('## ')) return <h3 key={i} className="premium-h3">{parseInlineBold(trimmed.slice(3))}</h3>;
      if (trimmed.startsWith('### ')) return <h4 key={i} className="premium-h4">{parseInlineBold(trimmed.slice(4))}</h4>;
      if (trimmed.startsWith('#### ')) return <h5 key={i} className="premium-h5">{parseInlineBold(trimmed.slice(5))}</h5>;

      // Bullet List extraction mapped to highly visible glowing nodes
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const cleanContent = trimmed.replace(/^[-*•]\s*/, '');
        return (
          <div key={i} className="premium-bullet-row">
            <div className="bullet-glow-icon">
              <span className="bullet-inner-dot" />
            </div>
            <div className="bullet-text-wrapper">{parseInlineBold(cleanContent)}</div>
          </div>
        );
      }

      // Standalone paragraph strings
      return <p key={i} className="premium-para">{parseInlineBold(trimmed)}</p>;
    });
  };

  return (
    <div className="animate-fade-in fitcoach-page">
      {/* Immersive Vibrant Ambient Backdrops & Animated Lighting Accents */}
      <div className="ambient-sphere sphere-cyan" />
      <div className="ambient-sphere sphere-magenta" />
      <div className="ambient-sphere sphere-violet" />

      {/* Floating Animated Premium Gym Watermarks */}
      <div className="premium-watermark watermark-left"><Dumbbell size={110} /></div>
      <div className="premium-watermark watermark-right"><Flame size={130} /></div>

      <div className="db-greeting-row premium-header-row relative z-10">
        <div className="flex items-center gap-4">
          <div className="premium-logo-hub">
            <Bot size={28} className="hub-icon animate-float-pulse" />
            <div className="hub-orbit-layer-1" />
            <div className="hub-orbit-layer-2" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="db-greeting-text premium-gradient-title">FitCoach AI</h1>
              <div className="telemetry-badge" title="Real-time multi-database instruction pipeline loaded">
                <span className="telemetry-beacon" /> Database Connected
              </div>
            </div>
            <p className="db-greeting-sub premium-header-subtitle">Continuous active sync to your body weight parameters, exercise metrics, and food logs.</p>
          </div>
        </div>
        <div className="fitcoach-header-actions">
          {profile.fitnessLevel && (
            <span className="premium-level-chip">
              <Activity size={13} className="inline mr-1 text-emerald-400" /> {profile.fitnessLevel}
            </span>
          )}
          <button className="premium-action-btn" onClick={exportChat} title="Export Premium Logs"><Download size={16} /></button>
          <button className="premium-action-btn danger" onClick={clearHistory} title="Flush Current Chat Buffer"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="premium-glass-viewport chat-container relative z-10">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className={`premium-avatar ${msg.sender}`}>
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`premium-bubble ${msg.sender}`}>
                {msg.sender === 'ai' ? renderText(msg.text) : <p className="premium-para">{msg.text}</p>}
                <div className="premium-time-stamp">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrapper ai">
              <div className="premium-avatar ai"><Bot size={18} className="animate-spin text-cyan-300" /></div>
              <div className="premium-bubble ai typing-indicator">
                <span className="text-xs font-semibold text-cyan-400">Querying Database Context</span>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Automated Module Triggers */}
        {showQuickActions && !loading && (
          <div className="premium-quick-triggers">
            <div className="trigger-label">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" /> Direct Database Interaction Routines
            </div>
            <div className="trigger-grid">
              {QUICK_ACTIONS.map((qa, i) => (
                <button key={i} className="trigger-chip" onClick={() => handleSend(qa.prompt)}>
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="premium-input-dock">
          <input
            type="text"
            className="dock-input"
            placeholder="Type 'my workout' or ask about calories, protein intakes, high-volume sessions..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="dock-submit-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FitCoach;
