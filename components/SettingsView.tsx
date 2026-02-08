
import React, { useState } from 'react';
import { 
  Settings, User, Bell, Shield, Sparkles, 
  ChevronRight, Save, Globe, Lock, Cpu,
  Cloud, Terminal, Trash2, Mail, CreditCard,
  Key, Database, Fingerprint, ToggleLeft, ToggleRight
} from 'lucide-react';
import Button from './Button';

const SettingsView: React.FC = () => {
  const [orgName, setOrgName] = useState('Acme Strategy');
  const [deepReasoning, setDeepReasoning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    driftAlerts: true,
    dailySummary: false,
    mentions: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-50 pb-8">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>System</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Control Center</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 font-medium mt-4">
            Manage your workspace identity, AI models, and user credentials.
          </p>
        </div>
        <Button onClick={handleSave} loading={isSaving} className="shadow-xl shadow-purple-100 min-w-[160px]">
          <Save size={18} className="mr-2" /> {isSaving ? 'Updating...' : 'Save Changes'}
        </Button>
      </header>

      <div className="space-y-10">
        {/* Organizational Profile */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Organization Profile</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Workspace ID: fmly-org-84920</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Name</label>
              <input 
                type="text" 
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-bold text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Domain</label>
              <div className="flex items-center px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 font-medium italic">
                acme-strategy.com
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Enterprise Subscription</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Billed annually • Renews Mar 2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage Billing</Button>
          </div>
        </section>

        {/* AI & Synthesis Logic */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Config</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Gemini Engine v3.0 Preview</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-purple-100 transition-colors">
              <div className="flex gap-4">
                <div className="p-2 h-fit rounded-xl bg-white text-purple-600 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Deep Reasoning Mode</h4>
                  <p className="text-xs text-slate-500 font-medium">Increases thinking budget for complex strategic audits.</p>
                </div>
              </div>
              <button 
                onClick={() => setDeepReasoning(!deepReasoning)}
                className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${deepReasoning ? 'bg-purple-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${deepReasoning ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group">
              <div className="flex gap-4">
                <div className="p-2 h-fit rounded-xl bg-white text-slate-400">
                  <Terminal size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Grounding Source</h4>
                  <p className="text-xs text-slate-500 font-medium">Use Google Search to validate external context claims.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg">
                Enabled
              </div>
            </div>
          </div>
        </section>

        {/* Notifications & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Bell size={16} className="text-slate-400" /> Notifications
            </h3>
            <div className="space-y-6">
              {[
                { id: 'driftAlerts', label: 'Strategic Drift Alerts', desc: 'Notify on semantic anomalies' },
                { id: 'dailySummary', label: 'Daily Intel Summary', desc: 'Consolidated report at 8am' },
                { id: 'mentions', label: 'Inquiry Mentions', desc: 'Alert when colleagues tag you' }
              ].map(notif => (
                <div key={notif.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{notif.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{notif.desc}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [notif.id]: !prev[notif.id as keyof typeof notifications] }))}
                    className={`w-10 h-5 rounded-full relative transition-colors ${notifications[notif.id as keyof typeof notifications] ? 'bg-purple-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifications[notif.id as keyof typeof notifications] ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" /> Security & Access
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Active</p>
                </div>
                <Button variant="outline" size="sm">Modify</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Audit Logs</p>
                  <p className="text-[10px] text-slate-400 font-medium">42 events this week</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">API Access</p>
                  <p className="text-[10px] text-slate-400 font-medium">2 keys active</p>
                </div>
                <Button variant="outline" size="sm">Keys</Button>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-white text-red-600 shadow-sm group-hover:rotate-6 transition-transform">
              <Lock size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900">Danger Zone</h4>
              <p className="text-sm text-red-700/60 font-medium">Permanently delete this organization and all associated assessments.</p>
            </div>
          </div>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100">Delete Workspace</Button>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
