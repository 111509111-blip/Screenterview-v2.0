import { useState } from 'react';
import { LayoutDashboard, UserCheck, Sparkles, ChevronRight, Search, LogOut, Calendar, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HRSetup, { JobConfig } from './components/HRSetup';
import UploadCV from './components/UploadCV';
import InterviewRoom from './components/InterviewRoom';
import HRReport from './components/HRReport';
import SmartSourcing from './components/SmartSourcing';
import Login from './components/Login';
import { generateHRReport } from './services/ai';

type Feature = 'landing' | 'interviewer' | 'sourcing' | 'matching';
type Step = 'setup' | 'upload' | 'interview' | 'report';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ company: string; email: string } | null>(null);
  const [activeFeature, setActiveFeature] = useState<Feature>('landing');
  const [step, setStep] = useState<Step>('setup');
  const [jobConfig, setJobConfig] = useState<JobConfig | null>(null);
  const [cvText, setCvText] = useState('');
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);
  const [report, setReport] = useState<any>(null);
  const [proctorEvents, setProctorEvents] = useState<any[]>([]);

  const handleSetupComplete = (config: JobConfig) => {
    setJobConfig(config);
    setStep('upload');
  };

  const handleStartInterview = (cv: string) => {
    setCvText(cv);
    setStep('interview');
  };

  const handleFinishInterview = async (interviewHistory: {q: string, a: string}[], events: any[]) => {
    setHistory(interviewHistory);
    setProctorEvents(events);
    setStep('report');
    
    const generatedReport = await generateHRReport(cvText, interviewHistory, jobConfig, events);
    setReport(generatedReport);
  };

  const resetInterviewer = () => {
    setStep('setup');
    setJobConfig(null);
    setCvText('');
    setHistory([]);
    setReport(null);
    setProctorEvents([]);
  };

  const handleLogin = (company: string, email: string) => {
    setUser({ company, email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    resetInterviewer();
    setActiveFeature('landing');
  };

  const renderInterviewer = () => (
    <div className="w-full h-full overflow-auto">
      {step === 'setup' && <HRSetup onComplete={handleSetupComplete} />}
      {step === 'upload' && <UploadCV onStart={handleStartInterview} />}
      {step === 'interview' && <InterviewRoom cvText={cvText} jobConfig={jobConfig} onFinish={handleFinishInterview} />}
      {step === 'report' && <HRReport report={report} history={history} proctorEvents={proctorEvents} />}
    </div>
  );

  const renderLanding = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to AI Interviewer Pro</h1>
        <p className="text-lg text-slate-600">Select a tool to get started with your recruitment process.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFeature('interviewer')}
          className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <UserCheck size={24} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Interviewer</h3>
          <p className="text-slate-500 mb-4">Conduct real-time video interviews with AI-powered follow-up questions and proctoring.</p>
          <div className="mt-auto flex items-center text-indigo-600 font-medium">
            Get Started <ChevronRight size={16} className="ml-1" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFeature('sourcing')}
          className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Sourcing</h3>
          <p className="text-slate-500 mb-4">AI-driven candidate grading and sorting based on your custom requirements and weights.</p>
          <div className="mt-auto flex items-center text-indigo-600 font-medium">
            Get Started <ChevronRight size={16} className="ml-1" />
          </div>
        </motion.button>

        <div className="flex flex-col items-start p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm opacity-75 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-slate-400">
            <Lock size={18} />
          </div>
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-4">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-semibold text-slate-400 mb-2">Interview Matching</h3>
          <p className="text-slate-400 mb-4">Automated scheduling and time-slot matching between interviewers and top candidates.</p>
          <div className="mt-auto flex items-center text-slate-400 font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <span>screenterview</span>
            </div>
            <div className="pl-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">
                {user?.company}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveFeature('landing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeFeature === 'landing' 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <div className="my-2 border-t border-slate-100 mx-2" />

          <button
            onClick={() => setActiveFeature('sourcing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeFeature === 'sourcing' 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Search size={20} />
            <span>Smart Sourcing</span>
          </button>

          <button
            onClick={() => {
              setActiveFeature('interviewer');
              if (activeFeature !== 'interviewer') resetInterviewer();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeFeature === 'interviewer' 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={20} />
            <span>AI Interviewer</span>
          </button>

          <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-300 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              <span className="text-sm">Time Matching</span>
            </div>
            <Lock size={14} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current User</p>
            <p className="text-sm font-medium text-slate-700 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-auto"
          >
            {activeFeature === 'landing' && renderLanding()}
            {activeFeature === 'interviewer' && renderInterviewer()}
            {activeFeature === 'sourcing' && <SmartSourcing />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
