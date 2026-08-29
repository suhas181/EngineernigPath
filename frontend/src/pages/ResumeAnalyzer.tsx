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
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Target,
  RefreshCw,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { Badge } from '../components/mosaic/Badge';

export interface ImprovementSuggestion {
  section?: string;
  reference?: string;
  text?: string;
  issue?: string;
  suggestion?: string;
  priority?: 'high' | 'medium' | 'low' | string;
}

export interface Stage2ScoringResult {
  overall_score?: number;
  job_match_score?: number | null;
  content_quality_score?: number;
  ats_compatibility_score?: number;
  experience_evidence_score?: number;
  projects_quality_score?: number;
  completeness_score?: number;
  placeholder_penalty?: number;
  component_explanations?: {
    overall?: string;
    ats_compatibility?: string;
    content_quality?: string;
    job_match?: string;
    experience_evidence?: string;
    projects_quality?: string;
    completeness?: string;
  };
  matched_keywords?: string[];
  missing_keywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  improvement_suggestions?: ImprovementSuggestion[];
  summary?: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface ExtractionMetadata {
  garbledTextRatio?: number;
  tablesDetected?: boolean;
  multiColumnSuspected?: boolean;
  extractionConfidence?: number;
}

export interface Stage1ExtractionResult {
  contact_info?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
    links?: string[];
  };
  skills?: {
    technical?: string[];
    programming_languages?: string[];
    frameworks?: string[];
    libraries?: string[];
    databases?: string[];
    cloud_and_tools?: string[];
    tools_and_technologies?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name?: string;
    title?: string;
    description?: string[] | string;
    technologies?: string[] | string;
    duration?: string | null;
    dates?: string | null;
    link?: string | null;
  }>;
  education?: Array<{
    institution?: string;
    school?: string;
    university?: string;
    degree?: string | null;
    field?: string | null;
    major?: string | null;
    duration?: string | null;
    dates?: string | null;
    year?: string | null;
    score?: string | null;
    cgpa?: string | null;
  }>;
  experience?: Array<{
    company?: string;
    organization?: string;
    role?: string;
    title?: string;
    duration?: string | null;
    dates?: string | null;
    location?: string | null;
    responsibilities?: string[] | string;
    description?: string;
  }>;
  internships?: Array<{
    company?: string;
    role?: string;
    title?: string;
    duration?: string | null;
    dates?: string | null;
    location?: string | null;
    responsibilities?: string[] | string;
  }>;
  certifications?: Array<{ name?: string; issuer?: string | null; date?: string | null; link?: string | null } | string>;
  achievements?: Array<{ title?: string; name?: string; description?: string | null } | string>;
  publications?: Array<{ title?: string; publisher?: string | null; date?: string | null; link?: string | null }>;
  awards?: Array<{ title?: string; issuer?: string | null; date?: string | null; description?: string | null }>;
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
  overallScore?: number;
  contentQualityScore?: number;
  jobMatchScore?: number | null;
  experienceEvidenceScore?: number;
  projectsQualityScore?: number;
  completenessScore?: number;
  analysisConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  extractionMetadata?: ExtractionMetadata;
  extractionResult?: Stage1ExtractionResult;
  scoringResult?: Stage2ScoringResult;
  parsedDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    education?: Array<{ institution?: string; degree?: string; year?: string; cgpa?: string }>;
    experience?: Array<{ company?: string; role?: string; duration?: string; description?: string }>;
    projects?: Array<{ title?: string; description?: string; technologies?: string[] }>;
    skills?: string[];
  };
  analysis?: {
    missingSkills?: string[];
    grammarIssues?: Array<{ original: string; suggestion: string; reason: string }>;
    keywordSuggestions?: string[];
    projectRecommendations?: Array<{ title: string; description: string; complexity: string }>;
    improvements?: string[];
    placeholderWarnings?: Array<{ type: string; text: string; severity: string; message: string }>;
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
              An unexpected formatting error occurred: {this.state.error?.message || 'Check console log'}.
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

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [isMatchingJd, setIsMatchingJd] = useState(false);

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

  // Pipeline execution for File Upload
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

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
      toast.success(res.data.message || 'Resume analyzed successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setIsUploading(false);
    }
  };

  // Pipeline execution for Pasted Text
  const handlePastedTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedResumeText.trim()) {
      toast.error('Please paste your resume text to analyze.');
      return;
    }

    setIsUploading(true);

    try {
      const res = await api.post('/resume/upload', {
        resumeText: pastedResumeText.trim(),
        role: targetRole,
        jobDescription: jobDescription.trim() || undefined,
        fileName: 'Pasted_Resume.txt',
      });

      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
      toast.success('Resume analysis completed successfully!');
    } catch (err: any) {
      console.error('Pasted text upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume text.');
    } finally {
      setIsUploading(false);
    }
  };

  // Instant Job Description Re-Matching on Active Resume
  const handleReMatchJob = async () => {
    if (!activeResume) return;
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description in the left pane to match against.');
      return;
    }

    setIsMatchingJd(true);
    try {
      const res = await api.post(`/resume/${activeResume._id}/match-job`, {
        jdText: jobDescription.trim(),
        jobTitle: targetRole,
      });

      const updatedResume = res.data.resume;
      setActiveResume(updatedResume);
      setResumes((prev) => prev.map((r) => (r._id === updatedResume._id ? updatedResume : r)));
      toast.success('Job description match updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to calculate job description match.');
    } finally {
      setIsMatchingJd(false);
    }
  };

  const generateFormattedTextReport = (): string => {
    if (!activeResume) return '';
    const scoring = activeResume.scoringResult;
    const overall = activeResume.overallScore ?? scoring?.overall_score ?? activeResume.atsScore ?? 0;
    const contentQ = activeResume.contentQualityScore ?? scoring?.content_quality_score ?? activeResume.readinessScore ?? 0;
    const atsComp = activeResume.atsScore ?? scoring?.ats_compatibility_score ?? 0;
    const jobMatch = activeResume.jobMatchScore ?? scoring?.job_match_score;

    const expScore = activeResume.experienceEvidenceScore ?? scoring?.experience_evidence_score ?? 0;
    const projScore = activeResume.projectsQualityScore ?? scoring?.projects_quality_score ?? 0;
    const compScore = activeResume.completenessScore ?? scoring?.completeness_score ?? 0;
    const penalty = scoring?.placeholder_penalty ?? 0;

    const suggestions = Array.isArray(scoring?.improvement_suggestions) ? scoring.improvement_suggestions : [];
    const matchedKw = Array.isArray(scoring?.matched_keywords) ? scoring.matched_keywords : activeResume.parsedDetails?.skills || [];
    const missingKw = Array.isArray(scoring?.missing_keywords) ? scoring.missing_keywords : activeResume.analysis?.missingSkills || [];
    const strengths = Array.isArray(scoring?.strengths) ? scoring.strengths : [];
    const weaknesses = Array.isArray(scoring?.weaknesses) ? scoring.weaknesses : [];

    const formattedDate = activeResume.createdAt ? new Date(activeResume.createdAt).toLocaleString() : 'N/A';

    return `============================================================
          RESUME EVALUATION REPORT (MULTI-DIMENSIONAL)
============================================================
FILE NAME           : ${activeResume.fileName || 'Resume'} (v${activeResume.version || 1})
TARGET ROLE         : ${scoring?.targetRole || targetRole}
ANALYSIS CONFIDENCE : ${activeResume.analysisConfidence || 'HIGH'}
ANALYZED ON         : ${formattedDate}

------------------------------------------------------------
MULTI-DIMENSIONAL SCORE BREAKDOWN
------------------------------------------------------------
[OVERALL RESUME SCORE]     : ${overall} / 100
[ATS COMPATIBILITY EST.]   : ${atsComp} / 100  (Weight: 20%)
[CONTENT QUALITY SCORE]    : ${contentQ} / 100 (Weight: 20%)
[JOB MATCH SCORE]          : ${jobMatch !== null && jobMatch !== undefined ? `${jobMatch} / 100 (Weight: 25%)` : 'N/A (No JD provided — evaluated on role baseline)'}
[EXPERIENCE EVIDENCE]      : ${expScore} / 100 (Weight: 15%)
[PROJECTS QUALITY]         : ${projScore} / 100 (Weight: 10%)
[PROFILE COMPLETENESS]     : ${compScore} / 100 (Weight: 10%)
${penalty > 0 ? `[PLACEHOLDER PENALTY]      : -${penalty} pts\n` : ''}
------------------------------------------------------------
EXPLAINABLE SCORE BREAKDOWN
------------------------------------------------------------
• Overall        : ${scoring?.component_explanations?.overall || 'Evaluated across multi-dimensional criteria.'}
• ATS Structure  : ${scoring?.component_explanations?.ats_compatibility || 'Clean standard formatting.'}
• Content Quality: ${scoring?.component_explanations?.content_quality || 'Technical implementation and action verbs evaluated.'}
• Job Alignment  : ${scoring?.component_explanations?.job_match || 'Role competency alignment evaluated.'}
• Experience     : ${scoring?.component_explanations?.experience_evidence || 'Work experience and internships analyzed.'}
• Projects       : ${scoring?.component_explanations?.projects_quality || 'Project technical stack and complexity analyzed.'}
• Completeness   : ${scoring?.component_explanations?.completeness || 'Core section coverage analyzed.'}

------------------------------------------------------------
EVALUATION SUMMARY
------------------------------------------------------------
${scoring?.summary || 'Evaluation summary generated.'}

------------------------------------------------------------
KEYWORD ANALYSIS
------------------------------------------------------------
✅ MATCHED KEYWORDS:
   ${matchedKw.length > 0 ? matchedKw.join(', ') : 'None detected'}

🔍 NOT DETECTED IN RESUME:
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
  • PRIORITY   : [${((s.priority as string) || 'MED').toUpperCase()}]
  • REFERENCE  : "${s.reference || s.text || 'N/A'}"
  • ISSUE      : ${s.issue || s.text || 'N/A'}
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

  const generateClaudePrompt = (): string => {
    if (!activeResume) return '';
    const scoring = activeResume.scoringResult;
    const extraction = activeResume.extractionResult;

    const contact = extraction?.contact_info || activeResume.parsedDetails;
    const skills = extraction?.skills || { technical: activeResume.parsedDetails?.skills || [], soft: [] };
    const experience = Array.isArray(extraction?.experience) ? extraction.experience : activeResume.parsedDetails?.experience || [];
    const projects = Array.isArray(extraction?.projects) ? extraction.projects : activeResume.parsedDetails?.projects || [];
    const education = Array.isArray(extraction?.education) ? extraction.education : activeResume.parsedDetails?.education || [];
    const suggestions = Array.isArray(scoring?.improvement_suggestions) ? scoring.improvement_suggestions : [];
    const matchedKw = Array.isArray(scoring?.matched_keywords) ? scoring.matched_keywords : [];
    const missingKw = Array.isArray(scoring?.missing_keywords) ? scoring.missing_keywords : [];

    return `You are an elite executive resume writer and ATS optimization expert.
Your goal is to completely rewrite, polish, and generate a new, high-scoring ATS-compatible resume tailored for the target position of "${scoring?.targetRole || targetRole}".

============================================================
1. TARGET ROLE & JOB REQUIREMENTS
============================================================
TARGET ROLE: ${scoring?.targetRole || targetRole}
${scoring?.jobDescription ? `JOB DESCRIPTION:\n${scoring.jobDescription}\n` : ''}

============================================================
2. CRITICAL IMPROVEMENTS TO INTEGRATE
============================================================
${
  suggestions.length > 0
    ? suggestions
        .map(
          (s, i) => `[FIX #${i + 1} - SECTION: ${s.section || 'General'} | PRIORITY: ${((s.priority as string) || 'MED').toUpperCase()}]
  • Problem: ${s.issue || s.text || 'Improvement required'}
  • Action: ${s.suggestion || 'Refine section with action verbs and metrics'}
  ${s.reference || s.text ? `• Reference Text: "${s.reference || s.text}"` : ''}`
        )
        .join('\n\n')
    : '• Upgrade all bullet points to use strong action verbs and quantified impact metrics (% increase, $ saved, latency reduced).'
}

KEYWORD GAP INTEGRATION:
• Not detected in current resume (Integrate if candidate has experience): ${missingKw.length > 0 ? missingKw.join(', ') : 'None missing'}
• Currently Matched Keywords to Retain: ${matchedKw.length > 0 ? matchedKw.join(', ') : 'None'}

============================================================
3. CANDIDATE RESUME DATA (RETAIN ONLY FACTUAL DETAILS)
============================================================
NAME     : ${contact?.name || 'Candidate Name'}
EMAIL    : ${contact?.email || 'email@example.com'}
PHONE    : ${contact?.phone || 'N/A'}
LOCATION : ${(contact as any)?.location || 'N/A'}

SKILLS:
• Technical Skills      : ${Array.isArray(skills.technical) ? skills.technical.join(', ') : 'N/A'}
• Programming Languages : ${Array.isArray(skills.programming_languages) ? skills.programming_languages.join(', ') : 'N/A'}
• Frameworks            : ${Array.isArray(skills.frameworks) ? skills.frameworks.join(', ') : 'N/A'}
• Databases & Tools     : ${[...(Array.isArray(skills.databases) ? skills.databases : []), ...(Array.isArray(skills.cloud_and_tools) ? skills.cloud_and_tools : [])].join(', ') || 'N/A'}
• Soft Skills           : ${Array.isArray(skills.soft) ? skills.soft.join(', ') : 'N/A'}

WORK EXPERIENCE:
${
  experience.length > 0
    ? experience
        .map(
          (e: any) => `COMPANY: ${e.company || e.organization || 'Company'} | ROLE: ${e.role || e.title || 'Role'} | DURATION: ${e.duration || e.dates || 'N/A'}
RESPONSIBILITIES & ACHIEVEMENTS:
${Array.isArray(e.responsibilities) ? e.responsibilities.map((r: string) => `  - ${r}`).join('\n') : `  - ${e.description || e.responsibilities || 'Responsibilities listed'}`}`
        )
        .join('\n\n')
    : 'No prior formal work experience listed.'
}

PROJECTS:
${
  projects.length > 0
    ? projects
        .map(
          (p: any) => `PROJECT: ${p.name || p.title || 'Project'} | DURATION: ${p.duration || p.dates || 'N/A'}
TECH: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || 'N/A'}
BULLETS:
${Array.isArray(p.description) ? p.description.map((d: string) => `  - ${d}`).join('\n') : `  - ${p.description || 'Description'}`}`
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
            `INSTITUTION: ${ed.institution || ed.school || ed.university} | DEGREE: ${ed.degree || ed.field} | DURATION/YEAR: ${ed.duration || ed.dates || ed.year} | SCORE: ${ed.score || ed.cgpa || 'N/A'}`
        )
        .join('\n')
    : 'Education details listed.'
}

============================================================
4. INSTRUCTIONS
============================================================
1. Output the complete resume in clean Markdown format with standard headings (SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION).
2. Format experience and project bullets using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
3. Seamlessly incorporate missing keywords where relevant without fabricating fake credentials.
4. Ensure zero placeholder text.`;
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
    toast.success('Prompt copied to clipboard! Paste into Claude / ChatGPT.');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Resume Analyzer...</p>
        </div>
      </div>
    );
  }

  const scoring = activeResume?.scoringResult;
  const metadata = activeResume?.extractionMetadata;
  const extraction = activeResume?.extractionResult;

  const overallScore = activeResume?.overallScore ?? scoring?.overall_score ?? activeResume?.atsScore ?? 0;
  const contentQuality = activeResume?.contentQualityScore ?? scoring?.content_quality_score ?? activeResume?.readinessScore ?? 0;
  const atsCompatibility = activeResume?.atsScore ?? scoring?.ats_compatibility_score ?? 0;
  const jobMatchScore = activeResume?.jobMatchScore !== undefined ? activeResume?.jobMatchScore : scoring?.job_match_score;

  return (
    <MosaicShell>
      <TopHeader
        title="Resume Analyzer"
        subtitle="Analyze your resume for ATS compatibility, content quality, job match, and actionable improvements."
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
                <span className="text-[10px] text-teal-700 font-semibold">Optional for JD Match</span>
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description requirements here (e.g. Core Java, Kafka, Kubernetes, Docker)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
              />
            </div>

            {activeResume && (
              <button
                type="button"
                onClick={handleReMatchJob}
                disabled={isMatchingJd || !jobDescription.trim()}
                className="mosaic-btn-secondary w-full !py-2 !text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isMatchingJd ? 'animate-spin' : ''}`} />
                <span>{isMatchingJd ? 'Matching against JD...' : 'Re-Analyze Active Resume Against JD'}</span>
              </button>
            )}
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
                    placeholder="Paste full resume text or markdown here..."
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
                  <span>{isUploading ? 'Analyzing Resume...' : 'Analyze Resume'}</span>
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
                    Supports <strong>PDF, DOCX, TXT, MD</strong> (Max 10MB)
                  </p>
                </div>

                <label className="mosaic-btn-brand !py-3 !px-6 !text-xs cursor-pointer inline-flex items-center space-x-2 w-full justify-center">
                  <UploadCloud className="h-4 w-4" />
                  <span>{isUploading ? 'Analyzing File...' : 'Select File & Analyze Resume'}</span>
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

          {/* Unified Resume Analysis Loading Indicator */}
          {isUploading && (
            <div className="mosaic-card p-5 space-y-3 bg-teal-50/50 border border-teal-200 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
              <div>
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  Analyzing Your Resume...
                </h4>
                <p className="text-[11px] text-teal-800 mt-1 leading-relaxed">
                  Extracting structured resume details, executing layout compatibility checks, and evaluating content quality.
                </p>
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
                resumes.map((r) => {
                  const itemScore = r.overallScore ?? r.scoringResult?.overall_score ?? r.atsScore ?? 0;
                  return (
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

                      <Badge tone={itemScore >= 80 ? 'success' : itemScore >= 60 ? 'warning' : 'danger'}>
                        {itemScore} Score
                      </Badge>
                    </div>
                  );
                })
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
                Provide the target role, optional job description, and your resume content on the left, then click <strong>Analyze Resume</strong> to view complete analysis.
              </p>
            </div>
          ) : (
            <>
              {/* Report Header Card */}
              <div className="mosaic-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block font-heading">
                        Resume v{activeResume.version || 1} • {scoring?.targetRole || targetRole}
                      </span>
                      <Badge
                        tone={
                          activeResume.analysisConfidence === 'HIGH'
                            ? 'success'
                            : activeResume.analysisConfidence === 'MEDIUM'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        Confidence: {activeResume.analysisConfidence || 'HIGH'}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--ink-900)] font-heading mt-1">
                      {activeResume.fileName || 'Resume'}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher */}
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
                        <span>Rewrite Prompt</span>
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
                        <span>AI Resume Rewrite Prompt</span>
                      </div>
                      <button
                        onClick={handleCopyClaudePrompt}
                        className="mosaic-btn-brand !bg-purple-700 hover:!bg-purple-800 !py-1.5 !px-3.5 !text-xs flex items-center space-x-1.5 border-none cursor-pointer"
                      >
                        {copiedPrompt ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Rewrite Prompt'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Copy the prompt below and paste it into an LLM assistant. It encapsulates your extracted resume facts, target role, and recommended fixes to draft a rewritten resume.
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
                        <span>Formatted Evaluation Report</span>
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
                    {/* Primary Score Gauges Row */}
                    <div
                      className={`grid gap-4 ${
                        jobMatchScore !== null && jobMatchScore !== undefined
                          ? 'sm:grid-cols-4'
                          : 'sm:grid-cols-3'
                      }`}
                    >
                      <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider">
                          Overall Resume Score
                        </span>
                        <div className="text-3xl font-extrabold text-teal-950 mt-2">{overallScore} / 100</div>
                        <span className="text-[10px] text-teal-700 font-semibold mt-1">
                          {jobMatchScore !== null && jobMatchScore !== undefined
                            ? 'Weighted multi-dimensional score'
                            : 'Role baseline evaluation'}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                          Content Quality (20%)
                        </span>
                        <div className="text-3xl font-extrabold text-blue-950 mt-2">{contentQuality} / 100</div>
                        <span className="text-[10px] text-blue-700 font-semibold mt-1">Action verbs & metrics</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                          ATS Compatibility (20%)
                        </span>
                        <div className="text-3xl font-extrabold text-purple-950 mt-2">{atsCompatibility} / 100</div>
                        <span className="text-[10px] text-purple-700 font-semibold mt-1">
                          Format & parseability estimate
                        </span>
                      </div>

                      {jobMatchScore !== null && jobMatchScore !== undefined ? (
                        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                            Job Description Match (25%)
                          </span>
                          <div className="text-3xl font-extrabold text-indigo-950 mt-2">{jobMatchScore} / 100</div>
                          <span className="text-[10px] text-indigo-700 font-semibold mt-1">
                            JD keyword alignment
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Secondary Multi-Dimensional Components Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">Experience (15%)</span>
                          <span className="text-xs font-bold text-slate-900">
                            {activeResume.experienceEvidenceScore ?? scoring?.experience_evidence_score ?? 0} / 100
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {scoring?.component_explanations?.experience_evidence || 'Quantified bullet points and roles.'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">Projects (10%)</span>
                          <span className="text-xs font-bold text-slate-900">
                            {activeResume.projectsQualityScore ?? scoring?.projects_quality_score ?? 0} / 100
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {scoring?.component_explanations?.projects_quality || 'Stack depth and architectural complexity.'}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 uppercase">Completeness (10%)</span>
                          <span className="text-xs font-bold text-slate-900">
                            {activeResume.completenessScore ?? scoring?.completeness_score ?? 0} / 100
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {scoring?.component_explanations?.completeness || 'Core sections coverage and profile health.'}
                        </p>
                      </div>
                    </div>

                    {/* Low Confidence Warning Alert */}
                    {(activeResume.analysisConfidence === 'LOW' ||
                      (metadata && (metadata.extractionConfidence || 1) < 0.4)) && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-900">Low Analysis Confidence</h4>
                          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                            Analysis confidence is low. Some resume information could not be reliably extracted.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Evaluation Summary Box */}
                    {scoring?.summary && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-teal-800 uppercase block font-heading">
                          Evaluation Summary
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{scoring.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Priority Improvement Suggestions */}
              {Array.isArray(scoring?.improvement_suggestions) && scoring.improvement_suggestions.length > 0 && (
                <div className="mosaic-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-teal-600" />
                    <span>Actionable Recommendations ({scoring.improvement_suggestions.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {scoring.improvement_suggestions.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 uppercase font-heading">
                            {s.section || 'General'} Section
                          </span>
                          <Badge
                            tone={
                              s.priority === 'high'
                                ? 'danger'
                                : s.priority === 'medium'
                                ? 'warning'
                                : 'info'
                            }
                          >
                            {typeof s.priority === 'string' ? s.priority.toUpperCase() : 'MED'} PRIORITY
                          </Badge>
                        </div>

                        {(s.reference || s.text) && (
                          <p className="text-[11px] italic text-slate-500 bg-white p-2 rounded border border-slate-200">
                            Reference: "{s.reference || s.text}"
                          </p>
                        )}

                        <div className="text-xs space-y-1">
                          <p className="text-rose-800 font-semibold">Issue: {s.issue || s.text || 'Recommendation'}</p>
                          <p className="text-emerald-800 font-bold">
                            Actionable Suggestion: {s.suggestion || 'Refine section with action verbs and metrics'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unfinished Placeholder Warnings */}
              {Array.isArray(activeResume.analysis?.placeholderWarnings) &&
                activeResume.analysis.placeholderWarnings.length > 0 && (
                  <div className="mosaic-card p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      <span>
                        Unfinished Placeholders Detected ({activeResume.analysis.placeholderWarnings.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {activeResume.analysis.placeholderWarnings.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start justify-between gap-3"
                        >
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-rose-950 font-mono">Placeholder: "{w.text}"</p>
                            <p className="text-rose-700">{w.message}</p>
                          </div>
                          <Badge tone={w.severity === 'HIGH' ? 'danger' : 'warning'}>{w.severity || 'HIGH'}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* ATS/Layout Warnings */}
              {(metadata?.tablesDetected ||
                metadata?.multiColumnSuspected ||
                (Array.isArray(activeResume.extractionResult?.parsing_warnings) &&
                  activeResume.extractionResult.parsing_warnings.length > 0)) && (
                <div className="mosaic-card p-6 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>ATS Formatting & Layout Signals</span>
                  </h3>
                  <div className="space-y-3">
                    {metadata?.tablesDetected && (
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                        <p className="font-bold text-amber-900">⚠️ Table Formatting Detected</p>
                        <p className="text-amber-700 mt-0.5">
                          Complex tables may not be parsed properly by legacy ATS engines. Consider standard single-column linear text.
                        </p>
                      </div>
                    )}
                    {metadata?.multiColumnSuspected && (
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs">
                        <p className="font-bold text-amber-900">⚠️ Multi-Column Layout Detected</p>
                        <p className="text-amber-700 mt-0.5">
                          Side-by-side text columns can disrupt reading order in simple parsers. Linear layouts are recommended.
                        </p>
                      </div>
                    )}
                    {Array.isArray(activeResume.extractionResult?.parsing_warnings) &&
                      activeResume.extractionResult.parsing_warnings.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-slate-800">Parsing Warnings:</p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600">
                            {activeResume.extractionResult.parsing_warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                      {(Array.isArray(scoring.strengths) ? scoring.strengths : []).map((str, idx) => (
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
                      {(Array.isArray(scoring.weaknesses) ? scoring.weaknesses : []).map((weak, idx) => (
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
                      {(Array.isArray(scoring?.matched_keywords) ? scoring.matched_keywords : []).length} Matched
                    </Badge>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      (Array.isArray(scoring?.matched_keywords) && scoring.matched_keywords) ||
                      (Array.isArray(extraction?.skills?.technical) && extraction.skills.technical) ||
                      (Array.isArray(activeResume?.parsedDetails?.skills) && activeResume.parsedDetails.skills) ||
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
                    <span>Not Detected in Resume</span>
                    <Badge tone="warning">
                      {(Array.isArray(scoring?.missing_keywords) ? scoring.missing_keywords : []).length} Missing
                    </Badge>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      (Array.isArray(scoring?.missing_keywords) && scoring.missing_keywords) ||
                      (Array.isArray(activeResume?.analysis?.missingSkills) && activeResume.analysis.missingSkills) ||
                      []
                    ).map((k, i) => (
                      <Badge key={i} tone="warning">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Structured Extracted Data Preview (Skills, Experience, Projects, Education) */}
              <div className="mosaic-card p-6 space-y-6">
                <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-600" />
                  <span>Structured Extracted Resume Content</span>
                </h3>

                {/* Skills Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-teal-600" />
                    <span>Skills Detected</span>
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    {Array.isArray(extraction?.skills?.programming_languages) && extraction.skills.programming_languages.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Languages:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.programming_languages.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(extraction?.skills?.frameworks) && extraction.skills.frameworks.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Frameworks:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.frameworks.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(extraction?.skills?.databases) && extraction.skills.databases.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Databases:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.databases.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(extraction?.skills?.cloud_and_tools) && extraction.skills.cloud_and_tools.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Cloud & Tools:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.cloud_and_tools.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(extraction?.skills?.technical) && extraction.skills.technical.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Technical Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.technical.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(extraction?.skills?.soft) && extraction.skills.soft.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Soft Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {extraction.skills.soft.map((s, i) => (
                            <span key={i} className="bg-white border px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                {Array.isArray(extraction?.experience) && extraction.experience.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-teal-600" />
                      <span>Work Experience ({extraction.experience.length})</span>
                    </h4>
                    <div className="space-y-2.5">
                      {extraction.experience.map((exp, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{exp.role || exp.title || 'Role'}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{exp.duration || exp.dates || 'N/A'}</span>
                          </div>
                          <p className="text-teal-800 font-semibold">{exp.company || exp.organization || 'Company'}</p>
                          {Array.isArray(exp.responsibilities) ? (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 pt-1">
                              {exp.responsibilities.map((r, rIdx) => (
                                <li key={rIdx}>{typeof r === 'string' ? r : JSON.stringify(r)}</li>
                              ))}
                            </ul>
                          ) : typeof exp.responsibilities === 'string' && exp.responsibilities.trim() ? (
                            <p className="text-slate-600 pt-1 text-xs">{exp.responsibilities}</p>
                          ) : typeof exp.description === 'string' && exp.description.trim() ? (
                            <p className="text-slate-600 pt-1 text-xs">{exp.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {Array.isArray(extraction?.projects) && extraction.projects.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="h-3.5 w-3.5 text-teal-600" />
                      <span>Projects ({extraction.projects.length})</span>
                    </h4>
                    <div className="space-y-2.5">
                      {extraction.projects.map((proj, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{proj.name || proj.title || 'Project'}</span>
                            {(proj.duration || proj.dates) && (
                              <span className="text-[11px] text-slate-500">{proj.duration || proj.dates}</span>
                            )}
                          </div>
                          {Array.isArray(proj.technologies) && proj.technologies.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {proj.technologies.map((t, tIdx) => (
                                <span key={tIdx} className="bg-white border px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                                  {typeof t === 'string' ? t : JSON.stringify(t)}
                                </span>
                              ))}
                            </div>
                          ) : typeof proj.technologies === 'string' && proj.technologies ? (
                            <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                              {proj.technologies}
                            </span>
                          ) : null}
                          {Array.isArray(proj.description) ? (
                            <ul className="list-disc pl-4 space-y-0.5 text-slate-600 pt-1">
                              {proj.description.map((d, dIdx) => (
                                <li key={dIdx}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>
                              ))}
                            </ul>
                          ) : typeof proj.description === 'string' && proj.description.trim() ? (
                            <p className="text-slate-600 pt-1 text-xs">{proj.description}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {Array.isArray(extraction?.education) && extraction.education.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                      <span>Education ({extraction.education.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {extraction.education.map((edu, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{edu.institution || edu.school || edu.university || 'University'}</span>
                            <p className="text-slate-600">{[edu.degree, edu.field, edu.major].filter(Boolean).join(' - ') || 'Degree listed'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-500">{edu.duration || edu.dates || edu.year || ''}</span>
                            {(edu.score || edu.cgpa) && <p className="text-teal-800 font-semibold">{edu.score || edu.cgpa}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {Array.isArray(extraction?.certifications) && extraction.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-teal-600" />
                      <span>Certifications ({extraction.certifications.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {extraction.certifications.map((cert, idx) => {
                        const certName = typeof cert === 'string' ? cert : cert.name || 'Certification';
                        const certDetails = typeof cert === 'object' ? [cert.issuer, cert.date].filter(Boolean).join(' • ') : '';
                        return (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                            <span className="font-bold text-slate-900">{certName}</span>
                            {certDetails && <span className="text-slate-500">{certDetails}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
