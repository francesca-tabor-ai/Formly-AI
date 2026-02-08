
import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, PieChart, Pie
} from 'recharts';
import { ShieldAlert, TrendingUp, Target, BarChart3, ArrowUpRight, Activity } from 'lucide-react';

interface SimulationResultsProps {
  data: any;
  isLoading: boolean;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin mb-6" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Processing Monte Carlo Synthesis</p>
      </div>
    );
  }

  if (!data) return (
    <div className="bg-slate-50 p-12 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="p-4 rounded-3xl bg-white text-slate-200 mb-6">
        <BarChart3 size={48} />
      </div>
      <h3 className="text-xl font-bold text-slate-400 tracking-tight">Simulation Engine Idle</h3>
      <p className="text-sm text-slate-400 max-w-xs mt-2 font-medium">Configure scenario variables and initialize simulation to generate predictive outcomes.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-orange-500" /> Strategic Risk Forecast
            </h4>
            <span className="text-xs font-bold text-orange-600">+12% vs Baseline</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.riskTrend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
            <Activity size={120} />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-10">Predicted ROI Synthesis</h4>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-5xl font-bold tracking-tighter mb-2">3.4x</p>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Projected organizational velocity increase based on <span className="text-white">Segment Weighting: Executive Priority</span>.
              </p>
            </div>
            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                <TrendingUp size={16} /> Confidence: 94%
              </div>
              <ArrowUpRight className="text-slate-700" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Comparative Factor Mapping</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
              <Radar
                name="Baseline"
                dataKey="B"
                stroke="#cbd5e1"
                fill="#cbd5e1"
                fillOpacity={0.1}
              />
              <Radar
                name="Simulation"
                dataKey="A"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.radarData.map((item: any) => (
            <div key={item.subject} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.subject}</p>
              <p className="text-lg font-bold text-slate-900">{item.A}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;
