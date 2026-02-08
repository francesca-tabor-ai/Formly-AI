
import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, CheckCircle2, Clock, BookOpen, ChevronDown, Lock } from 'lucide-react';
import { EvidenceDocument } from '../types';
import { getSecureEvidenceLink } from '../services/storageService';
import Button from './Button';

interface EvidenceReaderProps {
  document: EvidenceDocument;
  onComplete: () => void;
}

const EvidenceReader: React.FC<EvidenceReaderProps> = ({ document, onComplete }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [sectionsRead, setSectionsRead] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Simulated sections for the "focused reading" experience
  const sections = [
    { title: "Executive Overview", content: "This document outlines the strategic pivot for FY25, focusing on operational decentralization and regional autonomy." },
    { title: "Risk Framework", content: "Key risks identified include cross-regional communication lag and potential brand dilution if standards are not centralized." },
    { title: "Implementation Timeline", content: "Phase 1 (Q1-Q2) involves the migration of regional leadership to autonomous budget management." }
  ];

  useEffect(() => {
    const fetchLink = async () => {
      const url = await getSecureEvidenceLink(document.file_path);
      setSignedUrl(url);
    };
    fetchLink();
  }, [document]);

  const toggleSection = (index: number) => {
    if (!sectionsRead.includes(index)) {
      setSectionsRead([...sectionsRead, index]);
    }
  };

  const progress = (sectionsRead.length / sections.length) * 100;

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-700">
      <header className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white text-purple-600 shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{document.title}</h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              <span className="flex items-center gap-1"><Clock size={10} /> 4 min read</span>
              <span className="flex items-center gap-1"><Lock size={10} /> Encrypted Context</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reading Progress</p>
            <p className="text-xs font-bold text-slate-900">{Math.round(progress)}%</p>
          </div>
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full formly-gradient transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-12 max-w-3xl mx-auto w-full">
        <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 flex gap-4">
          <div className="p-2 h-fit rounded-lg bg-white text-purple-600 shadow-sm">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-xs text-purple-800 leading-relaxed font-medium">
            Formly AI requires you to acknowledge each section of this evidence before continuing. This ensures high-quality, informed data collection.
          </p>
        </div>

        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className={`transition-all duration-500 ${idx > sectionsRead.length ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                {idx + 1}
              </span>
              <h4 className="text-xl font-bold text-slate-900">{section.title}</h4>
            </div>
            
            <div className="pl-9 space-y-6">
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {section.content}
              </p>
              
              {!sectionsRead.includes(idx) ? (
                <Button 
                  onClick={() => toggleSection(idx)}
                  variant="outline" 
                  size="sm"
                  className="hover:border-purple-200 hover:text-purple-600 transition-all"
                >
                  Confirm Understanding <ChevronDown size={16} className="ml-2" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-bold text-xs py-2">
                  <CheckCircle2 size={16} /> Section Acknowledged
                </div>
              )}
            </div>
          </div>
        ))}

        {progress === 100 && (
          <div className="pt-10 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-[2rem] bg-slate-900 text-white flex items-center justify-between gap-6 shadow-2xl shadow-slate-200">
              <div>
                <p className="text-xl font-bold mb-1">Knowledge Verified</p>
                <p className="text-sm text-slate-400 font-medium">You are now ready to provide informed responses.</p>
              </div>
              <Button onClick={onComplete} size="lg" className="px-10 shadow-xl shadow-purple-500/20">
                Proceed to Inquiry <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceReader;
