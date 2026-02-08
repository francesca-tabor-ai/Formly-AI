
import React, { useState } from 'react';
import { 
  Search, Filter, MoreHorizontal, Eye, Edit3, 
  Trash2, Copy, ChevronRight, FileText, 
  Calendar, MessageSquare, Target, CheckCircle2,
  Clock, AlertCircle, Archive
} from 'lucide-react';
import { FormProject } from '../types';
import Button from './Button';

interface AssessmentsViewProps {
  projects: FormProject[];
  onSelectProject: (p: FormProject) => void;
  onEditProject?: (p: FormProject) => void;
}

const AssessmentsView: React.FC<AssessmentsViewProps> = ({ projects, onSelectProject, onEditProject }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         p.goal.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-100">Active</span>;
      case 'draft':
        return <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-100">Draft</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-widest border border-purple-100">Completed</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-100">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Workspace</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Assessments</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Project Management</h1>
          <p className="text-slate-500 font-medium mt-4">
            Browse, manage, and audit your organizational intelligence streams.
          </p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {(['all', 'active', 'draft', 'completed'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Search by title or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-200 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-400 tracking-tight">No assessments found</h2>
            <p className="text-slate-400 max-w-xs mx-auto text-sm">Refine your search or create a new assessment from the Architect.</p>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div 
              key={p.id}
              className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row items-center gap-8"
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white font-bold text-3xl transition-all group-hover:scale-105 group-hover:rotate-3 duration-500 shadow-sm flex-shrink-0 ${
                p.status === 'active' ? 'formly-gradient shadow-purple-100' : 'bg-slate-100 text-slate-300'
              }`}>
                {p.title.charAt(0)}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-slate-900 truncate tracking-tight">{p.title}</h3>
                  {getStatusBadge(p.status)}
                </div>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-slate-400 text-xs font-medium italic">
                  <span className="flex items-center gap-2"><Target size={14} className="text-slate-300" /> Goal: {p.goal}</span>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                    <Calendar size={14} className="text-slate-300" /> Created: {p.createdAt}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                    <MessageSquare size={14} className="text-slate-300" /> {p.responsesCount} Responses
                  </div>
                  {p.status === 'active' && (
                    <div className="flex items-center gap-2 text-green-500 text-[11px] font-bold uppercase tracking-widest">
                      <Clock size={14} className="animate-pulse" /> Live Stream
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {p.status !== 'draft' && (
                  <button 
                    onClick={() => onSelectProject(p)}
                    className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
                  >
                    <Eye size={18} /> View Insights
                  </button>
                )}
                {p.status === 'draft' && (
                  <button 
                    onClick={() => onEditProject?.(p)}
                    className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
                  >
                    <Edit3 size={18} /> Edit Logic
                  </button>
                )}
                <div className="h-10 w-px bg-slate-50" />
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95" title="Duplicate">
                  <Copy size={18} />
                </button>
                <button className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95" title="Archive">
                  <Archive size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100/50 flex items-center justify-between group">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-[2rem] bg-white text-slate-300 group-hover:text-purple-600 shadow-sm transition-all duration-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Audit Visibility</h4>
            <p className="text-xs text-slate-500 font-medium">All changes to assessment logic are cryptographically logged for traceability.</p>
          </div>
        </div>
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
          View Governance Trail <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default AssessmentsView;
