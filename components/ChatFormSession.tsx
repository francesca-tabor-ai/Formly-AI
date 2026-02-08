
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Bot, User, Loader2, Sparkles, X, ChevronDown, MessageSquare, AlertCircle } from 'lucide-react';
import Button from './Button';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import { ChatMessage, FormProject } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { apiChatInterview, ApiStatus } from '../services/api';

interface ChatFormSessionProps {
  project: FormProject;
  onComplete: (responses: any) => void;
  onClose: () => void;
}

const ChatFormSession: React.FC<ChatFormSessionProps> = ({ project, onComplete, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ApiStatus>('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [convId] = useState(() => crypto.randomUUID()); // Persistent for session
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI welcome
    setStatus('analyzing');
    setTimeout(() => {
      const firstMsg: ChatMessage = {
        role: 'model',
        text: `Hello! I'm here to guide you through the "${project.title}" assessment. We want to understand: "${project.goal}".`
      };
      setMessages([firstMsg]);
      setStatus('idle');
      
      setTimeout(() => {
        askQuestion(0);
      }, 1000);
    }, 1200);

    if (isSupabaseConfigured()) {
      const subscription = supabase
        .channel(`chat_${convId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages' }, (payload) => {
          console.log('Remote context synced:', payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const askQuestion = (idx: number) => {
    if (idx >= project.questions.length) {
      finishChat();
      return;
    }
    const q = project.questions[idx];
    setMessages(prev => [...prev, { role: 'model', text: q.text }]);
  };

  const handleSend = async () => {
    if (!input.trim() || status !== 'idle') return;
    
    const userText = input;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    
    const qId = project.questions[currentQuestionIdx].id;
    setResponses(prev => ({ ...prev, [qId]: userText }));
    
    // Call adaptive API
    const result = await apiChatInterview({
      conversationId: convId,
      goal: project.goal,
      history: [...messages, userMsg],
      currentQuestion: project.questions[currentQuestionIdx].text,
      userResponse: userText
    }, (newStatus) => setStatus(newStatus));

    if (result.success && result.adaptiveResponse) {
      setMessages(prev => [...prev, { role: 'model', text: result.adaptiveResponse }]);
      
      // Move to next static question after adaptive probe
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setTimeout(() => askQuestion(nextIdx), 2000);
    } else {
      // Fallback
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      askQuestion(nextIdx);
    }
  };

  const finishChat = () => {
    setStatus('synthesizing');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Incredible depth. I've finished mapping your perspective to our strategic pillars. The dashboard will update with your weighted insights shortly." 
      }]);
      setStatus('idle');
      setTimeout(() => onComplete(responses), 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-500">
      <header className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl formly-gradient flex items-center justify-center text-white shadow-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{project.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} className="text-purple-500" /> Adaptive Interview Layer Active
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 bg-slate-50/30">
        <div className="max-w-3xl mx-auto space-y-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'model' ? 'formly-gradient text-white' : 'bg-slate-900 text-white'
                }`}>
                  {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`p-6 rounded-[2rem] text-sm md:text-base leading-relaxed font-medium shadow-sm border ${
                  msg.role === 'user' 
                  ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' 
                  : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {status !== 'idle' && status !== 'error' && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl formly-gradient flex items-center justify-center text-white opacity-50">
                  <Bot size={20} />
                </div>
                <div className="px-6 py-4 bg-white border border-slate-100 rounded-[2rem] rounded-tl-none flex gap-3 items-center shadow-sm">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{status}...</span>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex justify-center p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 gap-3 text-xs font-bold">
              <AlertCircle size={16} /> Connection to Adaptive Layer Interrupted.
            </div>
          )}
        </div>
      </div>

      <div className="p-6 md:p-10 bg-white border-t border-slate-50 relative">
        {showVoiceRecorder && (
          <div className="absolute bottom-full left-0 right-0 p-6 flex justify-center pb-10">
            <div className="max-w-xl w-full">
              <VoiceNoteRecorder 
                onTranscriptionComplete={(text) => {
                  setInput(text);
                  setShowVoiceRecorder(false);
                }}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className={`p-4 rounded-2xl transition-all ${
                showVoiceRecorder ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-900'
              }`}
            >
              <Mic size={24} />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Share your perspective..."
                className="w-full px-8 py-5 bg-white border-2 border-slate-100 focus:bg-white focus:border-slate-900 rounded-[2rem] outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300 pr-16"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || status !== 'idle'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Loader2 size={12} className="text-purple-500 animate-spin" /> Semantic Weighted Engine Engaged
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Interview ID: {convId.substring(0,8)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFormSession;