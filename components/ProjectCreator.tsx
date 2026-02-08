
import React, { useState } from 'react';
import { Wand2, ArrowRight, X, FileText, Sparkles, Check } from 'lucide-react';
import Button from './Button';
import { generateQuestionsFromGoal } from '../services/geminiService';
import { Question } from '../types';

interface ProjectCreatorProps {
  onClose: () => void;
  onSave: (title: string, goal: string, questions: Question[]) => void;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!goal || !title) return;
    setLoading(true);
    try {
      const qs = await generateQuestionsFromGoal(goal);
      setQuestions(qs);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Strategic Assessment</h2>
            <p className="text-sm text-slate-500">Design your outputs first with Formly AI.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Strategic Alignment Survey"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">What is the desired outcome or decision?</label>
                <textarea 
                  rows={4}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. We need to decide if the team is ready to move to a hybrid-first model, considering infrastructure costs and employee sentiment."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none bg-white"
                />
                <p className="text-xs text-slate-400">Describe the insight you want to generate. Our AI will work backwards to create the right questions.</p>
              </div>

              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-white text-purple-600 shadow-sm">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-900 mb-1">AI-Powered Synthesis</h4>
                  <p className="text-xs text-purple-700/80 leading-relaxed">
                    Formly will automatically identify relevant evidence respondents should review and construct a weighted question set optimized for decision intelligence.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-purple-600 font-semibold mb-2">
                <Sparkles size={18} />
                <span>AI Generated Questions</span>
              </div>
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-100 bg-white">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Q{idx+1} • {q.type}</span>
                      {q.requiredEvidence && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                          <FileText size={10} /> Evidence Required
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 font-medium">{q.text}</p>
                    {q.options && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.options.map((opt, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="px-8 py-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${step === i ? 'bg-purple-600' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            {step === 1 ? (
              <Button onClick={handleGenerate} loading={loading} disabled={!goal || !title}>
                Generate Assessment <ArrowRight size={18} className="ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => onSave(title, goal, questions)}>
                  Finish & Launch <Check size={18} className="ml-2" />
                </Button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProjectCreator;