import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  Sparkles,
  History,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
  Type,
  Copy,
  Check,
  LayoutGrid,
  AlignLeft,
  AlertTriangle,
  Bot,
  CheckCircle,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { Badge } from '../components/mosaic/Badge';

export interface ImprovementSuggestion {
  section: string;
  reference: string;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Stage2ScoringResult {
  overall_score: number;
  job_match_score?: number | null;
  content_quality_score: number;
  ats_compatibility_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: ImprovementSuggestion[];
  summary: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface ExtractionMetadata {
  garbledTextRatio: number;
  tablesDetected: boolean;
  multiColumnSuspected: boolean;
  extractionConfidence: number;
}

export interface Stage1ExtractionResult {
  contact_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  skills?: {
    technical?: string[];
    tools_and_technologies?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name: string;
    description: string[];
    technologies: string[];
    duration?: string;
  }>;
  education?: Array<{
    institution: string;
    degree?: string;
    field?: string;
    duration?: string;
    score?: string;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    duration?: string;
    responsibilities: string[];
  }>;
  certifications?: Array<{ name: string; issuer?: string; date?: string }>;
  achievements?: Array<{ title: string; description?: string }>;
  parsing_warnings?: string[];
}

export interface ResumeReport {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileHash?: string;
  version: number;
  atsScore: number;
  readinessScore: number;
  extractionMetadata?: ExtractionMetadata;
  extractionResult?: Stage1ExtractionResult;
  scoringResult?: Stage2ScoringResult;
  parsedDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    education?: Array<{ institution: string; degree: string; year: string; cgpa?: string }>;
    experience?: Array<{ company: string; role: string; duration: string; description: string }>;
    projects?: Array<{ title: string; description: string; technologies: string[] }>;
    skills?: string[];
  };
  analysis?: {
    missingSkills?: string[];
    grammarIssues?: Array<{ original: string; suggestion: string; reason: string }>;
    keywordSuggestions?: string[];
    projectRecommendations?: Array<{ title: string; description: string; complexity: string }>;
    improvements?: string[];
  };
  createdAt: string;
}

// Error Boundary Wrapper
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ResumeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ResumeAnalyzer Component Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <MosaicShell>
          <div className="mosaic-card p-8 text-center space-y-4 max-w-xl mx-auto my-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Resume Analysis Display Encountered an Issue
            </h3>
            <p className="text-xs text-slate-600">
              An unexpected formatting error occurred. You can reload to retry.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mosaic-btn-brand !py-2 !px-4 !text-xs inline-flex items-center space-x-2"
            >
              <span>Reload Resume Analyzer</span>
            </button>
          </div>
        </MosaicShell>
      );
    }
    return this.props.children;
  }
}

function ResumeAnalyzerContent() {
  const [resumes, setResumes] = useState<ResumeReport[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uploading state and step indicator: 1 = Stage 1, 2 = Stage 2, 3 = Claude Prompt
  const [isUploading, setIsUploading] = useState(false);
  const [executionStep, setExecutionStep] = useState<number>(0);

  // Left form inputs
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('');

  // Upload mode: 'file' | 'text'
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('text');
  const [pastedResumeText, setPastedResumeText] = useState('');

  // Right pane view mode: 'visual' | 'formatted-text' | 'claude-prompt'
  const [reportViewMode, setReportViewMode] = useState<'visual' | 'formatted-text' | 'claude-prompt'>('visual');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resume');
      const list = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0) {
        setActiveResume(list[0]);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
      toast.error('Failed to load resume analysis history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Step-by-step pipeline execution for File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx|txt|md|markdown)$/i)) {
      toast.error('Please upload a PDF, DOCX, TXT, or MD file.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', targetRole);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    setIsUploading(true);
    setExecutionStep(1);

    try {
      // Step 1 to Step 2 simulation indicator
      setTimeout(() => setExecutionStep(2), 1200);

      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExecutionStep(3);
      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
      toast.success(res.data.message || 'Stage 1 & Stage 2 Analysis completed successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setIsUploading(false);
      setExecutionStep(0);
    }
  };

  // Step-by-step pipeline execution for Pasted Text
  const handlePastedTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedResumeText.trim()) {
      toast.error('Please paste your resume text to analyze.');
      return;
    }

    setIsUploading(true);
    setExecutionStep(1);

    try {
      setTimeout(() => setExecutionStep(2), 1200);

      const res = await api.post('/resume/upload', {
        resumeText: pastedResumeText.trim(),
        role: targetRole,
        jobDescription: jobDescription.trim() || undefined,
        fileName: 'Pasted_Resume_Text.txt',
      });

      setExecutionStep(3);
      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
      toast.success('Single-click Stage 1 & Stage 2 Analysis completed!');
    } catch (err: any) {
      console.error('Pasted text upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume text.');
    } finally {
      setIsUploading(false);
      setExecutionStep(0);
    }
  };

  const generateFormattedTextReport = (): string => {
    if (!activeResume) return '';
    const scoring = activeResume.scoringResult;
    const overall = scoring?.overall_score ?? activeResume.atsScore ?? 0;
    const contentQ = scoring?.content_quality_score ?? activeResume.readinessScore ?? 0;
    const atsComp = scoring?.ats_compatibility_score ?? activeResume.atsScore ?? 0;
    const jobMatch = scoring?.job_match_score;

    const suggestions = scoring?.improvement_suggestions || [];
    const matchedKw = scoring?.matched_keywords || activeResume.parsedDetails?.skills || [];
    const missingKw = scoring?.missing_keywords || activeResume.analysis?.missingSkills || [];
    const strengths = scoring?.strengths || [];
    const weaknesses = scoring?.weaknesses || [];

    const formattedDate = activeResume.createdAt ? new Date(activeResume.createdAt).toLocaleString() : 'N/A';

    return `============================================================
              ATS RESUME EVALUATION REPORT
============================================================
FILE NAME    : ${activeResume.fileName || 'Resume'} (v${activeResume.version || 1})
TARGET ROLE  : ${scoring?.targetRole || targetRole}
ANALYZED ON  : ${formattedDate}

------------------------------------------------------------
SCORE BREAKDOWN
------------------------------------------------------------
[OVERALL SCORE]            : ${overall} / 100
[CONTENT QUALITY SCORE]    : ${contentQ} / 100
[ATS COMPATIBILITY SCORE]  : ${atsComp} / 100
[JOB MATCH SCORE]          : ${jobMatch !== null && jobMatch !== undefined ? `${jobMatch} / 100` : 'N/A (No JD provided)'}

------------------------------------------------------------
EVALUATION SUMMARY
------------------------------------------------------------
${scoring?.summary || 'No summary provided.'}

------------------------------------------------------------
KEYWORD ANALYSIS
------------------------------------------------------------
✅ MATCHED KEYWORDS:
   ${matchedKw.length > 0 ? matchedKw.join(', ') : 'None'}

❌ MISSING KEYWORDS (REQUIRED FOR TARGET ROLE):
   ${missingKw.length > 0 ? missingKw.join(', ') : 'None'}

------------------------------------------------------------
ACTIONABLE IMPROVEMENT RECOMMENDATIONS
------------------------------------------------------------
${
  suggestions.length > 0
    ? suggestions
        .map(
          (s, i) => `
[RECOMMENDATION #${i + 1}]
  • SECTION    : ${s.section || 'General'}
  • PRIORITY   : [${(s.priority || 'MED').toUpperCase()}]
  • REFERENCE  : "${s.reference || 'N/A'}"
  • ISSUE      : ${s.issue || 'N/A'}
  • ACTION     : ${s.suggestion || 'N/A'}`
        )
        .join('\n')
    : '  No critical issues detected.'
}

------------------------------------------------------------
STRENGTHS & AREAS FOR GROWTH
------------------------------------------------------------
💪 KEY STRENGTHS:
   ${strengths.length > 0 ? strengths.map((s) => `• ${s}`).join('\n   ') : '• Clean formatting'}

⚠️ AREAS FOR GROWTH:
   ${weaknesses.length > 0 ? weaknesses.map((w) => `• ${w}`).join('\n   ') : '• Add quantified metrics'}
============================================================`;
  };

  // Generate Copy-Pastable Instructions Prompt for Claude to rewrite resume
  const generateClaudePrompt = (): string => {
    if (!activeResume) return '';
    const scoring = activeResume.scoringResult;
    const extraction = activeResume.extractionResult;

    const contact = extraction?.contact_info || activeResume.parsedDetails;
    const skills = extraction?.skills || { technical: activeResume.parsedDetails?.skills || [], tools_and_technologies: [], soft: [] };
    const experience = extraction?.experience || activeResume.parsedDetails?.experience || [];
    const projects = extraction?.projects || activeResume.parsedDetails?.projects || [];
    const education = extraction?.education || activeResume.parsedDetails?.education || [];
    const suggestions = scoring?.improvement_suggestions || [];
    const matchedKw = scoring?.matched_keywords || [];
    const missingKw = scoring?.missing_keywords || [];

    return `You are an elite executive resume writer and ATS optimization expert.
Your goal is to completely rewrite, polish, and generate a new, high-scoring ATS-optimized resume for the candidate tailored precisely for the target position of "${scoring?.targetRole || targetRole}".

============================================================
1. TARGET ROLE & JOB REQUIREMENTS
============================================================
TARGET ROLE: ${scoring?.targetRole || targetRole}
${scoring?.jobDescription ? `JOB DESCRIPTION:\n${scoring.jobDescription}\n` : ''}

============================================================
2. CRITICAL AI IMPROVEMENTS TO INTEGRATE (MANDATORY FIXES)
============================================================
${
  suggestions.length > 0
    ? suggestions
        .map(
          (s, i) => `[FIX #${i + 1} - SECTION: ${s.section} | PRIORITY: ${(s.priority || 'MED').toUpperCase()}]
  • Problem Detected: ${s.issue}
  • Actionable Fix: ${s.suggestion}
  ${s.reference ? `• Reference Text: "${s.reference}"` : ''}`
        )
        .join('\n\n')
    : '• Upgrade all bullet points to use strong action verbs and quantified impact metrics (% increase, $ saved, latency reduced).'
}

KEYWORD GAP INJECTION MANDATE:
• Missing ATS Keywords to Integrate Seamlessly: ${missingKw.length > 0 ? missingKw.join(', ') : 'None missing'}
• Currently Matched Keywords to Retain: ${matchedKw.join(', ')}

============================================================
3. FULL CANDIDATE RESUME DATA (RETAIN ALL REAL DETAILS & ACCURACY)
============================================================
NAME     : ${contact?.name || 'Candidate Name'}
EMAIL    : ${contact?.email || 'email@example.com'}
PHONE    : ${contact?.phone || 'N/A'}
LOCATION : ${(contact as any)?.location || 'N/A'}

SKILLS:
• Technical Skills      : ${skills.technical?.join(', ') || 'N/A'}
• Tools & Technologies  : ${skills.tools_and_technologies?.join(', ') || 'N/A'}
• Soft Skills           : ${skills.soft?.join(', ') || 'N/A'}

WORK EXPERIENCE:
${
  experience.length > 0
    ? experience
        .map(
          (e: any) => `COMPANY: ${e.company} | ROLE: ${e.role} | DURATION: ${e.duration || 'N/A'}
RESPONSIBILITIES & ACHIEVEMENTS:
${Array.isArray(e.responsibilities) ? e.responsibilities.map((r: string) => `  - ${r}`).join('\n') : `  - ${e.description || e.responsibilities}`}`
        )
        .join('\n\n')
    : 'No prior formal work experience listed.'
}

PROJECTS:
${
  projects.length > 0
    ? projects
        .map(
          (p: any) => `PROJECT NAME: ${p.name || p.title} | DURATION: ${p.duration || 'N/A'}
TECHNOLOGIES USED: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || 'N/A'}
DESCRIPTION & BULLET POINTS:
${Array.isArray(p.description) ? p.description.map((d: string) => `  - ${d}`).join('\n') : `  - ${p.description}`}`
        )
        .join('\n\n')
    : 'No projects listed.'
}

EDUCATION:
${
  education.length > 0
    ? education
        .map(
          (ed: any) =>
            `INSTITUTION: ${ed.institution} | DEGREE: ${ed.degree || ed.field} | DURATION/YEAR: ${ed.duration || ed.year} | SCORE: ${ed.score || ed.cgpa || 'N/A'}`
        )
        .join('\n')
    : 'Education details listed.'
}

============================================================
4. OUTPUT GENERATION INSTRUCTION FOR CLAUDE
============================================================
1. Output the complete, new, updated resume in clean Markdown format with standard ATS headers (SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION).
2. Format experience and project bullets using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
3. Seamlessly inject all missing keywords (${missingKw.join(', ')}) into relevant project and experience bullet points.
4. Ensure zero placeholder text — use only factual details provided above.
5. Add a 3-bullet "Key Improvements Applied" summary at the very top of your output.`;
  };

  const handleCopyFormattedText = () => {
    const text = generateFormattedTextReport();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Formatted text report copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyClaudePrompt = () => {
    const text = generateClaudePrompt();
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    toast.success('Claude Prompt copied to clipboard! Paste directly into Claude / ChatGPT.');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading 2-Stage ATS Resume Analyzer...</p>
        </div>
      </div>
    );
  }

  const scoring = activeResume?.scoringResult;
  const metadata = activeResume?.extractionMetadata;
  const extraction = activeResume?.extractionResult;

  const overallScore = scoring?.overall_score ?? activeResume?.atsScore ?? 0;
  const contentQuality = scoring?.content_quality_score ?? activeResume?.readinessScore ?? 0;
  const atsCompatibility = scoring?.ats_compatibility_score ?? activeResume?.atsScore ?? 0;
  const jobMatchScore = scoring?.job_match_score;

  return (
    <MosaicShell>
      <TopHeader
        title="ATS Resume Analyzer — Pipeline Stage 1 & 2"
        subtitle="Single-click step-by-step execution: Input role, job description, and resume content to generate instant scores, telemetry, and Claude rewrite prompt"
      />

      {/* Main Split Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 Cols): Inputs & File/Text Upload */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Target Role & Job Description Inputs */}
          <div className="mosaic-card p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                <span>1. Target Career Role *</span>
              </label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Java Developer, Fullstack Engineer"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center justify-between">
                <span>2. Job Description (JD Text)</span>
                <span className="text-[10px] text-teal-700 font-semibold">Optional for JD Matching</span>
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job requirements here (e.g. Core Java, Kafka, Kubernetes, Docker)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Resume Content Input Box (Upload File OR Paste Text) */}
          <div className="mosaic-card p-6 space-y-4 text-left border-2 border-slate-200 hover:border-teal-500 transition">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                3. Resume Content Input
              </span>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`py-1 px-3 text-xs font-bold rounded-lg transition flex items-center space-x-1 border-none focus:outline-none cursor-pointer ${
                    uploadMode === 'text'
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <Type className="h-3.5 w-3.5" />
                  <span>Paste Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`py-1 px-3 text-xs font-bold rounded-lg transition flex items-center space-x-1 border-none focus:outline-none cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {uploadMode === 'text' ? (
              <form onSubmit={handlePastedTextSubmit} className="space-y-4">
                <div className="space-y-1">
                  <textarea
                    rows={8}
                    required
                    placeholder="Paste full resume text or markdown here... (Triggers Stage 1 Extraction & Stage 2 Scoring with 1-click)"
                    value={pastedResumeText}
                    onChange={(e) => setPastedResumeText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading || !pastedResumeText.trim()}
                  className="mosaic-btn-brand w-full !py-3 !text-xs flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isUploading ? 'Executing Stage 1 & Stage 2 Pipeline...' : 'Analyze Resume (Single Click)'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading">
                    Upload Resume Document
                  </h3>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-1">
                    Supports <strong>PDF, DOCX, TXT, MD</strong>
                  </p>
                </div>

                <label className="mosaic-btn-brand !py-3 !px-6 !text-xs cursor-pointer inline-flex items-center space-x-2 w-full justify-center">
                  <UploadCloud className="h-4 w-4" />
                  <span>{isUploading ? 'Executing Stage 1 & Stage 2...' : 'Select File & Analyze Resume'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.markdown"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Live Step-by-Step Execution Progress Indicator */}
          {isUploading && (
            <div className="mosaic-card p-4 space-y-3 bg-teal-50/70 border border-teal-200">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
                ⚡ Step-by-Step Execution Progress
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  {executionStep > 1 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                  )}
                  <span className={executionStep >= 1 ? 'font-bold text-teal-900' : 'text-slate-500'}>
                    [1/3] Stage 1: Structure & Skill Telemetry Extraction
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {executionStep > 2 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : executionStep === 2 ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300"></div>
                  )}
                  <span className={executionStep >= 2 ? 'font-bold text-teal-900' : 'text-slate-500'}>
                    [2/3] Stage 2: Content Quality & ATS Scoring Execution
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {executionStep >= 3 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300"></div>
                  )}
                  <span className={executionStep >= 3 ? 'font-bold text-teal-900' : 'text-slate-500'}>
                    [3/3] Generating Formatted Report & Claude Prompt
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* History List Card */}
          <div className="mosaic-card p-5 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2">
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-bold text-[var(--ink-900)] font-heading">
                  Analysis History ({resumes.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {resumes.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] italic text-center py-3">
                  No previous analysis found. Paste or upload one to start!
                </p>
              ) : (
                resumes.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => setActiveResume(r)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      activeResume?._id === r._id
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                        : 'border-[var(--card-border)] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--ink-900)] truncate">{r.fileName}</h4>
                        <span className="text-[10px] text-[var(--ink-muted)]">
                          v{r.version || 1} • {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Badge tone={r.atsScore >= 80 ? 'success' : r.atsScore >= 60 ? 'warning' : 'danger'}>
                      {r.atsScore} Score
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Stage 1 & Stage 2 Evaluation Results */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {!activeResume ? (
            <div className="mosaic-card p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[var(--ink-900)]">No Active Analysis Report</h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Fill in the target role, optional job description, and paste your resume content on the left, then click <strong>Analyze Resume</strong> to view Stage 1 & Stage 2 output.
              </p>
            </div>
          ) : (
            <>
              {/* Report Header Card */}
              <div className="mosaic-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block font-heading">
                      Active Resume v{activeResume.version || 1} • {scoring?.targetRole || targetRole}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--ink-900)] font-heading">{activeResume.fileName || 'Resume'}</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Visual Cards vs Formatted Text vs Claude Prompt */}
                    <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setReportViewMode('visual')}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg transition flex items-center space-x-1 border-none focus:outline-none cursor-pointer ${
                          reportViewMode === 'visual'
                            ? 'bg-white text-teal-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>Visual</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportViewMode('formatted-text')}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg transition flex items-center space-x-1 border-none focus:outline-none cursor-pointer ${
                          reportViewMode === 'formatted-text'
                            ? 'bg-white text-teal-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                        <span>Text Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportViewMode('claude-prompt')}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg transition flex items-center space-x-1 border-none focus:outline-none cursor-pointer ${
                          reportViewMode === 'claude-prompt'
                            ? 'bg-white text-purple-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 bg-transparent'
                        }`}
                      >
                        <Bot className="h-3.5 w-3.5 text-purple-600" />
                        <span>Claude Prompt</span>
                      </button>
                    </div>

                    {activeResume.fileUrl && (
                      <a
                        href={activeResume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mosaic-btn-primary !py-2 !px-3.5 !text-xs flex items-center space-x-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>

                {reportViewMode === 'claude-prompt' ? (
                  /* Claude Prompt Tab View */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="flex items-center space-x-2 text-xs font-bold text-purple-950">
                        <Bot className="h-4 w-4 text-purple-700" />
                        <span>Claude Resume Rewrite Instruction Prompt</span>
                      </div>
                      <button
                        onClick={handleCopyClaudePrompt}
                        className="mosaic-btn-brand !bg-purple-700 hover:!bg-purple-800 !py-1.5 !px-3.5 !text-xs flex items-center space-x-1.5 border-none cursor-pointer"
                      >
                        {copiedPrompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Claude Prompt'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Copy the instruction prompt below and paste it into <strong>Claude (claude.ai)</strong>, <strong>ChatGPT</strong>, or <strong>Gemini</strong>. It includes all your extracted resume details, target role context, and AI improvement recommendations to generate a complete, rewritten resume!
                    </p>

                    <pre className="p-5 rounded-2xl bg-slate-950 text-purple-200 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-purple-900 shadow-inner max-h-[500px]">
                      {generateClaudePrompt()}
                    </pre>
                  </div>
                ) : reportViewMode === 'formatted-text' ? (
                  /* Formatted Text Report View */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                        <AlignLeft className="h-4 w-4 text-teal-600" />
                        <span>Well-Formatted Text Evaluation Report</span>
                      </div>
                      <button
                        onClick={handleCopyFormattedText}
                        className="mosaic-btn-brand !py-1.5 !px-3.5 !text-xs flex items-center space-x-1.5"
                      >
                        {copiedText ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedText ? 'Copied!' : 'Copy Formatted Text'}</span>
                      </button>
                    </div>

                    <pre className="p-5 rounded-2xl bg-slate-900 text-teal-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800 shadow-inner max-h-[500px]">
                      {generateFormattedTextReport()}
                    </pre>
                  </div>
                ) : (
                  /* Visual Dashboard View */
                  <div className="space-y-6">
                    {/* Score Gauges Row (Deterministic Weighted Formula) */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                          Overall Score (Weighted)
                        </span>
                        <div className="text-3xl font-extrabold text-teal-950 mt-2">{overallScore} / 100</div>
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">
                          {jobMatchScore !== null && jobMatchScore !== undefined
                            ? '45% JD + 30% Quality + 25% ATS'
                            : '60% Quality + 40% ATS'}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                          Content Quality Score
                        </span>
                        <div className="text-3xl font-extrabold text-blue-950 mt-2">{contentQuality} / 100</div>
                        <span className="text-[10px] text-blue-700 font-semibold mt-1">Action verbs & metrics</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                          ATS Compatibility
                        </span>
                        <div className="text-3xl font-extrabold text-purple-950 mt-2">{atsCompatibility} / 100</div>
                        <span className="text-[10px] text-purple-700 font-semibold mt-1">Structural & parsing risk</span>
                      </div>
                    </div>

                    {/* Text Extraction Telemetry Header */}
                    {metadata && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4 text-teal-600" />
                          <span className="font-bold text-slate-800">Extraction Telemetry:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="bg-white border px-2 py-0.5 rounded font-semibold text-slate-700">
                            Confidence: {((metadata.extractionConfidence || 1.0) * 100).toFixed(0)}%
                          </span>
                          <span className="bg-white border px-2 py-0.5 rounded font-semibold text-slate-700">
                            Garbled Ratio: {((metadata.garbledTextRatio || 0.0) * 100).toFixed(1)}%
                          </span>
                          <span className={`border px-2 py-0.5 rounded font-semibold ${metadata.tablesDetected ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-700'}`}>
                            Tables: {metadata.tablesDetected ? 'Detected ⚠️' : 'None'}
                          </span>
                          <span className={`border px-2 py-0.5 rounded font-semibold ${metadata.multiColumnSuspected ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-slate-700'}`}>
                            Multi-Column: {metadata.multiColumnSuspected ? 'Suspected ⚠️' : 'None'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Evaluation Summary Box */}
                    {scoring?.summary && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-teal-800 uppercase block font-heading">
                          Stage 2 Evaluation Summary
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{scoring.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Priority Improvement Suggestions */}
              {scoring?.improvement_suggestions && scoring.improvement_suggestions.length > 0 && (
                <div className="mosaic-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-teal-600" />
                    <span>Targeted Improvement Suggestions ({scoring.improvement_suggestions.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {scoring.improvement_suggestions.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 uppercase font-heading">
                            {s.section || 'General'} Section
                          </span>
                          <Badge tone={s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'info'}>
                            {s.priority ? s.priority.toUpperCase() : 'MED'} PRIORITY
                          </Badge>
                        </div>

                        {s.reference && (
                          <p className="text-[11px] italic text-slate-500 bg-white p-2 rounded border border-slate-200">
                            Reference: "{s.reference}"
                          </p>
                        )}

                        <div className="text-xs space-y-1">
                          <p className="text-rose-800 font-semibold">Issue: {s.issue || 'N/A'}</p>
                          <p className="text-emerald-800 font-bold">Actionable Suggestion: {s.suggestion || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses Grid */}
              {scoring && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="mosaic-card p-6 space-y-3">
                    <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Key Strengths</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(scoring.strengths || []).map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mosaic-card p-6 space-y-3">
                    <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>Areas for Growth</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(scoring.weaknesses || []).map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Matched & Missing Keywords Breakdown */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="mosaic-card p-6 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center justify-between">
                    <span>Matched Keywords</span>
                    <Badge tone="success">
                      {(scoring?.matched_keywords || []).length} Matched
                    </Badge>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      scoring?.matched_keywords ||
                      extraction?.skills?.technical ||
                      activeResume?.parsedDetails?.skills ||
                      []
                    ).map((s, i) => (
                      <Badge key={i} tone="info">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mosaic-card p-6 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center justify-between">
                    <span>Missing Target Keywords</span>
                    <Badge tone="warning">
                      {(scoring?.missing_keywords || []).length} Missing
                    </Badge>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      scoring?.missing_keywords ||
                      activeResume?.analysis?.missingSkills ||
                      []
                    ).map((k, i) => (
                      <Badge key={i} tone="warning">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </MosaicShell>
  );
}

export default function ResumeAnalyzer() {
  return (
    <ResumeErrorBoundary>
      <ResumeAnalyzerContent />
    </ResumeErrorBoundary>
  );
}
