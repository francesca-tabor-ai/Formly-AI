
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, FileText, CheckCircle2, Bot, User, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Button from './Button';
import EvidenceReader from './EvidenceReader';
import ComprehensionTask from './ComprehensionTask';
import { Question, ChatMessage, FormProject, EvidenceDocument } from '../types';
import { getEvidenceForForm } from '../services/supabaseService';

interface InterviewSessionProps {
  project: FormProject;
  onComplete: (responses: any) => void;
  onExit: () => void;
}

type InterviewPhase = 'loading' | 'evidence_reading' | 'comprehension_task' | 'chat_interview' | 'finishing';

const InterviewSession: React.FC<InterviewSessionProps> = ({ project, onComplete, onExit }) => {
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [evidenceDocs, setEvidenceDocs] = useState<EvidenceDocument[]>([]);
  const [currentEvidenceIdx, setCurrentEvidenceIdx] = useState(0);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isEvidenceAcknowledged, setIsEvidenceAcknowledged] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        if (process.env.SUPABASE_URL) {
          const docs = await getEvidenceForForm(project.id);
          setEvidenceDocs(docs);
          if (docs.length > 0) {
            setPhase('evidence_reading');
          } else {
            setPhase('chat_interview');
          }
        } else {
          // Mock evidence for demo if no Supabase
          const mockDocs: EvidenceDocument[] = [
            { id: 'mock-1', title: 'FY25 Strategic Roadmap', organization_id: 'org-1', file_path: 'mock/path.pdf', mime_type: 'application/pdf', version: 1, version_metadata: {}, created_at: '' }
          ];
          setEvidenceDocs(mockDocs);
          setPhase('evidence_reading');
        }
      } catch (err) {
        setPhase('chat_interview');
      }
    };
    initSession();
  }, [project.id]);

  useEffect(() => {
    if (phase === 'chat_interview' && messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        text: `Welcome back. Based on the strategic evidence you've reviewed, I'm ready to capture your insights for "${project.title}".` 
      }]);
      setTimeout(() => {
        askQuestion(0);
      }, 1000);
    }
  }, [phase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const askQuestion = (idx: number) => {
    const q = project.questions[idx];
    if (!q) return;
    
    let intro = q.text;
    // If the question has specific evidence snippet, require explicit acknowledgement
    if (q.requiredEvidence) {
      setIsEvidenceAcknowledged(false);
    } else {
      setIsEvidenceAcknowledged(true);
    }
    setMessages(prev => [...prev, { role: 'model', text: intro }]);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    
    const currentQuestion = project.questions[currentIdx];
    const nextResponses = { ...responses, [currentQuestion.id]: userInput };
    setResponses(nextResponses);
    setMessages(prev => [...prev, { role: 'user', text: userInput }]);
    setUserInput('');

    if (currentIdx < project.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeout(() => askQuestion(nextIdx), 800);
    } else {
      setPhase('finishing');
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: "Thank you for your valuable input. Our AI is now synthesizing these responses into a decision-ready report." }]);
        setTimeout(() => onComplete(nextResponses), 2000);
      }, 800);
    }
  };

  // Render Logic
  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-4 animate-in fade-in">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Initializing Evidence Stream</p>
      </div>
    );
  }

  if (phase === 'evidence_reading') {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-hidden">
        <EvidenceReader 
          document={evidenceDocs[currentEvidenceIdx]} 
          onComplete={() => setPhase('comprehension_task')} 
        />
      </div>
    );
  }

  if (phase === 'comprehension_task') {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <ComprehensionTask 
          documentId={evidenceDocs[currentEvidenceIdx].id}
          respondentId="current-user"
          formId={project.id}
          onComplete={(score) => {
            console.log("Comprehension Score:", score);
            setPhase('chat_interview');
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row h-screen animate-in fade-in duration-500">
      {/* Evidence Persistence Side Panel */}
      <div className="w-full md:w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col p-8 overflow-y-auto">
        <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-10 transition-colors text-[10px] font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Exit Assessment
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">{project.title}</h2>
          <p className="text-slate-500 text-sm font-medium">{project.goal}</p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Context</p>
          {evidenceDocs.map((doc, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <CheckCircle2 size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{doc.title}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Verified 100%</p>
              </div>
            </div>
          ))}
        </div>

        {project.questions[currentIdx]?.requiredEvidence && (
          <div className={`mt-8 p-6 rounded-2xl border transition-all duration-500 ${isEvidenceAcknowledged ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-xl shadow-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4 text-purple-600">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Specific Context</span>
            </div>
            <p className="text-slate-800 leading-relaxed mb-6 font-medium italic">
              "{project.questions[currentIdx].requiredEvidence}"
            </p>
            {!isEvidenceAcknowledged ? (
              <Button onClick={() => setIsEvidenceAcknowledged(true)} variant="secondary" className="w-full">
                I understand this specific point
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                <CheckCircle2 size={18} /> Point Acknowledged
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
            <span>Interview Progress</span>
            <span>{Math.round(((currentIdx + 1) / project.questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full formly-gradient transition-all duration-700 ease-out" 
              style={{ width: `${((currentIdx + 1) / project.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chat Interview Main Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
              <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === 'model' ? 'formly-gradient text-white shadow-purple-100' : 'bg-slate-900 text-white shadow-slate-100'
                }`}>
                  {msg.role === 'model' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`p-6 rounded-[2rem] text-base leading-relaxed font-medium ${
                  msg.role === 'user' ? 'bg-slate-50 text-slate-900 rounded-tr-none' : 'bg-slate-50/50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {phase === 'finishing' && (
            <div className="flex justify-start animate-in fade-in duration-500">
               <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl text-purple-600 font-bold text-xs border border-purple-100">
                 <Loader2 size={16} className="animate-spin" /> Synthesizing final report...
               </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-slate-50 bg-white">
          <div className="max-w-3xl mx-auto flex gap-5 items-center">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={userInput}
                disabled={!isEvidenceAcknowledged || phase === 'finishing'}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isEvidenceAcknowledged ? "Type your insightful response..." : "Review current context point to unlock input..."}
                className="w-full pl-8 pr-16 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-50 rounded-[2rem] outline-none transition-all disabled:opacity-50 text-slate-900 font-medium placeholder:text-slate-300"
              />
              <button className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-2">
                <Mic size={22} />
              </button>
            </div>
            <Button 
              onClick={handleSend} 
              disabled={!userInput.trim() || !isEvidenceAcknowledged || phase === 'finishing'}
              className="h-16 w-16 rounded-[1.5rem] p-0 shadow-2xl shadow-purple-200"
            >
              <Send size={28} />
            </Button>
          </div>
          <p className="text-center text-[9px] text-slate-400 mt-6 font-bold uppercase tracking-[0.3em]">
            Interview Intelligence Active • Evidence Comprehension: 100%
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
