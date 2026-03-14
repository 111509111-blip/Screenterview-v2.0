import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  SlidersHorizontal, 
  FileText, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2,
  AlertCircle,
  X,
  Linkedin,
  Mail,
  Download,
  Zap,
  Brain,
  Target,
  Award,
  TrendingUp,
  User
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { gradeCVs, GradingWeights } from '../services/ai';

interface Candidate {
  id: string;
  candidateName: string;
  scores: {
    experience: number;
    skills: number;
    education: number;
    cultureFit: number;
    custom: number;
  };
  totalScore: number;
  summary: string;
  experienceDetails: string;
  conclusion: string;
}

export default function SmartSourcing() {
  const [view, setView] = useState<'config' | 'results'>('config');
  const [weights, setWeights] = useState<GradingWeights>({
    experience: 30,
    skills: 30,
    education: 10,
    cultureFit: 10,
    custom: 20
  });
  const [customRequirement, setCustomRequirement] = useState('');
  const [files, setFiles] = useState<{ name: string; text: string; status: 'pending' | 'parsing' | 'ready' | 'error' }[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Candidate | string; direction: 'asc' | 'desc' }>({ key: 'totalScore', direction: 'desc' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.js',
      import.meta.url
    ).toString();
  }, []);

  const handleWeightChange = (key: keyof GradingWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({ data, useSystemFonts: true, disableFontFace: true });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: any) => item.str || '').join(' ') + '\n';
    }
    return fullText.trim();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(f => ({ name: f.name, text: '', status: 'pending' as const }));
    const currentFilesCount = files.length;
    setFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileIndex = currentFilesCount + i;
      
      setFiles(prev => prev.map((f, idx) => idx === fileIndex ? { ...f, status: 'parsing' } : f));
      
      try {
        const text = await parsePDF(file);
        setFiles(prev => prev.map((f, idx) => idx === fileIndex ? { ...f, text, status: 'ready' } : f));
      } catch (error) {
        console.error('Error parsing PDF:', error);
        setFiles(prev => prev.map((f, idx) => idx === fileIndex ? { ...f, status: 'error' } : f));
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGrade = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    
    // For demonstration, if no files are uploaded, generate mock data
    if (readyFiles.length === 0) {
      setIsGrading(true);
      setTimeout(() => {
        const mockCandidates: Candidate[] = [
          { 
            id: 'm1', 
            candidateName: 'Alex Johnson', 
            scores: { experience: 85, skills: 92, education: 75, cultureFit: 88, custom: 80 }, 
            totalScore: 86, 
            summary: 'React Expert • Node.js Depth • Leadership Potential',
            experienceDetails: 'Over 8 years of experience in full-stack development, specializing in React and Node.js.\n\nKey Achievements:\n1. Led a team of 5 developers at a high-growth fintech startup.\n2. Reduced system latency by 40% through microservices optimization.\n3. Architected a real-time trading dashboard used by 50k+ users.',
            conclusion: 'Strong technical leader with deep expertise.\n\n1. **Pros**: Deep technical knowledge, proven leadership, performance optimization skills.\n2. **Cons**: Limited experience with multi-cloud deployments.'
          },
          { 
            id: 'm2', 
            candidateName: 'Sarah Smith', 
            scores: { experience: 65, skills: 78, education: 95, cultureFit: 82, custom: 70 }, 
            totalScore: 76, 
            summary: 'Academic Excellence • Quick Learner • Strong Foundation',
            experienceDetails: 'Recent Computer Science graduate from Stanford with honors.\n\nKey Achievements:\n1. Completed high-impact internships at Google and Meta.\n2. Published research paper on ML algorithm efficiency.\n3. Developed an open-source data visualization tool with 1k+ stars.',
            conclusion: 'Highly intelligent and fast learner.\n\n1. **Pros**: Exceptional academic background, strong algorithmic foundation, proactive open-source contributor.\n2. **Cons**: Lacks professional experience in large-scale production environments.'
          },
          { 
            id: 'm3', 
            candidateName: 'Michael Chen', 
            scores: { experience: 92, skills: 88, education: 65, cultureFit: 75, custom: 95 }, 
            totalScore: 89, 
            summary: 'System Architect • Custom Tech Match • Senior Profile',
            experienceDetails: '12 years of experience in software architecture and system design.\n\nKey Achievements:\n1. Successfully migrated legacy monoliths to cloud-native architectures for Fortune 500 companies.\n2. Designed a distributed data processing pipeline handling petabytes of data.\n3. Authored internal engineering standards for Java/Spring Boot development.',
            conclusion: 'Exceptional architect with proven track record.\n\n1. **Pros**: Deep architectural expertise, experience with large-scale data, strong technical vision.\n2. **Cons**: Management style may be too hierarchical for flat organizations.'
          },
          { 
            id: 'm4', 
            candidateName: 'Emily Davis', 
            scores: { experience: 70, skills: 85, education: 80, cultureFit: 92, custom: 85 }, 
            totalScore: 82, 
            summary: 'Team Player • Balanced Tech Stack • High Culture Fit',
            experienceDetails: '5 years of experience in frontend development with a focus on Vue.js and UX design.\n\nKey Achievements:\n1. Bridged the gap between design and engineering teams, improving workflow efficiency by 30%.\n2. Active contributor to major open-source UI libraries.\n3. Redesigned the core user journey for a leading e-commerce platform.',
            conclusion: 'Great collaborator with a strong eye for design.\n\n1. **Pros**: Excellent communication, strong UX/UI sensibility, solid frontend skills.\n2. **Cons**: Limited backend development experience.'
          },
          { 
            id: 'm5', 
            candidateName: 'David Wilson', 
            scores: { experience: 45, skills: 60, education: 70, cultureFit: 85, custom: 50 }, 
            totalScore: 58, 
            summary: 'Junior Potential • Good Soft Skills • Needs Experience',
            experienceDetails: '2 years of experience in general IT support and basic web maintenance.\n\nKey Achievements:\n1. Completed intensive 6-month full-stack coding bootcamp.\n2. Automated internal reporting processes using Python scripts.\n3. Maintained 99.9% uptime for small-scale client websites.',
            conclusion: 'Enthusiastic with good soft skills.\n\n1. **Pros**: Highly motivated, quick to learn new tools, strong communication.\n2. **Cons**: Technical depth is currently below the senior level required.'
          }
        ];
        setCandidates(mockCandidates);
        setIsGrading(false);
        setView('results');
      }, 1500);
      return;
    }

    setIsGrading(true);
    try {
      const results = await gradeCVs(readyFiles.map(f => f.text), weights, customRequirement);
      setCandidates(results.map((r: any, i: number) => ({ ...r, id: `c-${i}` })));
      setView('results');
    } catch (error) {
      console.error('Grading failed:', error);
    } finally {
      setIsGrading(false);
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aValue: any, bValue: any;
    
    if (sortConfig.key.startsWith('score_')) {
      const scoreKey = sortConfig.key.replace('score_', '') as keyof Candidate['scores'];
      aValue = a.scores[scoreKey];
      bValue = b.scores[scoreKey];
    } else {
      aValue = a[sortConfig.key as keyof Candidate];
      bValue = b[sortConfig.key as keyof Candidate];
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const totalWeight = Object.values(weights).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const renderConfig = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <SlidersHorizontal size={20} className="text-indigo-600" />
              <h2>Grading Configuration</h2>
            </div>
            <div className={`flex flex-col items-end`}>
              <div className={`text-2xl font-bold ${
                totalWeight === 100 ? 'text-emerald-600' : 
                totalWeight > 100 ? 'text-rose-600' : 'text-amber-600'
              }`}>
                {totalWeight}<span className="text-sm text-slate-400 font-normal">/100%</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Weight</div>
            </div>
          </div>
          
          <div className="space-y-6">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-slate-700 font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{value}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={value}
                  onChange={(e) => handleWeightChange(key as keyof GradingWeights, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                
                {key === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <FileText size={12} />
                      <span>Custom Requirements</span>
                    </div>
                    <textarea 
                      value={customRequirement}
                      onChange={(e) => setCustomRequirement(e.target.value)}
                      placeholder="e.g. Must have experience with React and Node.js..."
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all resize-none"
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {totalWeight !== 100 && (
            <div className={`mt-6 p-3 rounded-xl text-xs flex items-center gap-2 border animate-pulse ${
              totalWeight > 100 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              <AlertCircle size={14} />
              {totalWeight > 100 ? 'Total weight exceeds 100%.' : 'Total weight must equal 100%.'}
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-800 font-semibold">Candidates ({files.length})</h2>
            <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
          <div className="space-y-2 max-h-48 overflow-auto pr-2 mb-6">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm group">
                <div className="flex items-center gap-3 truncate">
                  {file.status === 'parsing' ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <FileText size={14} className="text-slate-400" />}
                  <span className="truncate text-slate-700">{file.name}</span>
                </div>
                <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm italic">
                No CVs uploaded yet. (Mock data will be used if empty)
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              Upload
            </button>
            <button 
              onClick={handleGrade}
              disabled={isGrading || totalWeight !== 100}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm text-sm font-medium"
            >
              {isGrading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Grade
            </button>
          </div>
        </section>
      </div>

      <div className="lg:col-span-2 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <div className="text-center space-y-4 p-12">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
            <Search size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-900 font-semibold">Ready to analyze</h3>
            <p className="text-slate-500 text-sm max-w-xs">Configure your weights and upload CVs to see the AI grading results here.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Dashboard Box */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900">Grading Results</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                Live
              </span>
            </div>
            <p className="text-slate-500 font-medium">Analysis of {candidates.length} candidates based on your criteria.</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setView('config')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-lg shadow-slate-200"
            >
              <SlidersHorizontal size={18} />
              Adjust Weights
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{key}</span>
              <span className="text-xl font-black text-slate-900">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results List Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-indigo-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ranked Candidates</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sort:</span>
            <select 
              value={sortConfig.key} 
              onChange={(e) => requestSort(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="totalScore">Total Score</option>
              <option value="candidateName">Name</option>
              <option value="score_experience">Experience</option>
              <option value="score_skills">Skills</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {sortedCandidates.map((c, idx) => (
            <motion.div 
              layout
              key={c.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6 group relative overflow-hidden"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 w-5 h-5 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-[9px] font-black border border-slate-100">
                {idx + 1}
              </div>

              {/* Candidate Details */}
              <div className="flex-1 text-center md:text-left space-y-1.5 pl-4">
                <div>
                  <h3 
                    onClick={() => setSelectedCandidate(c)}
                    className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight cursor-pointer hover:underline decoration-2 underline-offset-4"
                  >
                    {c.candidateName}
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Ref: {c.id}</span>
                  </div>
                </div>
                
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                  {c.summary}
                </p>
              </div>

              {/* Breakdown Visualization */}
              <div className="flex-shrink-0 grid grid-cols-5 gap-2.5 px-6 border-x border-slate-50 hidden lg:grid">
                {Object.entries(c.scores).map(([key, score]) => (
                  <div key={key} className="group/score relative flex flex-col items-center gap-1">
                    <div className="h-10 w-1 bg-slate-50 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${score}%` }}
                        className="absolute bottom-0 left-0 w-full bg-indigo-400 rounded-full"
                      />
                    </div>
                    <span className="text-[7px] font-black text-slate-300 uppercase [writing-mode:vertical-lr] rotate-180">{key.substring(0, 3)}</span>
                  </div>
                ))}
              </div>

              {/* Score Display - Far Right */}
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${
                  c.totalScore >= 85 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                  c.totalScore >= 70 ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
                  c.totalScore >= 50 ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                  'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  <span className="text-2xl font-black tracking-tighter leading-none">{c.totalScore}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-50">Score</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Smart Sourcing</h1>
          <p className="text-slate-500">Batch grade CVs and find the best candidates using AI.</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === 'results' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === 'results' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'config' ? renderConfig() : renderResults()}
        </motion.div>
      </AnimatePresence>

      {/* Redesigned Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Sidebar: Profile & Scores */}
              <div className="w-full md:w-[340px] bg-slate-50 border-r border-slate-100 p-8 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-8 md:hidden">
                  <h2 className="text-xl font-black text-slate-900">Analysis</h2>
                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 rotate-3">
                    <User className="w-12 h-12 text-white -rotate-3" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedCandidate.candidateName}</h3>
                  <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                    Candidate Profile
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-end justify-center gap-1 mb-2">
                    <span className="text-6xl font-black text-indigo-600 leading-none">{selectedCandidate.totalScore}</span>
                    <span className="text-xl font-bold text-slate-300 mb-1">/100</span>
                  </div>
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Match Score</p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Score Breakdown</h4>
                  {Object.entries(selectedCandidate.scores).map(([key, score]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{key}</span>
                        <span className="text-[11px] font-black text-indigo-600">{score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-10 flex gap-3 justify-center">
                  <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right Content: Detailed Analysis */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white">
                <div className="hidden md:flex justify-end mb-8">
                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group"
                  >
                    <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                  </button>
                </div>

                <div className="max-w-2xl">
                  <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">AI Insights</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">
                      {selectedCandidate.summary}
                    </h2>
                    <div className="h-1 w-20 bg-indigo-600 rounded-full" />
                  </header>

                  <div className="space-y-6">
                    <section className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 transition-all hover:border-indigo-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Experience Analysis</h4>
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium text-left">
                        <ReactMarkdown>{selectedCandidate.experienceDetails}</ReactMarkdown>
                      </div>
                    </section>

                    <section className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 transition-all hover:border-indigo-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                          <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Strategic Conclusion</h4>
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium text-left">
                        <ReactMarkdown>{selectedCandidate.conclusion}</ReactMarkdown>
                      </div>
                    </section>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <Award className="w-6 h-6 text-indigo-600 mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Strength</p>
                        <p className="text-sm font-bold text-slate-900">Technical Leadership</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <TrendingUp className="w-6 h-6 text-emerald-600 mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Potential</p>
                        <p className="text-sm font-bold text-slate-900">High Velocity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
