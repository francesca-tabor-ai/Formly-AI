
import React from 'react';
import { 
  LayoutDashboard, FileText, BarChart3, Settings, 
  PlusSquare, ChevronRight, HelpCircle, Binary, 
  ShoppingBag, BarChart, Terminal 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'builder', icon: PlusSquare, label: 'Architect' },
    { id: 'projects', icon: FileText, label: 'Assessments' },
    { id: 'insights', icon: BarChart3, label: 'Intelligence' },
    { id: 'predictive', icon: Binary, label: 'Predictive' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { id: 'benchmarks', icon: BarChart, label: 'Benchmarks' },
    { id: 'developers', icon: Terminal, label: 'Developers' },
  ];

  return (
    <aside className="w-72 border-r border-slate-100 h-screen sticky top-0 flex flex-col p-8 bg-white z-40">
      <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl formly-gradient flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-100 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">F</div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">Formly AI</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === item.id 
              ? 'bg-slate-900 text-white font-bold shadow-2xl shadow-slate-200' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'text-purple-400' : 'group-hover:text-purple-600 transition-colors'} />
              <span className="text-[13px]">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={14} className="text-slate-500 animate-in slide-in-from-left-2 duration-300" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all font-medium text-sm hover:scale-[1.02] active:scale-[0.98] ${
            activeTab === 'settings' 
            ? 'bg-slate-900 text-white font-bold shadow-2xl shadow-slate-200' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className={`${activeTab === 'settings' ? 'text-purple-400' : 'group-hover:rotate-90 transition-transform duration-500'}`} />
          <span>Settings</span>
        </button>

        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all duration-300 group cursor-default">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Organizational Unit</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl formly-gradient p-[1px] group-hover:scale-110 transition-transform">
               <div className="w-full h-full bg-white rounded-[calc(1rem-1px)] flex items-center justify-center text-xs font-bold text-purple-700">AC</div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Acme Strategy</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2 hover:text-slate-500 transition-colors cursor-pointer">
          <HelpCircle size={12} />
          <span>Support Center</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
