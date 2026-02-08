
import React, { useState } from 'react';
import { 
  Search, Filter, Star, Download, Eye, 
  BookOpen, FileText, LayoutTemplate, 
  ChevronRight, ArrowUpRight, Plus, 
  Globe, Shield, Sparkles, Zap, ShoppingCart
} from 'lucide-react';
import Button from './Button';

interface Template {
  id: string;
  title: string;
  description: string;
  sector: string;
  usageCount: number;
  rating: number;
  author: string;
  type: 'template' | 'library';
}

const MOCK_ITEMS: Template[] = [
  { id: 'ms-01', title: 'M&S Employee AI Awareness & Opportunity Quiz', description: 'Retail-optimized framework for identifying frontline AI adoption bottlenecks and repetitive task friction.', sector: 'Retail', usageCount: 4520, rating: 5.0, author: 'Marks & Spencer Strategy', type: 'template' },
  { id: 't1', title: 'Q4 Product Market Alignment', description: 'Comprehensive inquiry into engineering feasibility vs market demand.', sector: 'Tech', usageCount: 1240, rating: 4.8, author: 'Formly Pro', type: 'template' },
  { id: 't2', title: 'Healthcare Resilience Audit', description: 'Regulatory compliant assessment for clinical staff burnout and resource allocation.', sector: 'Health', usageCount: 890, rating: 4.9, author: 'NHS Strategy', type: 'template' },
  { id: 'l1', title: 'ESG Compliance Baseline', description: 'Core library of evidence for sustainability reporting requirements.', sector: 'Gov', usageCount: 2300, rating: 4.7, author: 'United Nations', type: 'library' },
  { id: 'l2', title: 'SOC2 Type II Evidence Repo', description: 'Templates and required docs for security audit readiness.', sector: 'Tech', usageCount: 450, rating: 5.0, author: 'SecurityFirst', type: 'library' },
  { id: 't3', title: 'Retail Velocity Assessment', description: 'Assessing supply chain bottlenecks through localized store interviews.', sector: 'Retail', usageCount: 150, rating: 4.2, author: 'RetailX', type: 'template' },
];

const Marketplace: React.FC = () => {
  const [activeType, setActiveType] = useState<'template' | 'library'>('template');
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('All');

  const sectors = ['All', 'Tech', 'Health', 'Gov', 'Retail', 'Finance'];

  const filteredItems = MOCK_ITEMS.filter(item => 
    item.type === activeType &&
    (filterSector === 'All' || item.sector === filterSector) &&
    (item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Marketplace</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Global Shared Assets</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Exchange Hub</h1>
          <p className="text-slate-500 font-medium mt-4">
            Browse high-integrity templates and evidence libraries from the Formly ecosystem.
          </p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setActiveType('template')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeType === 'template' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutTemplate size={16} /> Assessment Templates
          </button>
          <button 
            onClick={() => setActiveType('library')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeType === 'library' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen size={16} /> Evidence Libraries
          </button>
        </div>
      </header>

      <section className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeType}s...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-200"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setFilterSector(s)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filterSector === s 
                ? 'bg-slate-900 text-white' 
                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map(item => (
          <div key={item.id} className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-100 transition-all cursor-pointer flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-[1.5rem] ${
                item.type === 'template' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {item.title.includes('M&S') ? <ShoppingCart size={24} /> : (item.type === 'template' ? <LayoutTemplate size={24} /> : <BookOpen size={24} />)}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full">
                <Star size={12} className="text-orange-400 fill-orange-400" />
                <span className="text-[10px] font-bold text-slate-600">{item.rating}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-purple-600 transition-colors">{item.title}</h3>
            <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-8">{item.description}</p>
            
            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Installs</span>
                <span className="text-sm font-bold text-slate-900">{item.usageCount.toLocaleString()}</span>
              </div>
              <Button variant="outline" size="sm" className="px-5 border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                Import <ArrowUpRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center group hover:border-purple-200 transition-all">
          <div className="p-5 rounded-full bg-slate-50 text-slate-300 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all mb-4">
            <Plus size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-900 tracking-tight">Contribute Asset</h4>
          <p className="text-xs text-slate-400 font-medium max-w-[200px] mt-1">Share your anonymized assessment structures with the global community.</p>
        </div>
      </div>

      <div className="p-12 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
          <Globe size={300} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-purple-400 mb-6">
            <Shield size={20} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Verification</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">The Trust Economy</h2>
          <p className="text-slate-400 leading-relaxed font-medium mb-10">
            Formly AI Marketplace assets are cryptographically verified to ensure provenance and integrity. All community contributions are reviewed by our Semantic Governance Layer for quality.
          </p>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <Zap size={24} className="text-purple-500" />
              <div>
                <p className="text-xl font-bold">140k+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Shared Inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-pink-500" />
              <div>
                <p className="text-xl font-bold">92%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Reuse Efficiency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
