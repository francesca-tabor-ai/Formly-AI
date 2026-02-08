
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line
} from 'recharts';
import { 
  Trophy, TrendingUp, Info, ArrowUpRight, 
  Activity, Target, Zap, ChevronRight, Globe
} from 'lucide-react';

const SECTOR_BENCHMARKS = [
  { metric: 'Alignment', Org: 84, Industry: 72 },
  { metric: 'Risk Resilience', Org: 68, Industry: 55 },
  { metric: 'Response Velocity', Org: 92, Industry: 65 },
  { metric: 'Semantic Depth', Org: 75, Industry: 70 },
  { metric: 'Governance Audit', Org: 98, Industry: 80 },
];

const HISTORICAL_TREND = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 68 },
  { month: 'Mar', value: 72 },
  { month: 'Apr', value: 70 },
  { month: 'May', value: 81 },
  { month: 'Jun', value: 84 },
];

const BenchmarkDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Intelligence</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Industry Benchmarking</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Performance Atlas</h1>
          <p className="text-slate-500 font-medium mt-4 flex items-center gap-2">
            <Globe size={16} className="text-purple-500" /> Sector: <span className="text-slate-900 font-bold">Global Enterprise Tech</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 rounded-2xl border border-green-100 text-green-600 flex items-center gap-2 text-xs font-bold">
            <Trophy size={14} /> Top 5% Globally
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Standard Performance Index</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Org vs Industry Averages</p>
              </div>
              <Target size={24} className="text-slate-200" />
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_BENCHMARKS} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="metric" 
                    axisLine={false} 
                    tickLine={false} 
                    style={{ fontSize: '11px', fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 700 }} />
                  <Bar dataKey="Org" fill="#a855f7" radius={[12, 12, 0, 0]} barSize={40} />
                  <Bar dataKey="Industry" fill="#e2e8f0" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Strategic Dispersion</h4>
               <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SECTOR_BENCHMARKS}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="Org" dataKey="Org" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
               </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Quarterly Ascent</h4>
               <div className="h-64 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={HISTORICAL_TREND}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={4} dot={{ r: 6, fill: '#a855f7', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
               </div>
               <div className="mt-6 flex items-center justify-between">
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter">84.2</span>
                  <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                    <TrendingUp size={16} /> +12.4%
                  </div>
               </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden group">
            <div className="relative z-10">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 w-fit mb-8 group-hover:rotate-12 transition-transform duration-500">
                <Zap size={32} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-4 leading-tight">Elite Efficiency Threshold Met</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                Your organizational response velocity is <span className="text-white font-bold">42% faster</span> than the industry baseline.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-950/20">
                Generate Comparison PDF <ArrowUpRight size={18} />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Activity size={16} className="text-slate-200" /> Insight Breakdown
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Talent Retention', score: 94, status: 'Leading' },
                { label: 'Strategic Clarity', score: 72, status: 'Average' },
                { label: 'Inquiry Integrity', score: 88, status: 'Above' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">{item.status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-purple-50 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <Info size={20} className="text-purple-600" />
              <h4 className="text-sm font-bold text-purple-900">About Benchmarking</h4>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed font-medium">
              Data is aggregated from 12k+ organizations using anonymized metadata points. Integrity is maintained via Formly's Semantic Proof protocols.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
