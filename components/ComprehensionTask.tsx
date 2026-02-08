
import React, { useState } from 'react';
import { Target, Check, HelpCircle, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import Button from './Button';
import { apiScoreComprehension, ApiStatus } from '../services/api';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface ComprehensionTaskProps {
  documentId: string;
  respondentId: string;
  formId: string;
  onComplete: (score: number) => void;
}

const ComprehensionTask: React.FC<ComprehensionTaskProps> = ({ documentId, respondentId, formId, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<ApiStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultScore, setResultScore] = useState<number | null>(null);

  // Simulated questions for this document
  const questions: Question[] = [
    {
      id: 'q1',
      text: 'Which phase of implementation targets regional budget autonomy?',
      options: ['Phase 1 (Q1-Q2)', 'Phase 2 (Q3-Q4)', 'Initial Assessment'],
      correctAnswer: 0
    },
    {
      id: 'q2',
      text: 'What is a key risk identified with decentralization?',
      options: ['Higher direct costs', 'Regional communication lag', 'Staff turnover'],
      correctAnswer: 1
    }
  ];

  const handleSelect = (qId: string, optIdx: number) => {
    if (resultScore !== null) return; // Prevent change after scoring
    setAnswers({ ...answers, [qId]: optIdx });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError("Please address all understanding checks.");
      return;
    }

    setError(null);
    const response = await apiScoreComprehension({
      respondentId,
      documentId,
      formId,
      answers
    }, (newStatus) => setStatus(newStatus));

    if (response.success && response.score !== undefined) {
      setResultScore(response.score);
    } else {
      setError(response.error || "Unable to sync comprehension metrics.");
    }
  };

  const isLowScore = resultScore !== null && resultScore < 0.7;

  return (
    <div className="max-w-xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full formly-gradient flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-purple-100">
          <Target size={32} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Understanding Check</h2>
        <p className="text-slate-500 mt-2 font-medium">Validating your grasp of the strategic context.</p>
      </div>

      <div className="space-y-10">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex gap-3">
              <span className="text-slate-300">0{qIdx + 1}</span> {q.text}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelect(q.id, oIdx)}
                  disabled={resultScore !== null}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 font-medium ${
                    answers[q.id] === oIdx
                    ? resultScore !== null 
                      ? oIdx === q.correctAnswer ? 'border-green-500 bg-green-50 text-green-900' : 'border-red-500 bg-red-50 text-red-900'
                      : 'border-slate-900 bg-slate-900 text-white shadow-xl'
                    : 'border-slate-100 bg-white hover:border-slate-200 text-slate-600'
                  } ${resultScore !== null && oIdx === q.correctAnswer && answers[q.id] !== oIdx ? 'border-green-200 bg-green-50/30' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt}</span>
                    {answers[q.id] === oIdx && (
                      resultScore !== null 
                      ? oIdx === q.correctAnswer ? <Check size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />
                      : <Check size={18} className="text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {resultScore !== null && (
        <div className={`mt-10 p-8 rounded-[2rem] animate-in slide-in-from-bottom-4 border ${
          isLowScore ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl bg-white shadow-sm ${isLowScore ? 'text-orange-600' : 'text-green-600'}`}>
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Result</p>
              <h3 className="text-xl font-bold text-slate-900">
                {resultScore * 100}% Comprehension Verified
              </h3>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
            {isLowScore 
              ? "Your comprehension score is below the high-trust threshold. You may continue, but your responses will be weighted accordingly." 
              : "Excellent. You have demonstrated a clear understanding of the strategic context. Your inputs carry full organizational weight."}
          </p>
          <Button 
            onClick={() => onComplete(resultScore)} 
            className={`w-full ${isLowScore ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
          >
            Enter Assessment Stream <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {resultScore === null && (
        <div className="mt-12 pt-8 border-t border-slate-100">
          <Button 
            onClick={handleSubmit} 
            loading={status === 'scoring'} 
            className="w-full py-5 text-lg shadow-2xl shadow-purple-100"
          >
            {status === 'scoring' ? 'Validating Credentials...' : 'Verify Understanding'}
          </Button>
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-2">
            <HelpCircle size={12} /> Secure response validation active
          </p>
        </div>
      )}
    </div>
  );
};

export default ComprehensionTask;
