import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  Sparkles,
  Briefcase,
  History,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
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
  contact_info: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  skills: {
    technical: string[];
    tools_and_technologies: string[];
    soft: string[];
  };
  projects: Array<{
    name: string;
    description: string[];
    technologies: string[];
    duration?: string;
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    field?: string;
    duration?: string;
    score?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration?: string;
    responsibilities: string[];
  }>;
  certifications?: Array<{ name: string; issuer?: string; date?: string }>;
  achievements?: Array<{ title: string; description?: string }>;
  parsing_warnings: string[];
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

export interface MatchReport {
  matchScore: number;
  overallScore?: number;
  contentQualityScore?: number;
  atsCompatibilityScore?: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  strengths?: string[];
  weaknesses?: string[];
  improvementSuggestions?: ImprovementSuggestion[];
  customizationSuggestions?: string[];
  summary?: string;
}

export function ResumeAnalyzer() {
  const [resumes, setResumes] = useState<ResumeReport[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Target role & Job matching states
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      toast.error('Please upload a PDF or DOCX file.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', targetRole);

    setIsUploading(true);
    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newResume = res.data.resume;
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
      toast.success('Resume analyzed successfully via 2-stage pipeline!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResume || !jobDescription.trim()) {
      toast.error('Please enter a job description to match.');
      return;
    }

    setIsMatching(true);
    try {
      const res = await api.post(`/resume/${activeResume._id}/match`, {
        jobTitle: jobTitle || targetRole,
        jdText: jobDescription,
      });
      setMatchReport(res.data.matchReport);
      if (res.data.resume) {
        setActiveResume(res.data.resume);
      }
      toast.success('Job description match report generated!');
    } catch (err) {
      console.error('Matching error:', err);
      toast.error('Failed to analyze job match.');
    } finally {
      setIsMatching(false);
    }
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
        title="ATS Resume Analyzer — Redesigned Pipeline"
        subtitle="2-Stage Extraction & Deterministic Scoring powered by NVIDIA Nemotron Super 49B"
      />

      {/* Main Split Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 Cols): Upload Box & History List */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Target Role Selector */}
          <div className="mosaic-card p-4 space-y-2 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Fullstack Engineer, Data Scientist"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Upload Card */}
          <div className="mosaic-card p-6 space-y-4 text-left border-dashed border-2 border-slate-300 hover:border-teal-500 transition">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                  Upload Resume (PDF / DOCX)
                </h3>
                <p className="text-xs text-[var(--ink-muted)] mt-1">
                  2-Stage Nemotron LLM Extraction & Scoring Pipeline
                </p>
              </div>

              <label className="mosaic-btn-brand !py-2.5 !px-5 !text-xs cursor-pointer inline-flex items-center space-x-2">
                <UploadCloud className="h-4 w-4" />
                <span>{isUploading ? 'Extracting & Scoring...' : 'Select Resume File'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* History List Card */}
          <div className="mosaic-card p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading">
                  Analysis History ({resumes.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {resumes.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)] italic text-center py-4">
                  No uploaded resumes found. Upload one to start!
                </p>
              ) : (
                resumes.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => setActiveResume(r)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      activeResume?._id === r._id
                        ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                        : 'border-[var(--card-border)] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileText className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[var(--ink-900)] truncate">{r.fileName}</h4>
                        <span className="text-[10px] text-[var(--ink-muted)]">
                          v{r.version} • {new Date(r.createdAt).toLocaleDateString()}
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

        {/* Right Column (8 Cols): Report Breakdown */}
        <div className="lg:col-span-8 space-y-6 text-left">
          {!activeResume ? (
            <div className="mosaic-card p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[var(--ink-900)]">No Active Resume Report Selected</h3>
              <p className="text-xs text-[var(--ink-muted)]">Upload a resume on the left to view the ATS breakdown.</p>
            </div>
          ) : (
            <>
              {/* Report Header Card */}
              <div className="mosaic-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block font-heading">
                      Active Resume v{activeResume.version} • {scoring?.targetRole || 'Software Engineer'}
                    </span>
                    <h2 className="text-xl font-bold text-[var(--ink-900)] font-heading">{activeResume.fileName}</h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      className="mosaic-btn-outline !py-2 !px-4 !text-xs flex items-center space-x-1.5"
                    >
                      <Briefcase className="h-4 w-4 text-teal-600" />
                      <span>{isDrawerOpen ? 'Close JD Matcher' : 'Match Job Description'}</span>
                    </button>

                    {activeResume.fileUrl && (
                      <a
                        href={activeResume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mosaic-btn-primary !py-2 !px-4 !text-xs flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>

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

                {/* Text Extraction Metadata Header */}
                {metadata && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-4 w-4 text-teal-600" />
                      <span className="font-bold text-slate-800">Library Extraction Metadata:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-white border px-2 py-0.5 rounded font-semibold text-slate-700">
                        Confidence: {(metadata.extractionConfidence * 100).toFixed(0)}%
                      </span>
                      <span className="bg-white border px-2 py-0.5 rounded font-semibold text-slate-700">
                        Garbled Ratio: {(metadata.garbledTextRatio * 100).toFixed(1)}%
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

                {/* Summary Box */}
                {scoring?.summary && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-teal-800 uppercase block font-heading">
                      Evaluation Summary
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{scoring.summary}</p>
                  </div>
                )}
              </div>

              {/* JD Matcher Panel (Expandable) */}
              {isDrawerOpen && (
                <div className="mosaic-card p-6 space-y-4 border-2 border-teal-500 bg-teal-50/30">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-teal-700" />
                    <h3 className="text-base font-bold text-teal-950 font-heading">
                      Stage 2 — Job Description Matcher
                    </h3>
                  </div>

                  <form onSubmit={handleRunMatch} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Frontend Engineer @ Google"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                        Job Description Text *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Paste the full job description requirements here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[var(--ink-900)] focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <button type="submit" disabled={isMatching} className="mosaic-btn-brand !py-2 !px-5 !text-xs">
                      <Sparkles className="h-4 w-4" />
                      <span>{isMatching ? 'Calculating Stage 2 Match...' : 'Calculate Job Match Score'}</span>
                    </button>
                  </form>

                  {matchReport && (
                    <div className="pt-4 border-t border-teal-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-950">Job Match Score</span>
                        <Badge tone={matchReport.matchScore >= 75 ? 'success' : 'warning'}>
                          {matchReport.matchScore}% Match
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-emerald-700 block">Matching Keywords</span>
                          <p className="text-slate-600">{matchReport.matchingKeywords?.join(', ') || 'None'}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-rose-700 block">Missing Keywords</span>
                          <p className="text-slate-600">{matchReport.missingKeywords?.join(', ') || 'None'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                            {s.section} Section
                          </span>
                          <Badge tone={s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'info'}>
                            {s.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>

                        {s.reference && (
                          <p className="text-[11px] italic text-slate-500 bg-white p-2 rounded border border-slate-200">
                            Reference: "{s.reference}"
                          </p>
                        )}

                        <div className="text-xs space-y-1">
                          <p className="text-rose-800 font-semibold">Issue: {s.issue}</p>
                          <p className="text-emerald-800 font-bold">Actionable Suggestion: {s.suggestion}</p>
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
                      {scoring.strengths?.map((str, idx) => (
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
                      {scoring.weaknesses?.map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Verbatim Skills & Keywords Breakdown */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="mosaic-card p-6 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2">
                    Extracted Skill Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(extraction?.skills?.technical || activeResume.parsedDetails.skills || []).map((s, i) => (
                      <Badge key={i} tone="info">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mosaic-card p-6 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--ink-900)] font-heading border-b border-[var(--card-border)] pb-2">
                    Missing Keywords vs ATS Target
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(scoring?.missing_keywords || activeResume.analysis.missingSkills || []).map((k, i) => (
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

export default ResumeAnalyzer;
