import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  Sparkles,
  BookOpen,
  Briefcase,
  History,
  Check,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Sparkle,
} from 'lucide-react';

interface ResumeReport {
  _id: string;
  fileName: string;
  fileUrl: string;
  version: number;
  atsScore: number;
  readinessScore: number;
  parsedDetails: {
    name: string;
    email: string;
    phone: string;
    education: Array<{ institution: string; degree: string; year: string; cgpa?: string }>;
    experience: Array<{ company: string; role: string; duration: string; description: string }>;
    projects: Array<{ title: string; description: string; technologies: string[] }>;
    skills: string[];
  };
  analysis: {
    missingSkills: string[];
    grammarIssues: Array<{ original: string; suggestion: string; reason: string }>;
    keywordSuggestions: string[];
    projectRecommendations: Array<{ title: string; description: string; complexity: string }>;
    improvements: string[];
  };
  createdAt: string;
}

interface MatchReport {
  matchScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  customizationSuggestions: string[];
}

export function ResumeAnalyzer() {
  const [resumes, setResumes] = useState<ResumeReport[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Job matching states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);

  // Tab views state
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'projects' | 'grammar'>('overview');

  const fetchResumes = async (selectLatest = true) => {
    try {
      const res = await api.get('/resume');
      setResumes(res.data.resumes);
      if (res.data.resumes.length > 0 && selectLatest) {
        setActiveResume(res.data.resumes[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      toast.error('Failed to load resume versions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading and evaluating resume with AI...');

    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume analyzed successfully!', { id: toastId });
      
      // Reload reports and select the new uploaded version
      await fetchResumes(true);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to upload resume.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSyncSkills = async () => {
    if (!activeResume) return;

    try {
      const res = await api.post(`/resume/${activeResume._id}/sync-skills`);
      toast.success(res.data.message || 'Skills synchronized with your profile!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync profile skills.');
    }
  };

  const handleJobMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResume || !jdText.trim() || jdText.length < 50) {
      toast.error('Job Description details must be at least 50 characters.');
      return;
    }

    setIsMatching(true);
    try {
      const res = await api.post(`/resume/${activeResume._id}/match-job`, {
        jdText,
      });
      setMatchReport(res.data.matchReport);
      toast.success('ATS Job Match Score computed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to compare resume with job description.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleVersionChange = (resumeId: string) => {
    const matched = resumes.find((r) => r._id === resumeId);
    if (matched) {
      setActiveResume(matched);
      // Reset match reports
      setMatchReport(null);
      setJdText('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading Resume Analyzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-8 text-left items-start">
        
        {/* Header Title Section */}
        <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-heading">AI Resume Analyzer</h1>
            <p className="text-muted-foreground text-sm">
              Assess ATS alignment, parse structures, scan keyword suggestions, and customize details to fit your dream role.
            </p>
          </div>

          {/* New version upload trigger */}
          {activeResume && (
            <label className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer select-none self-start md:self-auto">
              <UploadCloud className="h-4.5 w-4.5" />
              <span>Upload New Version</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Cold Start / Empty State Upload Dropzone */}
        {!activeResume ? (
          <div className="lg:col-span-12 glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-white/10 hover:border-blue-500/30 transition relative bg-white/[0.01] max-w-2xl mx-auto w-full mt-6">
            <div className="space-y-6">
              <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-heading">Upload your resume to start</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Support formats: PDF or DOCX (max size 5MB). Scanned images are not supported.
                </p>
              </div>
              <label className="inline-block bg-primary hover:opacity-90 transition text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm cursor-pointer select-none">
                <span>Select Document File</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <>
            {/* Left Controls & Score Overview (Col span 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Version History Selector */}
              <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Version Control</span>
                  <span className="text-[10px] text-indigo-400 font-bold flex items-center space-x-1">
                    <History className="h-3 w-3" />
                    <span>v{activeResume.version} Selected</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <select
                    value={activeResume._id}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        Version {r.version} ({r.fileName.substring(0, 18)}...)
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2 pt-2">
                    <a
                      href={activeResume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 transition px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download File</span>
                    </a>
                    
                    <button
                      onClick={handleSyncSkills}
                      className="flex-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Sync Profile Skills</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Circular Gauge Scores */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10 grid grid-cols-2 gap-4">
                
                {/* ATS Score */}
                <div className="text-center space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">ATS Score</span>
                  <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                    {/* Background track circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    {/* Numerical rating */}
                    <span className="text-2xl font-bold font-heading text-blue-400">{activeResume.atsScore}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Structural & format index match</p>
                </div>

                {/* Readiness Score */}
                <div className="text-center space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Readiness</span>
                  <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                    <span className="text-2xl font-bold font-heading text-indigo-400">{activeResume.readinessScore}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Competency match for career target</p>
                </div>

              </div>

              {/* JD Matcher Button Drawer Trigger */}
              <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3 text-center">
                <Sparkles className="h-6 w-6 text-indigo-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Compare Job Description</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Paste standard JD targets to check compatibility scores.
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-full bg-primary hover:opacity-90 transition text-primary-foreground font-semibold py-2 rounded-xl text-xs"
                >
                  Configure JD Matcher
                </button>
              </div>

            </div>

            {/* Right Report Detail View tabs (Col span 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Tab Navigation header */}
              <div className="border-b border-white/10 flex space-x-6 text-sm">
                {(['overview', 'keywords', 'projects', 'grammar'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3.5 capitalize font-semibold transition relative ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-blue-500'
                        : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab: Overview (Extracted text segments & improvements) */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Global Improvement Recommendations */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                    <h3 className="text-base font-bold flex items-center space-x-2">
                      <Sparkle className="h-4.5 w-4.5 text-indigo-400" />
                      <span>General Improvements Recommendations</span>
                    </h3>
                    <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground pl-1">
                      {activeResume.analysis.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <ChevronRight className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Accordion parsed details segments */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-heading">Extracted Sections Details</h3>
                    
                    {/* Education segment card */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
                      <h4 className="text-sm font-bold flex items-center space-x-2 text-blue-400">
                        <BookOpen className="h-4 w-4" />
                        <span>Academic Qualifications</span>
                      </h4>
                      <div className="space-y-3">
                        {activeResume.parsedDetails.education.map((edu, idx) => (
                          <div key={idx} className="text-left border-l border-white/10 pl-3.5 py-1">
                            <h5 className="text-xs font-bold text-white/90">{edu.degree}</h5>
                            <p className="text-[11px] text-muted-foreground">{edu.institution} • Graduation Year: {edu.year}</p>
                            {edu.cgpa && <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">GPA: {edu.cgpa}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Experience segment card */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
                      <h4 className="text-sm font-bold flex items-center space-x-2 text-emerald-400">
                        <Briefcase className="h-4 w-4" />
                        <span>Professional Experience</span>
                      </h4>
                      <div className="space-y-4">
                        {activeResume.parsedDetails.experience.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No work history parsed.</p>
                        ) : (
                          activeResume.parsedDetails.experience.map((exp, idx) => (
                            <div key={idx} className="text-left space-y-1">
                              <h5 className="text-xs font-bold text-white/90">{exp.role}</h5>
                              <p className="text-[10px] text-muted-foreground">{exp.company} • {exp.duration}</p>
                              <p className="text-xs text-white/70 leading-relaxed pt-1.5">{exp.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Projects segment card */}
                    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
                      <h4 className="text-sm font-bold flex items-center space-x-2 text-indigo-400">
                        <FileText className="h-4 w-4" />
                        <span>Technical Projects</span>
                      </h4>
                      <div className="space-y-4">
                        {activeResume.parsedDetails.projects.map((proj, idx) => (
                          <div key={idx} className="text-left space-y-1">
                            <h5 className="text-xs font-bold text-white/90">{proj.title}</h5>
                            <p className="text-xs text-white/70 leading-relaxed pt-1">{proj.description}</p>
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {proj.technologies.map((t, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/60">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Tab: Keywords (Missing keywords checklist) */}
              {activeTab === 'keywords' && (
                <div className="space-y-6">
                  
                  {/* Missing Skills alert grid */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-center space-x-2 text-rose-400">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="text-base font-bold">Skills Missing From Resume</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our intelligence identifies the following standard industry-grade requirements missing relative to your target roles. Use our study widgets to balance.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeResume.analysis.missingSkills.map((sk, idx) => (
                        <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Keyword recommendations */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                    <h3 className="text-base font-bold">Recommended Keywords for Optimization</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Optimize your resume search indexes by incorporating these semantic variants naturally in experience bullet points.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeResume.analysis.keywordSuggestions.map((key, idx) => (
                        <span key={idx} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Projects recommendations */}
              {activeTab === 'projects' && (
                <div className="space-y-6 text-left">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-heading">Recommended Project Milestones</h3>
                    <p className="text-xs text-muted-foreground">
                      Close technical experience gaps by building these recommended projects.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {activeResume.analysis.projectRecommendations.map((proj, idx) => (
                      <div
                        key={idx}
                        className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                              Project Suggestion
                            </span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-purple-400/20 text-purple-400 bg-purple-400/5">
                              {proj.complexity}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-left">{proj.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
                            {proj.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-end">
                          <button
                            onClick={() => {
                              toast.success('Project details forwarded to study planner!');
                            }}
                            className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-3.5 py-1.5 rounded-lg text-[10px] flex items-center space-x-1"
                          >
                            <span>Track progress</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Grammar (Grammar suggestions comparison) */}
              {activeTab === 'grammar' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-heading">Vocabulary & Action-Verbs Optimizer</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recruiter models rank active phrasing. Optimize existing statements:
                  </p>

                  <div className="space-y-4 pt-2">
                    {activeResume.analysis.grammarIssues.map((iss, idx) => (
                      <div key={idx} className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3 text-left">
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-rose-400 block">Original Phrasing</span>
                            <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg text-rose-300 italic">
                              "{iss.original}"
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-emerald-400 block">Suggested Alternative</span>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-emerald-300 font-medium">
                              "{iss.suggestion}"
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          <span className="font-bold text-white/80">Explanation:</span> {iss.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* Slide-out JD Matcher Drawer */}
      {isDrawerOpen && activeResume && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div
            className="w-full max-w-lg bg-slate-950 border-l border-white/10 h-full p-6 flex flex-col justify-between animate-in slide-in-from-right duration-350"
            style={{ boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="text-lg font-bold font-heading">ATS Job Match Checker</h3>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setMatchReport(null);
                    setJdText('');
                  }}
                  className="text-muted-foreground hover:text-white transition text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              {/* Paste Job Description Form */}
              <form onSubmit={handleJobMatch} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Paste Job Description</label>
                  <textarea
                    placeholder="Paste job details, tech stack keywords, and requirements checklist..."
                    rows={8}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-white leading-relaxed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isMatching}
                  className="w-full bg-primary hover:opacity-90 disabled:opacity-50 transition text-primary-foreground font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                >
                  {isMatching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Compute Match Index</span>
                  )}
                </button>
              </form>

              {/* Match Report output */}
              {matchReport && (
                <div className="space-y-5 text-left border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">Overall Compatibility</span>
                    <span className="text-2xl font-bold font-heading text-blue-400">{matchReport.matchScore}%</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Missing Keywords Match</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchReport.missingKeywords.map((k, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">Customization Suggestions</span>
                    <ul className="space-y-2 text-xs text-muted-foreground pl-0.5">
                      {matchReport.customizationSuggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <ChevronRight className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center pt-6 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground">
                Matched against v{activeResume.version} of {activeResume.fileName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
