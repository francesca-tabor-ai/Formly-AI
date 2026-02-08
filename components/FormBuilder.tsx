
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, GripVertical, Layers, Target, 
  Info, Sparkles, Save, X, Wand2, AlertCircle, Eye,
  Layout, Settings2, MousePointer2, ChevronRight, Check, RefreshCw, Briefcase, ShoppingCart,
  ArrowRight, Users, Hash
} from 'lucide-react';
import Button from './Button';
import { Question, Segment, SectorModel } from '../types';
import { apiGenerateQuestions, ApiStatus } from '../services/api';
import { getSectorModels } from '../services/supabaseService';

interface FormBuilderProps {
  onSave: (title: string, questions: Question[], segmentIds: string[]) => void;
}

const MOCK_SEGMENTS: Segment[] = [
  { id: 'seg-1', organization_id: 'org-1', name: 'Engineering', description: 'Technical contributors and architects' },
  { id: 'seg-2', organization_id: 'org-1', name: 'Product & Design', description: 'UX, UI, and Product Managers' },
  { id: 'seg-3', organization_id: 'org-1', name: 'Operations', description: 'Logistics, HR, and Facility management' },
  { id: 'seg-4', organization_id: 'org-1', name: 'Executive Leadership', description: 'Strategic decision makers' },
];

const FormBuilder: React.FC<FormBuilderProps> = ({ onSave }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { id: '1', text: '', type: 'text', requiredEvidence: '', segment_ids: [] }
  ]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [sectorModels, setSectorModels] = useState<SectorModel[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('General');
  
  const questionsEndRef = useRef<HTMLDivElement>(null);

  // AI Assistant States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState<ApiStatus>('idle');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPreviewData, setAiPreviewData] = useState<Question[] | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const models = await getSectorModels();
        setSectorModels(models);
      } catch (e) {
        console.error("Failed to load sector models", e);
      }
    };
    fetchSectors();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      text: '', 
      type: 'text', 
      requiredEvidence: '',
      segment_ids: []
    }]);
    
    setTimeout(() => {
      questionsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const toggleQuestionSegment = (qId: string, segmentId: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;

    const currentSegments = q.segment_ids || [];
    const newSegments = currentSegments.includes(segmentId)
      ? currentSegments.filter(id => id !== segmentId)
      : [...currentSegments, segmentId];

    updateQuestion(qId, { segment_ids: newSegments });
  };

  const toggleGlobalSegment = (id: string) => {
    setSelectedSegments(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please provide a title for this assessment.");
      return;
    }
    onSave(title, questions as Question[], selectedSegments);
  };

  const handleAiGenerate = async () => {
    setAiError(null);
    setAiPreviewData(null);
    
    const result = await apiGenerateQuestions(aiPrompt, (status) => setAiStatus(status));
    
    if (result.success && result.data) {
      setAiPreviewData(result.data);
    } else {
      setAiError(result.error || "Generation failed.");
    }
  };

  const commitAiQuestions = () => {
    if (aiPreviewData) {
      const sanitizedAiQuestions = aiPreviewData.map((q, idx) => ({
        ...q,
        id: `ai-${Date.now()}-${idx}`,
        segment_ids: [] // Default to all selected global segments
      }));

      const isInitialState = questions.length === 1 && !questions[0].text;
      const baseQuestions = isInitialState ? [] : questions;
      
      setQuestions([...baseQuestions, ...sanitizedAiQuestions]);
      
      setIsAiModalOpen(false);
      setAiPrompt('');
      setAiPreviewData(null);
      setAiStatus('idle');

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const applyMSQuizTemplate = () => {
    setTitle('M&S Employee AI Awareness & Opportunity Quiz');
    setSelectedSector('Retail');
    setAiPrompt('Measure frontline employee sentiment regarding AI tool adoption and identify specific operational friction points in retail stores at M&S.');
    setIsAiModalOpen(true);
  };

  const getStatusText = () => {
    switch (aiStatus) {
      case 'analyzing': return 'Deconstructing strategic goal...';
      case 'synthesizing': return 'Generating optimized inquiries...';
      case 'mapping': return 'Cross-referencing organizational weights...';
      case 'finalizing': return 'Finalizing architecture...';
      case 'success': return 'Architecture ready for review';
      default: return 'Processing...';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Editor</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Logic & Flow</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assessment Architect</h1>
          <p className="text-slate-500 mt-1 font-medium">Define your inquiry logic and organizational targeting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="px-4"><Eye size={18} className="mr-2" /> Preview</Button>
          <Button onClick={handleSave} className="shadow-xl shadow-purple-100">
            <Save size={18} className="mr-2" /> Launch Assessment
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <section className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:bg-slate-100 group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">M&S Employee AI Awareness Quiz</h4>
                  <p className="text-xs text-slate-400 font-medium">Retail Sector • High Integrity Framework</p>
                </div>
             </div>
             <button 
                onClick={applyMSQuizTemplate}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 hover:border-slate-900 transition-all flex items-center gap-2 shadow-sm"
              >
                Apply Framework <ArrowRight size={14} />
             </button>
          </section>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full formly-gradient opacity-0 group-focus-within:opacity-100 transition-opacity" />
            
            <div className="mb-10">
              <label htmlFor="project-title" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Project Title</label>
              <input 
                id="project-title"
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FY25 Strategic Drift Audit"
                className="text-3xl font-bold w-full border-none focus:ring-0 placeholder:text-slate-100 p-0 text-slate-900 bg-white"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layout size={16} className="text-slate-400" /> Assessment Flow
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{questions.length} Question{questions.length !== 1 ? 's' : ''}</span>
              </div>
              
              {questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className="group flex flex-col p-6 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 animate-in slide-in-from-left-2"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="pt-2 text-slate-200 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing" title="Drag to reorder">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="flex-1 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <textarea
                            aria-label={`Question ${index + 1} text`}
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id!, { text: e.target.value })}
                            placeholder={`Question ${index + 1}: What is the core insight needed here?`}
                            className="w-full bg-white border-none focus:ring-0 text-lg font-bold resize-none p-0 placeholder:text-slate-200 min-h-[1.5em] text-slate-800"
                            rows={1}
                          />
                        </div>
                        <div className="relative">
                          <select 
                            aria-label="Question response type"
                            value={q.type}
                            onChange={(e) => updateQuestion(q.id!, { type: e.target.value as any })}
                            className="appearance-none text-[10px] font-bold uppercase tracking-widest bg-white border border-slate-100 rounded-xl px-4 py-2 pr-8 outline-none text-slate-500 hover:border-slate-200 focus:border-purple-200 transition-all cursor-pointer shadow-sm"
                          >
                            <option value="text">Conversational</option>
                            <option value="scale">Linear Scale</option>
                            <option value="choice">Multi Choice</option>
                          </select>
                          <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-6 border-t border-slate-100/60 pt-5">
                        <div className="flex items-center gap-3 flex-1 group/evidence">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 group-focus-within/evidence:bg-purple-50 group-focus-within/evidence:text-purple-600 transition-colors">
                            <Info size={14} />
                          </div>
                          <input 
                            aria-label="Contextual evidence snippet"
                            type="text"
                            value={q.requiredEvidence}
                            onChange={(e) => updateQuestion(q.id!, { requiredEvidence: e.target.value })}
                            placeholder="Compulsory evidence review for respondent..."
                            className="text-xs text-slate-500 bg-white border-none focus:ring-0 p-0 w-full placeholder:text-slate-300 font-medium italic"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeQuestion(q.id!)}
                      aria-label="Delete question"
                      className="p-2 opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl active:scale-90 h-fit self-start"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* New: Granular Segment Targeting UI */}
                  <div className="mt-2 pl-9">
                    <div className="flex items-center gap-2 mb-3">
                       <Target size={12} className="text-slate-400" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Specific Segments (Leave empty for all)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_SEGMENTS.map(seg => {
                        const isSelected = q.segment_ids?.includes(seg.id);
                        return (
                          <button
                            key={seg.id}
                            onClick={() => toggleQuestionSegment(q.id!, seg.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                              isSelected 
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {seg.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={questionsEndRef} />

              <button 
                onClick={addQuestion}
                className="w-full py-6 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-3 font-bold text-sm bg-white"
              >
                <Plus size={22} /> Add Manual Question
              </button>
            </div>
          </div>

          <section className="p-1 rounded-[2.5rem] formly-gradient shadow-2xl shadow-purple-100 group transition-all hover:scale-[1.01]">
            <div className="p-8 rounded-[calc(2.5rem-4px)] bg-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-[2rem] bg-purple-50 text-purple-600 group-hover:rotate-12 transition-transform duration-500">
                  <Wand2 size={28} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 tracking-tight">Formly AI Assistant</p>
                  <p className="text-sm text-slate-500 font-medium">Work backwards from your goal to create optimized inquiries.</p>
                </div>
              </div>
              <Button size="md" onClick={() => setIsAiModalOpen(true)} className="w-full md:w-auto px-10">
                <Sparkles size={18} className="mr-2" /> Initiate AI Build
              </Button>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-slate-400" /> Sector Model
              </h3>
            </div>
            <div className="relative mb-8">
              <select 
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full appearance-none px-6 py-4 rounded-[1.5rem] bg-white border border-slate-100 focus:border-purple-200 focus:ring-4 focus:ring-purple-50 outline-none text-sm font-bold text-slate-900 transition-all cursor-pointer shadow-sm"
              >
                <option value="General">General (Default)</option>
                {sectorModels.map(m => (
                  <option key={m.id} value={m.sector_name}>{m.sector_name}</option>
                ))}
              </select>
              <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-slate-400" /> Global Targeting
              </h3>
              <button className="text-slate-300 hover:text-slate-900 transition-colors">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-3" role="group" aria-label="Respondent segments">
              {MOCK_SEGMENTS.map(segment => (
                <button
                  key={segment.id}
                  onClick={() => toggleGlobalSegment(segment.id)}
                  aria-pressed={selectedSegments.includes(segment.id)}
                  className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-500 ${
                    selectedSegments.includes(segment.id)
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200'
                    : 'border-slate-50 bg-white hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold tracking-tight">{segment.name}</span>
                    {selectedSegments.includes(segment.id) ? (
                      <div className="p-1 rounded-full bg-white text-slate-900">
                        <Layers size={12} />
                      </div>
                    ) : (
                      <MousePointer2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${selectedSegments.includes(segment.id) ? 'text-slate-400' : 'text-slate-400'}`}>
                    {segment.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Weighting Strategy</p>
              <div className="p-5 rounded-3xl bg-white border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-700">Role Authority</span>
                  <span className="text-[10px] font-bold text-purple-600">Dynamic</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full formly-gradient w-2/3" />
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                  Responses are weighted by organizational reach and evidence comprehension scores.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100/50 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings2 size={16} className="text-slate-400" /> Advanced Logic
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Anonymous Mode</span>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Voice Synthesis</span>
                <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* AI Assistant Modal - Enhanced for Scrollability */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-10 pt-10 pb-6 flex-shrink-0 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl formly-gradient text-white shadow-lg shadow-purple-100">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Assessment Builder</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Prompt Engineering</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsAiModalOpen(false); setAiPreviewData(null); setAiStatus('idle'); }} 
                className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="px-10 pb-10 flex-1 overflow-y-auto custom-scrollbar">
              {!aiPreviewData ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div>
                    <label htmlFor="ai-prompt" className="text-sm font-bold text-slate-900 block mb-3">Define your strategic goal</label>
                    <div className="relative group/input">
                      <textarea 
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Audit regional alignment on our carbon-neutral commitment. I want to know where the roadblocks are in APAC specifically."
                        className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-100 bg-white focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-200 min-h-[160px] font-medium leading-relaxed"
                        disabled={aiStatus !== 'idle' && aiStatus !== 'error'}
                      />
                      <div className="absolute bottom-6 right-6 text-slate-200">
                        <Sparkles size={24} />
                      </div>
                    </div>
                    {aiError && (
                      <div className="flex items-center gap-3 mt-4 text-red-500 text-sm font-bold p-4 bg-red-50 rounded-2xl animate-in slide-in-from-top-2">
                        <AlertCircle size={18} /> {aiError}
                      </div>
                    )}
                  </div>

                  {aiStatus !== 'idle' && aiStatus !== 'error' && (
                    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-6 animate-in zoom-in-95">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{getStatusText()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Formly Intelligence Engine Active</p>
                      </div>
                    </div>
                  )}

                  {aiStatus === 'idle' && (
                    <div className="p-8 rounded-3xl bg-white border border-slate-100/50 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">System Guidance</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Our model analyzes your objective to generate inquiries that bridge the gap between simple forms and decision-ready dashboards.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 text-green-600 mb-6 bg-green-50 p-4 rounded-2xl border border-green-100 sticky top-0 z-10 backdrop-blur-md">
                    <Check size={20} />
                    <span className="text-sm font-bold">Architecture ready for review.</span>
                  </div>
                  
                  {aiPreviewData.map((q, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiry {idx + 1} • {q.type}</span>
                        {q.requiredEvidence && <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1"><Info size={10} /> Contextual</span>}
                      </div>
                      <p className="text-base font-bold text-slate-800 leading-relaxed">{q.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row justify-end gap-4 mt-auto flex-shrink-0">
              {!aiPreviewData ? (
                <>
                  <Button variant="ghost" onClick={() => { setIsAiModalOpen(false); setAiStatus('idle'); }} disabled={aiStatus !== 'idle' && aiStatus !== 'error'} className="font-bold">Discard</Button>
                  <Button 
                    onClick={handleAiGenerate} 
                    loading={aiStatus !== 'idle' && aiStatus !== 'error'} 
                    disabled={!aiPrompt.trim()} 
                    className="px-12 py-5 text-lg shadow-xl shadow-purple-100"
                  >
                    Build Assessment <Sparkles size={18} className="ml-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setAiPreviewData(null); setAiStatus('idle'); }} className="font-bold">
                    <RefreshCw size={18} className="mr-2" /> Re-generate
                  </Button>
                  <Button onClick={commitAiQuestions} className="px-12 py-5 text-lg shadow-xl shadow-purple-100">
                    Integrate Into Architect <Check size={18} className="ml-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
