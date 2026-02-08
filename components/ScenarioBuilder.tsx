
import React, { useState } from 'react';
import { Target, Users, Zap, Layers, Play, Settings2, Info } from 'lucide-react';
import Button from './Button';

interface ScenarioBuilderProps {
  onRunSimulation: (params: any) => void;
  isLoading: boolean;
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ onRunSimulation, isLoading }) => {
  const [weights, setWeights] = useState({
    engineering: 80,
    product: 65,
    operations: 40,
    executive: 100
  });

  const [variables, setVariables] = useState({
    budgetAutonomy: 50,
    hiringFreeze: 0,
    remoteFlexibility: 75
  });

  const handleWeightChange = (key: keyof typeof weights, val: string) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(val) }));
  };

  const handleVariableChange = (key: keyof typeof variables, val: string) => {
    setVariables(prev => ({ ...prev, [key]: parseInt(val) }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target size={20} className="text-purple-600" /> Scenario Variables
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure Model Parameters</p>
          </div>
          <Settings2 size={20} className="text-slate-200" />
        </div>

        <div className="space-y-8">
          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Users size={14} /> Segment Authority Weights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 capitalize">{key}</label>
                    <span className="text-xs font-bold text-purple-600">{value}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={value}
                    onChange={(e) => handleWeightChange(key as any, e.target.value)}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-slate-50" />

          <section>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Zap size={14} /> Strategic Levers
            </h4>
            <div className="space-y-6">
              {[
                { id: 'budgetAutonomy', label: 'Regional Budget Autonomy', desc: 'Degree of financial independence per region.' },
                { id: 'hiringFreeze', label: 'Talent Acquisition Restriction', desc: 'Scale of global hiring limitations (0-100%).' },
                { id: 'remoteFlexibility', label: 'Operational Elasticity', desc: 'Preference for asynchronous/remote-first workflows.' }
              ].map((v) => (
                <div key={v.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{v.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">{v.desc}</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-900">
                      {variables[v.id as keyof typeof variables]}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={variables[v.id as keyof typeof variables]}
                    onChange={(e) => handleVariableChange(v.id as any, e.target.value)}
                    className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50">
          <Button 
            onClick={() => onRunSimulation({ weights, variables })} 
            loading={isLoading}
            className="w-full py-5 text-lg shadow-2xl shadow-purple-200"
          >
            <Play size={20} className="mr-3 fill-current" /> Initialize Simulation
          </Button>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-6 flex items-center justify-center gap-2">
            <Info size={12} /> Model Config: v2.4-stable-prediction
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScenarioBuilder;
