
import React, { useState } from 'react';
import { Binary, Sparkles, LayoutGrid, LayoutList, History, AlertCircle } from 'lucide-react';
import ScenarioBuilder from './ScenarioBuilder';
import SimulationResults from './SimulationResults';
import DecisionTimeline from './DecisionTimeline';
import { FormProject } from '../types';
import { apiRunSimulation, ApiStatus } from '../services/api';

interface PredictiveSandboxProps {
  project: FormProject;
}

const PredictiveSandbox: React.FC<PredictiveSandboxProps> = ({ project }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStatus, setSimStatus] = useState<ApiStatus>('idle');
  const [simResult, setSimResult] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simulation' | 'timeline'>('simulation');

  const handleRunSimulation = async (params: { weights: any, variables: any }) => {
    setIsSimulating(true);
    setSimError(null);
    
    // In a real app, these IDs would come from state/props
    const scenarioId = 'scen-q4-strategy';

    // Fix: Match apiRunSimulation parameter signature by providing formId and orgId from current project,
    // and removing the invalid modelConfigId parameter.
    const response = await apiRunSimulation({
      formId: project.id,
      orgId: project.organization_id,
      scenarioId,
      variables: params.variables,
      weights: params.weights
    }, (status) => setSimStatus(status));

    if (response.success && response.data) {
      setSimResult(response.data.results);
    } else {
      setSimError(response.error || "Simulation engine failure.");
    }
    
    setIsSimulating(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Workspace</span>
            <span className="mx-1 text-slate-200">/</span>
            <span className="text-slate-900">Predictive Sandbox</span>
          </nav>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Decision Sandbox</h1>
            <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Binary size={12} className="text-purple-400" /> Scenario Engine v4
            </div>
          </div>
          <p className="text-slate-500 font-medium mt-4">
            Assessing: <span className="text-slate-900 font-bold">{project.title}</span> — Modeling outcomes against organizational goals.
          </p>
        </div>
        
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setViewMode('simulation')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'simulation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={16} /> Simulation Mode
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History size={16} /> Governance Audit
          </button>
        </div>
      </header>

      {simError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
          <AlertCircle size={18} /> {simError}
        </div>
      )}

      {viewMode === 'simulation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <ScenarioBuilder onRunSimulation={handleRunSimulation} isLoading={isSimulating} />
            {isSimulating && (
              <div className="mt-6 p-4 rounded-2xl bg-purple-50 border border-purple-100 animate-pulse flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
                 <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">{simStatus}...</span>
              </div>
            )}
          </div>
          <div className="lg:col-span-7">
            <SimulationResults data={simResult} isLoading={isSimulating} />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <DecisionTimeline />
        </div>
      )}

      <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-[2rem] bg-white text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles size={28} className="text-purple-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 tracking-tight">Executive Decision Portal</h4>
            <p className="text-sm text-slate-500 font-medium">Formalize a strategic choice backed by verifiable simulation data.</p>
          </div>
        </div>
        <button className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
          Log Final Decision Audit
        </button>
      </div>
    </div>
  );
};

export default PredictiveSandbox;
