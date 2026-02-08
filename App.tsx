
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectCreator from './components/ProjectCreator';
import FormBuilder from './components/FormBuilder';
import ChatFormSession from './components/ChatFormSession';
import InsightsView from './components/InsightsView';
import PredictiveSandbox from './components/PredictiveSandbox';
import Marketplace from './components/Marketplace';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import DeveloperPortal from './components/DeveloperPortal';
import AssessmentsView from './components/AssessmentsView';
import IntelligenceView from './components/IntelligenceView';
import ProductChatbot from './components/ProductChatbot';
import SettingsView from './components/SettingsView';
import { FormProject, Question } from './types';
import { Loader2 } from 'lucide-react';

const INITIAL_PROJECTS: FormProject[] = [
  {
    id: 'ms-quiz-001',
    organization_id: 'org-1',
    title: 'M&S Employee AI Awareness & Opportunity Quiz',
    description: 'Measuring frontline AI readiness and identifying high-value automation opportunities in retail stores.',
    goal: 'Identify operational friction points where AI can assist frontline staff with inventory and customer queries.',
    status: 'active',
    questions: [
      { id: 'q1', text: 'On a scale of 1-10, how comfortable are you using the new AI stock-checker tool?', type: 'scale' },
      { id: 'q2', text: 'What is the most repetitive task in your daily shift that you wish could be automated?', type: 'text' }
    ],
    createdAt: '3 days ago',
    responsesCount: 156
  },
  {
    id: '1',
    organization_id: 'org-1',
    title: 'Hybrid Work Sentiment',
    description: 'Assessing cultural and operational readiness for hybrid-first transition.',
    goal: 'Decide on the split between remote and office days for Q3.',
    status: 'active',
    questions: [
      { id: 'q1', text: 'How has your productivity changed since the transition?', type: 'text' },
      { id: 'q2', text: 'What infrastructure gaps do you experience at home?', type: 'text' }
    ],
    createdAt: '2 days ago',
    responsesCount: 42
  },
  {
    id: '2',
    organization_id: 'org-1',
    title: 'Product Roadmap Q4',
    description: 'Alignment check with product and engineering leads on roadmap priorities.',
    goal: 'Ensure strategic alignment on high-priority features.',
    status: 'draft',
    questions: [],
    createdAt: '1 week ago',
    responsesCount: 0
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<FormProject[]>(INITIAL_PROJECTS);
  const [isCreating, setIsCreating] = useState(false);
  const [interviewingProject, setInterviewingProject] = useState<FormProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<FormProject | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top on navigation + Lazy loading feel
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450); // Simulates a fast lazy load

    return () => clearTimeout(timer);
  }, [activeTab, selectedProject]);

  const handleCreateProject = (title: string, goal: string, questions: Question[]) => {
    const newProject: FormProject = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: 'org-1',
      title,
      description: `Assessment cycle for: ${goal}`,
      goal,
      status: 'active',
      questions,
      createdAt: 'Just now',
      responsesCount: 0
    };
    setProjects([newProject, ...projects]);
    setIsCreating(false);
    setActiveTab('dashboard');
  };

  const handleManualCreate = (title: string, questions: Question[], segmentIds: string[]) => {
    const newProject: FormProject = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: 'org-1',
      title,
      description: `Manual assessment targeting ${segmentIds.length} segments.`,
      goal: 'Manually defined assessment.',
      status: 'active',
      questions,
      createdAt: 'Just now',
      responsesCount: 0
    };
    setProjects([newProject, ...projects]);
    setActiveTab('dashboard');
  };

  const handleCompleteInterview = (responses: any) => {
    console.log("Interview Complete:", responses);
    setInterviewingProject(null);
  };

  const renderContent = () => {
    if (selectedProject) {
      return <InsightsView project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            onCreateNew={() => setIsCreating(true)} 
            onSelectProject={(p) => {
              if (p.responsesCount > 0) {
                setSelectedProject(p);
              } else {
                setInterviewingProject(p);
              }
            }}
            onViewIntelligence={() => setActiveTab('insights')}
            onViewAssessments={() => setActiveTab('projects')}
            onViewBenchmarks={() => setActiveTab('benchmarks')}
          />
        );
      case 'builder':
        return <FormBuilder onSave={handleManualCreate} />;
      case 'predictive':
        return <PredictiveSandbox project={projects[0]} />;
      case 'marketplace':
        return <Marketplace />;
      case 'benchmarks':
        return <BenchmarkDashboard />;
      case 'developers':
        return <DeveloperPortal />;
      case 'settings':
        return <SettingsView />;
      case 'projects':
        return (
          <AssessmentsView 
            projects={projects} 
            onSelectProject={(p) => {
              if (p.responsesCount > 0) {
                setSelectedProject(p);
              } else {
                setInterviewingProject(p);
              }
            }}
          />
        );
      case 'insights':
        return <IntelligenceView projects={projects} />;
      default:
        return (
          <Dashboard 
            projects={projects} 
            onCreateNew={() => setIsCreating(true)} 
            onSelectProject={setInterviewingProject} 
            onViewIntelligence={() => setActiveTab('insights')}
            onViewAssessments={() => setActiveTab('projects')}
            onViewBenchmarks={() => setActiveTab('benchmarks')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-white selection:bg-purple-100 selection:text-purple-900 antialiased overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main 
        ref={mainContentRef}
        className="flex-1 px-10 py-10 max-w-7xl mx-auto overflow-y-auto scroll-smooth relative"
      >
        {/* Lazy Loading Animation Top Bar */}
        {isPageLoading && (
          <div className="fixed top-0 left-72 right-0 h-[3px] z-[60] bg-slate-50 overflow-hidden">
            <div className="h-full formly-gradient animate-[progress_0.8s_infinite]" style={{ width: '40%' }} />
          </div>
        )}

        <div className={`transition-all duration-500 ${isPageLoading ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          {renderContent()}
        </div>
      </main>

      {isCreating && (
        <ProjectCreator 
          onClose={() => setIsCreating(false)} 
          onSave={handleCreateProject}
        />
      )}

      {interviewingProject && (
        <ChatFormSession 
          project={interviewingProject}
          onComplete={handleCompleteInterview}
          onClose={() => setInterviewingProject(null)}
        />
      )}

      <ProductChatbot />
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
