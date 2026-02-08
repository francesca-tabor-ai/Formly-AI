
import React from 'react';
import { History, ShieldCheck, FileText, ChevronRight, Binary, ArrowDown } from 'lucide-react';

const MOCK_EVENTS = [
  { id: '1', type: 'decision', title: 'Q3 Hybrid Strategy Formalized', meta: 'Decided by: Exec Council', date: 'Just now', score: 92 },
  { id: '2', type: 'simulation', title: 'Simulation: Full Remote Baseline', meta: 'Predictive ROI: 1.2x', date: '2h ago', score: 45 },
  { id: '3', type: 'simulation', title: 'Simulation: Hybrid - Segment Weighted', meta: 'Predictive ROI: 3.4x', date: '4h ago', score: 88 },
  { id: '4', type: 'insight', title: 'Engineering Sentiment Anomaly Detected', meta: 'Outlier Drift: 0.82', date: 'Yesterday', score: 14 }
];

const DecisionTimeline: React.FC = () => {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <History size={16} className="text-slate-400" /> Strategic Governance Trail
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4 Record Points</span>
      </div>

      <div className="relative space-y-12">
        <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-slate-50" />
        
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="relative flex gap-10 group items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${
              event.type === 'decision' ? 'bg-slate-900 text-white shadow-slate-200' :
              event.type === 'simulation' ? 'bg-purple-50 text-purple-600 shadow-purple-50' : 'bg-slate-50 text-slate-400 shadow-sm shadow-slate-50'
            }`}>
              {event.type === 'decision' ? <ShieldCheck size={24} /> :
               event.type === 'simulation' ? <Binary size={24} /> : <FileText size={24} />}
            </div>
            
            <div className="flex-1 pt-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors truncate">{event.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">{event.date}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-3">{event.meta}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${
                    event.type === 'decision' ? 'bg-slate-900' : 
                    event.type === 'simulation' ? 'bg-purple-400' : 'bg-orange-400'
                  }`} style={{ width: `${event.score}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{event.score}% Impact</span>
              </div>
            </div>

            <div className="p-2 rounded-xl text-slate-200 group-hover:text-slate-400 transition-colors">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-10 border-t border-slate-50 text-center">
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto">
          <ArrowDown size={14} /> Full Governance Audit Log
        </button>
      </div>
    </div>
  );
};

export default DecisionTimeline;
