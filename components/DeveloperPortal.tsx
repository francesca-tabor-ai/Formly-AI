
import React, { useState } from 'react';
import { 
  Terminal, Key, Book, Code, Copy, 
  RefreshCw, Trash2, Check, ExternalLink,
  ChevronRight, ArrowRight, Play, AlertCircle,
  Database, Shield, Zap, Sparkles, Plus
} from 'lucide-react';
import Button from './Button';

const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docs' | 'keys'>('docs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mockKeys = [
    { id: '1', name: 'Production API', hint: 'fmly_live_...4d2f', created: '2024-03-12' },
    { id: '2', name: 'Sandbox / Testing', hint: 'fmly_test_...8a91', created: '2024-05-01' },
  ];

  const handleCopy = (id: string) => {
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Dev Portal</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Infrastructure & API</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Developer Hub</h1>
          <p className="text-slate-500 font-medium mt-4">
            Integrate Formly's Decision Intelligence into your existing workflows.
          </p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'docs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Book size={16} /> Documentation
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'keys' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Key size={16} /> API Keys
          </button>
        </div>
      </header>

      {activeTab === 'docs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Introduction</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                The Formly API allows you to programmatically trigger assessment cycles, retrieve real-time intelligence scores, and manage evidence libraries. 
              </p>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-white text-slate-400">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">API Endpoint</h4>
                  <code className="text-[11px] font-mono bg-white px-3 py-1 rounded border border-slate-200 mt-2 block w-fit">https://api.formly.ai/v1</code>
                </div>
              </div>
            </section>

            <section className="space-y-8">
               <div className="flex items-center gap-3">
                 <h3 className="text-lg font-bold text-slate-900 tracking-tight">Core Resources</h3>
                 <div className="h-px flex-1 bg-slate-50" />
               </div>
               <div className="space-y-4">
                 <DocMethod method="POST" path="/assessments" desc="Create a new weighted assessment stream." />
                 <DocMethod method="GET" path="/insights/{form_id}" desc="Retrieve semantic analysis for a specific form." />
                 <DocMethod method="POST" path="/simulations/run" desc="Trigger a Monte Carlo simulation." />
               </div>
            </section>

            <section className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden group">
               <div className="flex items-center gap-2 text-purple-400 mb-6">
                 <Shield size={18} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Security Protocol</span>
               </div>
               <h3 className="text-xl font-bold mb-4">Bearer Authentication</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-8">
                 All API requests must be authenticated using your organizational API key in the <code>Authorization</code> header.
               </p>
               <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] text-purple-300 overflow-x-auto">
                 {`Authorization: Bearer YOUR_API_KEY`}
               </pre>
            </section>
          </div>

          <aside className="lg:col-span-5 space-y-8">
             <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm sticky top-12">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Code size={16} className="text-slate-300" /> Interactive Example
                  </h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">Node.js</span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">Python</span>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed overflow-x-auto shadow-2xl">
<pre>{`const formly = require('@formly/sdk');

const ai = new formly.Client('YOUR_KEY');

const run = async () => {
  const result = await ai.insights.get('q4-drift');
  console.log(result.alignment_score);
};

run();`}</pre>
                </div>
                
                <button className="w-full mt-6 py-4 rounded-2xl border border-slate-100 text-slate-900 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Play size={14} className="fill-current" /> Run in Playground
                </button>
             </div>
          </aside>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active API Keys</h2>
                <p className="text-sm text-slate-500 font-medium">Manage keys for organizational infrastructure.</p>
              </div>
              {/* Fix: Added missing Plus icon component */}
              <Button>
                <Plus size={18} className="mr-2" /> Create New Key
              </Button>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {mockKeys.map(key => (
                <div key={key.id} className="p-8 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-8 group hover:border-slate-300 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <Key size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{key.name}</h3>
                    <div className="flex items-center gap-3">
                      <code className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{key.hint}</code>
                      <button 
                        onClick={() => handleCopy(key.id)}
                        className="text-slate-300 hover:text-slate-900 transition-colors"
                      >
                        {copiedKey === key.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right mr-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-bold text-slate-900">{key.created}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 rounded-xl border border-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all">
                      <RefreshCw size={18} />
                    </button>
                    <button className="p-3 rounded-xl border border-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <KeyBenefit icon={Database} title="Real-time Webhooks" desc="Listen for completion events in your existing stack." />
              <KeyBenefit icon={Shield} title="Scoped Access" desc="Restict keys to specific assessment streams." />
              <KeyBenefit icon={Sparkles} title="SDK Ready" desc="Native libraries for Node, Python, and Go." />
           </div>
        </div>
      )}
    </div>
  );
};

const DocMethod = ({ method, path, desc }: { method: string, path: string, desc: string }) => (
  <div className="p-6 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 transition-all group flex items-start gap-6">
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
      method === 'POST' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
    }`}>{method}</span>
    <div className="flex-1 min-w-0">
      <code className="text-sm font-bold text-slate-900 block mb-1 font-mono">{path}</code>
      <p className="text-xs text-slate-500 font-medium">{desc}</p>
    </div>
    <ChevronRight className="text-slate-200 group-hover:text-slate-400 transition-colors" size={18} />
  </div>
);

const KeyBenefit = ({ icon: Icon, title, desc }: any) => (
  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50">
    <div className="p-3 rounded-xl bg-white w-fit mb-6 text-slate-900 shadow-sm">
      <Icon size={20} />
    </div>
    <h4 className="text-base font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default DeveloperPortal;
