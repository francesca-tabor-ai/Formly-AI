
import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, MessageSquare, Target, Users, Clock, Zap, BarChart3, Loader2, ChevronRight, MoreHorizontal, Sparkles, ShieldCheck, ClipboardCheck } from 'lucide-react';
import Button from './Button';
import ResponseChart from './ResponseChart';
import { FormProject } from '../types';
import { getForms } from '../services/supabaseService';

interface DashboardProps {
  projects: FormProject[];
  onCreateNew: () => void;
  onSelectProject: (p: FormProject) => void;
  onViewIntelligence: () => void;
  onViewAssessments: () => void;
  onViewBenchmarks: () => void;
}

// StatCard component defined for internal use in Dashboard
const StatCard = ({ label, value, trend, icon: Icon, color, description }: any) => (
  <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
        color === 'purple' ? 'bg-purple-50 text-purple-600' :
        color === 'orange' ? 'bg-orange-50 text-orange-600' :
        'bg-slate-50 text-slate-600'
      }`}>
        <Icon size={20} />
      </div>
      <div className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
        trend === 'Optimal' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
      }`}>
        {trend}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium italic mt-1 line-clamp-1">{description}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  projects: initialProjects, 
  onCreateNew, 
  onSelectProject, 
  onViewIntelligence,
  onViewAssessments,
  onViewBenchmarks
}) => {
  const [projects, setProjects] = useState<FormProject[]>(initialProjects);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
          const data = await getForms();
          if (data) {
            const transformed = data.map((f: any) => ({
              ...f,
              responsesCount: f.questions ? Math.floor(Math.random() * 100) : 0, 
              createdAt: new Date(f.created_at).toLocaleDateString()
            }));
            setProjects(transformed);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 800));
          setProjects(initialProjects);
        }
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialProjects]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-purple-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse tracking-tight">Syncing organizational intelligence...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Workspace</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Executive Dashboard</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Intelligence Hub</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Monitoring {projects.length} active assessment streams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onViewBenchmarks} variant="outline" className="hidden sm:inline-flex hover:scale-105 active:scale-95 transition-all">Audit History</Button>
          <Button onClick={onCreateNew} className="shadow-2xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all">
            <Plus size={20} className="mr-2" /> New Assessment
          </Button>
        </div>
      </header>

      {/* Stats Summary Section */}
      <section aria-label="Quick Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Inquiry Volume" value={projects.reduce((acc, p) => acc + (p.responsesCount || 0), 0).toLocaleString()} trend="+14.2%" icon={MessageSquare} description="Validated cross-project inputs" />
        <StatCard label="Evidence Integrity" value="92.4%" trend="+5.1%" icon={ShieldCheck} color="purple" description="Responses with verified context" />
        <StatCard label="Avg. Comprehension" value="88%" trend="+3.2%" icon={ClipboardCheck} description="Cross-segment understanding" />
        <StatCard label="AI Synthesis" value="1.2s" trend="Optimal" icon={Zap} color="orange" description="Real-time report generation" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Enhanced Visualization Component */}
          <section className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Engagement Dynamics</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time response synthesis by stream</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors duration-500">
                <BarChart3 size={24} />
              </div>
            </div>
            
            <ResponseChart projects={projects} />
          </section>

          {/* Assessment Streams */}
          <section className="space-y-6">
            <div className="flex justify-between items-end mb-2 px-2">
              <button onClick={onViewAssessments} className="text-left group/header outline-none">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight group-hover/header:text-purple-600 transition-colors">Active Inquiries</h2>
                <p className="text-sm text-slate-400 font-medium italic">Prioritized organizational assessments</p>
              </button>
              <button 
                onClick={onViewAssessments}
                className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors underline underline-offset-4 decoration-purple-200 hover:decoration-purple-600 active:scale-95 transform transition-transform"
              >
                View History
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {projects.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                  <p className="text-slate-400 font-medium mb-6">No active assessment streams found.</p>
                  <Button onClick={onCreateNew} variant="outline" size="sm">Initiate First Assessment</Button>
                </div>
              ) : (
                projects.map((project, idx) => (
                  <div 
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open project: ${project.title}`}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectProject(project)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className="group p-6 rounded-[2rem] border border-slate-100 bg-white hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all cursor-pointer flex items-center gap-6 animate-in slide-in-from-bottom-2 fade-in"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl transition-all group-hover:scale-105 group-hover:rotate-3 duration-500 shadow-sm ${
                      project.status === 'active' ? 'formly-gradient shadow-purple-100' : 'bg-slate-100 text-slate-300'
                    }`}>
                      {project.title.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">{project.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          project.status === 'active' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 font-medium italic">“{project.goal}”</p>
                    </div>

                    <div className="text-right hidden sm:block mr-4">
                      <p className="text-xl font-bold text-slate-900 group-hover:scale-110 transition-transform inline-block">{project.responsesCount}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responses</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 group-hover:shadow-lg active:scale-90">
                      <ArrowUpRight size={22} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Intelligence Side Panel */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl group transition-all hover:-translate-y-1 hover:shadow-purple-500/10 duration-500">
            <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12 group-hover:rotate-45 scale-150">
              <Sparkles size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-purple-400 mb-6">
                <Sparkles size={20} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Live Synthesis</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-4">Strategic Drift Analysis</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Formly AI has detected a potential semantic misalignment in the <span className="text-white">Hybrid Work Sentiment</span> project.
              </p>
              <Button 
                onClick={onViewIntelligence} 
                variant="primary" 
                className="w-full shadow-xl shadow-purple-900/40 active:scale-95 transition-transform"
              >
                Examine Findings
              </Button>
            </div>
          </div>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users size={16} className="text-slate-400" /> Active Segments
            </h3>
            <div className="space-y-4">
              {['Engineering', 'Product', 'Sales', 'Operations'].map((seg) => (
                <div key={seg} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-purple-100 transition-all duration-300 group/item cursor-default">
                  <span className="text-sm font-bold text-slate-700 group-hover/item:text-purple-600 transition-colors">{seg}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full formly-gradient w-2/3 group-hover/item:w-full transition-all duration-1000" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">82%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
