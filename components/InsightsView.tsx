
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, AlertCircle, CheckCircle2, FileText, 
  Download, Share2, ShieldCheck, History, Info, Clock, 
  BarChart3, Fingerprint, Network, ChevronDown, Check, X,
  ArrowUpRight, Target, Zap, AlertTriangle, RefreshCw
} from 'lucide-react';
import { FormProject, Outlier, ProjectInsight } from '../types';
import { analyzeResponses } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, RadarChart as ReRadarChart
} from 'recharts';
import Button from './Button';
import { updateOutlierStatus } from '../services/supabaseService';
import { apiRecomputeInsights, ApiStatus } from '../services/api';

interface InsightsViewProps {
  project: FormProject;
  onBack: () => void;
}

const MOCK_OUTLIERS: Outlier[] = [
  { id: 'ot-1', form_id: '1', respondent_id: 'res-42', reason: 'High semantic drift from Engineering core', status: 'pending', created_at: '2h ago', metadata: { drift: 0.82, quote: "Engineering bandwidth is at its limit." } },
  { id: 'ot-2', form_id: '1', respondent_id: 'res-88', reason: 'Unusually low comprehension score despite participation', status: 'pending', created_at: '5h ago', metadata: { comprehension: 0.12 } },
  { id: 'ot-3', form_id: '1', respondent_id: 'res-10', reason: 'Strategic dissent detected regarding regional autonomy', status: 'reviewed', created_at: '1d ago', metadata: { dissent_score: 0.94 } },
];

const MOCK_INSIGHTS: ProjectInsight[] = [
  { id: 'ins-1', form_id: '1', category: 'alignment', title: 'Strong Consensus on Hybrid Utility', content: '84% of respondents across segments agree that hybrid work increases individual output.', impact_score: 92, created_at: '' },
  { id: 'ins-2', form_id: '1', category: 'risk', title: 'Engineering Capacity Fatigue', content: 'Narrative analysis detects a recurring theme of burnout within the technical segment.', impact_score: 78, created_at: '' },
  { id: 'ins-3', form_id: '1', category: 'strategy', title: 'Regional Autonomy Conflict', content: 'APAC leadership shows a 40% higher preference for centralized control than EMEA.', impact_score: 64, created_at: '' },
];

const segmentComparisonData = [
  { segment: 'Engineering', alignment: 85, risk: 42, volume: 120 },
  { segment: 'Product', alignment: 92, risk: 12, volume: 85 },
  { segment: 'Operations', alignment: 74, risk: 28, volume: 200 },
  { segment: 'Sales', alignment: 68, risk: 55, volume: 150 },
  { segment: 'Executive', alignment: 98, risk: 5, volume: 45 },
];

const semanticRadarData = [
  { subject: 'Alignment', A: 85, fullMark: 100 },
  { subject: 'Sentiment', A: 65, fullMark: 100 },
  { subject: 'Confidence', A: 92, fullMark: 100 },
  { subject: 'Risk', A: 24, fullMark: 100 },
];

const InsightsView: React.FC<InsightsViewProps> = ({ project, onBack }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<ApiStatus>('idle');
  const [outliers, setOutliers] = useState<Outlier[]>(MOCK_OUTLIERS);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      // Simulate real AI analysis
      const result = await analyzeResponses(project.goal, [
        { q: "Initial Sentiment", r: "Strongly positive but concerns over timeline" },
        { q: "Resource Check", r: "Most feel undersupported in engineering" },
        { q: "Vision Alignment", r: "Clear understanding of the 2025 roadmap" }
      ]);
      setAnalysis(result);
      setLoading(false);
    };
    fetchAnalysis();
  }, [project]);

  const handleRefreshIntelligence = async () => {
    setRefreshing(true);
    const result = await apiRecomputeInsights(project.id, project.goal, (status) => setRefreshStatus(status));
    if (result.success) {
      // Re-fetch synthesis
      const newAnalysis = await analyzeResponses(project.goal, [
        { q: "Latest Context", r: "Re-calculated semantic weights based on new regional input." }
      ]);
      setAnalysis(newAnalysis);
    }
    setRefreshing(false);
    setRefreshStatus('idle');
  };

  const handleOutlierAction = async (id: string, status: Outlier['status']) => {
    try {
      if (process.env.SUPABASE_URL) {
        await updateOutlierStatus(id, status);
      }
      setOutliers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto px-4 md:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <button onClick={onBack} className="text-[10px] font-bold text-slate-400 hover:text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest transition-colors">
            <TrendingUp size={14} /> Back to Hub
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{project.title}</h1>
            <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-widest border border-purple-100 flex items-center gap-2">
              <Sparkles size={12} /> Decision Ready
            </div>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-4">
            <Fingerprint size={16} className="text-purple-500" /> Insight Stream ID: {project.id.substring(0,8)}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleRefreshIntelligence} 
            loading={refreshing}
            className="px-6 py-3 border-slate-200"
          >
            {refreshing ? `${refreshStatus}...` : <><RefreshCw size={18} className="mr-2" /> Refresh Intelligence</>}
          </Button>
          <Button variant="secondary" className="px-6 py-3 shadow-xl shadow-slate-200"><Share2 size={18} className="mr-2" /> Export JSON</Button>
        </div>
      </header>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatSummary label="Alignment Score" value="84%" trend="+5%" icon={Target} color="purple" />
        <StatSummary label="Decision Confidence" value="92/100" trend="Optimal" icon={ShieldCheck} color="green" />
        <StatSummary label="Detected Outliers" value={outliers.filter(o => o.status === 'pending').length.toString()} trend="-24%" icon={AlertTriangle} color="orange" />
        <StatSummary label="Semantic Volume" value={project.responsesCount.toString()} trend="+12.4%" icon={Zap} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Main Visualizations: Comparative & Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Cross-Segment Alignment</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Comparative Strategic Mapping</p>
                </div>
                <Network size={20} className="text-slate-200" />
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={segmentComparisonData} 
                    layout="vertical"
                    onClick={(data) => data && setSelectedSegment(data.activePayload?.[0]?.payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="segment" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b' }} 
                    />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="alignment" radius={[0, 10, 10, 0]} barSize={24}>
                      {segmentComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.alignment > 90 ? '#a855f7' : '#ec4899'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Semantic Profile</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Vector Synthesis</p>
                </div>
                <Fingerprint size={20} className="text-slate-200" />
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={semanticRadarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      name="Profile"
                      dataKey="A"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Drill-down or Segment Insight */}
          {selectedSegment && (
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 animate-in slide-in-from-top-4 duration-500">
               <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedSegment.segment} Segment Detail</h3>
                    <p className="text-xs text-slate-500 font-medium">Deep dive into {selectedSegment.volume} qualitative responses.</p>
                 </div>
                 <button onClick={() => setSelectedSegment(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alignment</p>
                   <p className="text-3xl font-bold text-purple-600">{selectedSegment.alignment}%</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Score</p>
                   <p className="text-3xl font-bold text-orange-600">{selectedSegment.risk}%</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participation</p>
                   <p className="text-3xl font-bold text-slate-900">{selectedSegment.volume}</p>
                 </div>
               </div>
            </div>
          )}

          {/* Auto-generated Structured Insights */}
          <div className="space-y-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                 <Sparkles className="text-purple-600" /> Strategic Findings
               </h3>
               <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">3 Priority Points</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {MOCK_INSIGHTS.map(insight => (
                 <div key={insight.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col hover:border-slate-200 transition-all group">
                   <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-2xl ${
                        insight.category === 'alignment' ? 'bg-green-50 text-green-600' :
                        insight.category === 'risk' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {insight.category === 'alignment' ? <CheckCircle2 size={18} /> : 
                         insight.category === 'risk' ? <AlertTriangle size={18} /> : <Target size={18} />}
                      </div>
                      <span className="text-2xl font-bold text-slate-100 group-hover:text-slate-200 transition-colors">#{insight.impact_score}</span>
                   </div>
                   <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-2">{insight.title}</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                     {insight.content}
                   </p>
                   <button className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                      Review Supporting Evidence <ArrowUpRight size={14} />
                   </button>
                 </div>
               ))}
             </div>
          </div>

          {/* Executive Synthesis */}
          <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
              <Zap size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8 text-purple-400">
                <Sparkles size={24} className="animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-[0.3em]">AI Executive Synthesis</span>
              </div>
              {loading ? (
                <div className="space-y-6">
                  <div className="h-6 w-3/4 bg-white/5 rounded-xl animate-pulse" />
                  <div className="h-6 w-full bg-white/5 rounded-xl animate-pulse" />
                  <div className="h-6 w-5/6 bg-white/5 rounded-xl animate-pulse" />
                </div>
              ) : (
                <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed text-slate-400 font-medium">
                  <p className="whitespace-pre-wrap">{analysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Analytical Tools */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Outlier Management UI */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" /> Outlier Management
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest">
                {outliers.filter(o => o.status === 'pending').length} Actions
              </span>
            </div>
            
            <div className="space-y-4">
              {outliers.filter(o => o.status === 'pending').map((outlier) => (
                <div key={outlier.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed mb-3">
                    {outlier.reason}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1 px-2 rounded-lg bg-white border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {outlier.created_at}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOutlierAction(outlier.id, 'reviewed')}
                      className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Review
                    </button>
                    <button 
                      onClick={() => handleOutlierAction(outlier.id, 'dismissed')}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {outliers.filter(o => o.status === 'pending').length === 0 && (
                <div className="text-center py-8">
                   <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 size={24} />
                   </div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Outliers Audited</p>
                </div>
              )}
            </div>
          </div>

          {/* Traceability Audit */}
          <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10 text-slate-900">
              <History size={24} className="text-slate-400" strokeWidth={2.5} />
              <h4 className="text-lg font-bold tracking-tight">Traceability Audit</h4>
            </div>
            <div className="space-y-8 relative">
              <div className="absolute left-[7px] top-2 bottom-4 w-[2px] bg-slate-50" />
              {[
                { action: 'Strategic Drift Verified', user: 'AI Core', time: '2m ago' },
                { action: 'Evidence Verified', user: 'A. Chen', time: '12m ago' },
                { action: 'Comprehension Logged', user: 'B. Smith', time: '2h ago' },
              ].map((log, i) => (
                <div key={i} className="flex gap-6 relative z-10 group/log">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-purple-500 shadow-sm group-hover/log:scale-125 transition-transform" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none">{log.action}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3 text-green-600">
                 <ShieldCheck size={24} strokeWidth={2.5} />
                 <h4 className="text-lg font-bold tracking-tight">Integrity Score</h4>
               </div>
               <span className="text-2xl font-bold text-green-600">94%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner mb-6">
              <div className="bg-green-500 h-full w-[94%] transition-all duration-1000" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Responses from individuals who failed comprehension checks have been automatically down-weighted in this synthesis.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatSummary = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-slate-200 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl ${
        color === 'purple' ? 'bg-purple-50 text-purple-600' :
        color === 'green' ? 'bg-green-50 text-green-600' :
        color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
      }`}>
        <Icon size={20} />
      </div>
      <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
        trend.startsWith('+') ? 'bg-green-50 text-green-600' : 
        trend.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
      }`}>
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-bold text-slate-900 tracking-tighter">{value}</p>
  </div>
);

export default InsightsView;
