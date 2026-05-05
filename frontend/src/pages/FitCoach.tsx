import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, User } from 'lucide-react';
import './FitCoach.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const FitCoach = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: "Hi there! I'm FitCoach AI. Ask me for fitness advice or training tips!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use the contextual coach endpoint if possible, but for simplicity we'll use chat
      const response = await api.post('/ai/chat', { prompt: userMessage.text });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat failed", error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "Sorry, I'm having trouble connecting to my brain. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Convert simple markdown-like syntax to HTML just for bold text and lists
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="animate-fade-in fitcoach-page">
      <div className="db-greeting-row">
        <div>
          <h1 className="db-greeting-text">FitCoach AI</h1>
          <p className="db-greeting-sub">Your elite personal trainer powered by Groq Llama 3.1</p>
        </div>
      </div>

      <div className="glass-panel chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`chat-bubble ${msg.sender}`}>
                {formatText(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble-wrapper ai">
              <div className="chat-avatar"><Bot size={20} /></div>
              <div className="chat-bubble ai typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ask for a workout plan or nutrition advice..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn-primary btn-icon-only" disabled={loading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FitCoach;
