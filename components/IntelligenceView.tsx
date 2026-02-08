
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Zap, 
  ChevronRight, Network, Fingerprint, Sparkles,
  BarChart3, Target, Info, ArrowUpRight,
  Users, Layers, Globe, Filter, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { FormProject } from '../types';
import Button from './Button';

interface IntelligenceViewProps {
  projects: FormProject[];
}

const GLOBAL_RADAR_DATA = [
  { subject: 'Alignment', A: 78, B: 70, fullMark: 100 },
  { subject: 'Sentiment', A: 62, B: 75, fullMark: 100 },
  { subject: 'Confidence', A: 85, B: 80, fullMark: 100 },
  { subject: 'Risk', A: 32, B: 45, fullMark: 100 },
  { subject: 'Integrity', A: 94, B: 85, fullMark: 100 },
];

const CROSS_SEGMENT_DATA = [
  { name: 'Engineering', alignment: 68, risk: 72, responses: 420 },
  { name: 'Product', alignment: 92, risk: 12, responses: 210 },
  { name: 'Marketing', alignment: 74, risk: 45, responses: 350 },
  { name: 'Operations', alignment: 81, risk: 28, responses: 290 },
  { name: 'Executive', alignment: 98, risk: 5, responses: 45 },
];

const ALIGNMENT_TREND = [
  { month: 'Jan', value: 64 },
  { month: 'Feb', value: 68 },
  { month: 'Mar', value: 65 },
  { month: 'Apr', value: 72 },
  { month: 'May', value: 78 },
  { month: 'Jun', value: 81 },
];

const IntelligenceView: React.FC<IntelligenceViewProps> = ({ projects }) => {
  const [viewMode, setViewMode] = useState<'all' | 'filtered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredSegments = useMemo(() => {
    let base = CROSS_SEGMENT_DATA;
    if (viewMode === 'filtered') {
      // Focus on High Risk / Low Alignment
      base = base.filter(s => s.alignment < 80 || s.risk > 40);
    }
    if (searchQuery) {
      base = base.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return base;
  }, [viewMode, searchQuery]);

  const radarData = useMemo(() => {
    if (viewMode === 'filtered') {
      // Emphasize Risk in radar when filtered
      return GLOBAL_RADAR_DATA.map(d => 
        d.subject === 'Risk' ? { ...d, A: d.A + 20 } : d
      );
    }
    return GLOBAL_RADAR_DATA;
  }, [viewMode]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Executive Suite</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Organizational Intelligence</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 leading-none">Intelligence Hub</h1>
          <p className="text-slate-500 font-medium mt-4">
            Aggregated decision-ready insights across <span className="text-slate-900 font-bold">{projects.length} assessment streams</span>.
          </p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Globe size={16} className={viewMode === 'all' ? 'text-purple-600' : ''} /> Organizational View
          </button>
          <button 
            onClick={() => setViewMode('filtered')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'filtered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Filter size={16} className={viewMode === 'filtered' ? 'text-purple-600' : ''} /> Strategic Risks
          </button>
        </div>
      </header>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Global Alignment Index" 
          value={viewMode === 'filtered' ? "68.2%" : "78.4%"} 
          trend={viewMode === 'filtered' ? "-4.2%" : "+12.2%"} 
          icon={Target} 
          color="purple" 
        />
        <MetricCard label="Active Decision Velocity" value="3.2/wk" trend="+0.5" icon={Zap} color="orange" />
        <MetricCard 
          label="Risk Criticality" 
          value={viewMode === 'filtered' ? "Elevated" : "Low"} 
          trend={viewMode === 'filtered' ? "Attention" : "Stable"} 
          icon={ShieldCheck} 
          color={viewMode === 'filtered' ? "orange" : "green"} 
        />
        <MetricCard label="Semantic Insight Points" value="12,402" trend="+1.2k" icon={Fingerprint} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Analysis Column */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="relative w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search segment dynamics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-medium text-slate-900 shadow-sm"
            />
          </div>

          <section className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {viewMode === 'filtered' ? 'Anomalous Dynamics' : 'Alignment Convergence'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {viewMode === 'filtered' ? 'Focusing on semantic drift outliers' : 'Cross-Project Progress vs Benchmark'}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold flex items-center gap-2">
                <TrendingUp size={14} /> Historical Data
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ALIGNMENT_TREND}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={viewMode === 'filtered' ? "#f97316" : "#a855f7"} />
                      <stop offset="100%" stopColor={viewMode === 'filtered' ? "#ec4899" : "#ec4899"} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '11px', fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={5} 
                    dot={{ r: 6, fill: '#fff', stroke: viewMode === 'filtered' ? '#f97316' : '#a855f7', strokeWidth: 3 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Segment Profile</h3>
                <Network size={20} className="text-slate-200" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSegments} layout="vertical">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b' }} 
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="alignment" radius={[0, 10, 10, 0]} barSize={20}>
                      {filteredSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.alignment > 90 ? '#a855f7' : entry.alignment < 75 ? '#f97316' : '#ec4899'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Crucial Insight</p>
                <p className="text-sm font-medium text-slate-700 mt-2">
                  {viewMode === 'filtered' 
                    ? "Identifying segments that require immediate strategic realignment."
                    : "Overall organizational health is stable across major segments."}
                </p>
              </div>
            </section>

            <section className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={160} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-lg font-bold tracking-tight mb-2">Automated Discovery</h3>
                <p className="text-slate-400 text-sm font-medium mb-10">
                  {viewMode === 'filtered' 
                    ? "Detected critical drift: 'Burnout & Latency' emerging in technical tracks." 
                    : "Recurring theme: 'Operational Efficiency' remains the primary focus."}
                </p>
                <div className="mt-auto space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Drift Impact</span>
                      <span className="text-xs font-bold">{viewMode === 'filtered' ? 'Critical' : 'Moderate'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full formly-gradient transition-all duration-1000 ${viewMode === 'filtered' ? 'w-full' : 'w-3/4'}`} />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-white text-slate-900 hover:bg-slate-50 border-none shadow-lg">
                    {viewMode === 'filtered' ? 'Mitigation Plan' : 'Examine Themes'}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <aside className="lg:col-span-4 space-y-10">
          <section className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
              <Layers size={16} className="text-slate-400" /> Semantic Profile
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                  <Radar
                    name="Q1 Baseline"
                    dataKey="B"
                    stroke="#cbd5e1"
                    fill="#cbd5e1"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Current State"
                    dataKey="A"
                    stroke={viewMode === 'filtered' ? '#f97316' : '#a855f7'}
                    fill={viewMode === 'filtered' ? '#f97316' : '#a855f7'}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-4">
               <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                 <span>Evidence Integrity</span>
                 <span className="text-green-600">94%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                 <span>Decision Confidence</span>
                 <span className={viewMode === 'filtered' ? 'text-orange-500' : 'text-purple-600'}>
                   {viewMode === 'filtered' ? 'Guarded' : 'High'}
                 </span>
               </div>
            </div>
          </section>

          <section className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100/50">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Active Alerts
            </h4>
            <div className="space-y-6">
              <RiskItem title="Strategic Silos in APAC" impact="Medium" date="2h ago" />
              <RiskItem title="Evidence Decay: Q3 Roadmap" impact="High" date="5h ago" />
              <RiskItem title="Consensus Fragility: Tech Stack" impact="Low" date="Yesterday" />
            </div>
            <button className="w-full mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
              All Alerts <ArrowUpRight size={14} />
            </button>
          </section>

          <section className="p-10 rounded-[3rem] formly-gradient shadow-2xl shadow-purple-100 text-white group">
            <h4 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-3">
              <Sparkles size={24} className="group-hover:rotate-12 transition-transform" /> Briefing
            </h4>
            <p className="text-xs text-white/80 font-medium leading-relaxed mb-8">
              {viewMode === 'filtered' 
                ? "Risk-weighted briefings prepared for Executive Council review."
                : "3 assessments have reached statistical significance. Reports ready."}
            </p>
            <Button variant="outline" className="w-full bg-white text-slate-900 hover:bg-slate-50 border-none">
              Generate Synthesis
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-slate-200 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
        color === 'purple' ? 'bg-purple-50 text-purple-600 shadow-sm' :
        color === 'orange' ? 'bg-orange-50 text-orange-600 shadow-sm' :
        color === 'green' ? 'bg-green-50 text-green-600 shadow-sm' : 'bg-blue-50 text-blue-600 shadow-sm'
      }`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${
        trend.startsWith('+') ? 'bg-green-50 text-green-600' : 
        trend === 'Attention' || trend.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">{value}</p>
  </div>
);

const RiskItem = ({ title, impact, date }: { title: string, impact: string, date: string }) => (
  <div className="flex gap-4 group cursor-pointer">
    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
      impact === 'High' ? 'bg-red-500' : 
      impact === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
    }`} />
    <div>
      <p className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors leading-tight">{title}</p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${
          impact === 'High' ? 'text-red-500' : 'text-slate-400'
        }`}>{impact} Impact</span>
        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{date}</span>
      </div>
    </div>
  </div>
);

export default IntelligenceView;
