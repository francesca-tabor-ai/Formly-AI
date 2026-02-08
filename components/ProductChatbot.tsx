
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Button from './Button';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ProductChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your Formly Guide. Need help setting up an assessment or understanding our semantic weighting logic?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMsg].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are a helpful, expert product guide for Formly AI. Formly AI is an AI-native assessment platform. Key features include: Evidence-Aware Workflows (respondents must review docs before answering), Semantic Weighting (responses are weighted by comprehension and role), and Predictive Sandboxes (simulating strategic pivots). Be concise, professional, and friendly. Use humanist sans-serif tone—serious but not intimidating.",
          temperature: 0.7,
        },
      });

      const aiText = response.text || "I'm having trouble connecting to my knowledge base. How else can I assist you?";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered a minor logic drift. Could you try asking that again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-96 max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
          <header className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl formly-gradient flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Formly Guide</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligent Agent</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'model' ? 'formly-gradient text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed font-medium shadow-sm border ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' 
                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl formly-gradient flex items-center justify-center text-white opacity-50">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none flex gap-2 items-center shadow-sm">
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesizing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex flex-wrap gap-2 mb-4">
              {["How does weighting work?", "What is a sandbox?", "Help me build a form"].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="w-full px-6 py-4 bg-white border-2 border-slate-100 focus:border-slate-900 rounded-[1.5rem] outline-none transition-all text-sm font-medium pr-12"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl disabled:opacity-20 hover:bg-black transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 active:scale-95 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'formly-gradient hover:scale-110 hover:rotate-6'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ProductChatbot;
