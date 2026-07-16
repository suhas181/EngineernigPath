import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { calculateAiAccuracy } from '../utils/profileCompletion';
import {
  GraduationCap,
  Sparkles,
  Code,
  FolderGit2,
  Link2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader2,
  UploadCloud,
  Trash2,
  ArrowLeft,
  Save,
  Trophy,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'Docker',
  'Git',
  'TailwindCSS',
  'AWS',
];

const POPULAR_INTERESTS = [
  'Open Source',
  'Competitive Coding',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Cloud Computing',
  'System Design',
  'UI/UX Design',
];

const POPULAR_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'Swift'];
const POPULAR_FRAMEWORKS = ['React', 'Next.js', 'Express.js', 'Django', 'Spring Boot', 'Flutter', 'Vue.js', 'Angular'];

const completeProfileSchema = z.object({
  college: z.string().min(2, 'College name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch name must be at least 2 characters'),
  cgpa: z.coerce.number().min(0, 'CGPA must be positive').max(10, 'CGPA cannot exceed 10'),
  graduationYear: z.coerce.number().int().min(2020).max(2035, 'Invalid graduation year'),
  currentSemester: z.coerce.number().int().min(1).max(8),
  preferredCareer: z.string().min(2, 'Please select a preferred career path'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')),
  
  // Advanced fields (optional)
  dreamCompany: z.string().optional(),
  dailyStudyHours: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().min(1).max(12).optional()),
  careerGoal: z.string().optional(),
  placementTimeline: z.string().optional(),
  dsaLevel: z.string().optional(),
  leetcodeEasyCount: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().min(0).optional()),
  leetcodeMediumCount: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().min(0).optional()),
  leetcodeHardCount: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().min(0).optional()),
  preferredProgrammingLanguage: z.enum(['Java', 'Python', 'C++']).optional(),
  preferredDsaLanguage: z.enum(['Java', 'Python', 'C++']).optional(),
  targetCompanyType: z.enum(['Product-Based', 'Service-Based']).optional(),
});

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

export function CompleteProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regenerateRoadmap, setRegenerateRoadmap] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('Analyzing target career path & timeline...');

  // State arrays for chips / tags
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [interestInput, setInterestInput] = useState('');

  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(user?.programmingLanguages || []);
  const [progLangInput, setProgLangInput] = useState('');

  const [frameworks, setFrameworks] = useState<string[]>(user?.frameworks || []);
  const [frameworkInput, setFrameworkInput] = useState('');

  const [projects, setProjects] = useState<any[]>(user?.projects || []);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion Sections State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    academic: true,
    career: false,
    coding: false,
    projects: false,
    resume: false,
    preferences: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      college: user?.college || '',
      branch: user?.branch || '',
      cgpa: user?.cgpa || 0,
      graduationYear: user?.graduationYear || new Date().getFullYear() + 2,
      currentSemester: user?.currentSemester || 3,
      preferredCareer: user?.preferredCareer || 'Software Engineer (SDE)',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      dreamCompany: user?.dreamCompany || '',
      dailyStudyHours: user?.dailyStudyHours || undefined,
      careerGoal: user?.careerGoal || 'Placement',
      placementTimeline: user?.placementTimeline || '6 Months',
      dsaLevel: user?.dsaLevel || 'Beginner',
      leetcodeEasyCount: user?.leetcodeEasyCount || undefined,
      leetcodeMediumCount: user?.leetcodeMediumCount || undefined,
      leetcodeHardCount: user?.leetcodeHardCount || undefined,
      preferredProgrammingLanguage: user?.preferredProgrammingLanguage || 'Java',
      preferredDsaLanguage: user?.preferredDsaLanguage || 'Java',
      targetCompanyType: user?.targetCompanyType || 'Product-Based',
    },
  });

  // Watch values for real-time accuracy scoring
  const watchedValues = watch();
  const currentProfile = {
    ...watchedValues,
    skills,
    interests,
    programmingLanguages,
    frameworks,
  };
  const accuracyScore = calculateAiAccuracy(currentProfile);

  // Handle dynamic AI analysis loading text
  useEffect(() => {
    if (!isAnalyzing) return;
    const steps = [
      'Analyzing target career role & timeline...',
      'Identifying skill gaps in your core technologies...',
      'Selecting high-quality study resources...',
      'Structuring customized topics for your roadmap...',
      'Assembling your personalized roadmap...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setAnalysisText(steps[idx]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Tag helper logic
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const handleAddInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = interestInput.trim();
    if (clean && !interests.includes(clean)) {
      setInterests([...interests, clean]);
      setInterestInput('');
    }
  };

  const handleAddProgLang = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = progLangInput.trim();
    if (clean && !programmingLanguages.includes(clean)) {
      setProgrammingLanguages([...programmingLanguages, clean]);
      setProgLangInput('');
    }
  };

  const handleAddFramework = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = frameworkInput.trim();
    if (clean && !frameworks.includes(clean)) {
      setFrameworks([...frameworks, clean]);
      setFrameworkInput('');
    }
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Project List handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        technologies: [],
        githubLink: '',
        liveLink: '',
        difficulty: 'Beginner',
        isCompleted: false,
      },
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleUpdateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const onSubmit = async (data: CompleteProfileFormValues) => {
    setIsSubmitting(true);
    try {
      let profileImageUrl = user?.profileImage || '';

      // Upload image if selected
      if (imageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          const uploadRes = await api.post('/users/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          profileImageUrl = uploadRes.data.profileImage;
        } catch (err) {
          console.error(err);
          toast.error('Failed to upload profile image.');
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Format payload
      const payload: any = {
        college: data.college,
        branch: data.branch,
        cgpa: Number(data.cgpa),
        graduationYear: Number(data.graduationYear),
        currentSemester: Number(data.currentSemester),
        preferredCareer: data.preferredCareer,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        skills,
        interests,
        profileImage: profileImageUrl,
        projects: projects.filter((p) => p.title.trim() !== ''),
      };

      // Advanced/Optional fields
      if (data.dreamCompany) payload.dreamCompany = data.dreamCompany;
      if (data.dailyStudyHours !== undefined && data.dailyStudyHours !== null) payload.dailyStudyHours = Number(data.dailyStudyHours);
      if (data.careerGoal) payload.careerGoal = data.careerGoal;
      if (data.placementTimeline) payload.placementTimeline = data.placementTimeline;
      if (data.dsaLevel) payload.dsaLevel = data.dsaLevel;
      
      if (data.leetcodeEasyCount !== undefined && data.leetcodeEasyCount !== null) payload.leetcodeEasyCount = Number(data.leetcodeEasyCount);
      if (data.leetcodeMediumCount !== undefined && data.leetcodeMediumCount !== null) payload.leetcodeMediumCount = Number(data.leetcodeMediumCount);
      if (data.leetcodeHardCount !== undefined && data.leetcodeHardCount !== null) payload.leetcodeHardCount = Number(data.leetcodeHardCount);

      if (data.preferredProgrammingLanguage) payload.preferredProgrammingLanguage = data.preferredProgrammingLanguage;
      if (data.preferredDsaLanguage) payload.preferredDsaLanguage = data.preferredDsaLanguage;
      if (data.targetCompanyType) payload.targetCompanyType = data.targetCompanyType;

      payload.programmingLanguages = programmingLanguages;
      payload.frameworks = frameworks;

      // Save profile
      const profileRes = await api.patch('/users/profile', payload);
      updateUser(profileRes.data.user);

      toast.success('Profile updated successfully!');

      if (regenerateRoadmap) {
        setIsAnalyzing(true);
        // Call regenerate endpoint
        await api.post('/roadmaps/generate', { regenerate: true });
        toast.success('Your AI career roadmap is ready!');
        navigate('/roadmaps');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white">
        <div className="glass-panel max-w-xl w-full rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl border border-indigo-500/20">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold font-heading">Consulting the AI Career Mentor</h2>
            <p className="text-blue-400 font-semibold text-lg animate-pulse">{analysisText}</p>
            <p className="text-muted-foreground text-sm max-w-sm">
              We are rebuilding your step-by-step career path with the updated parameters. This will take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderSectionHeader = (key: string, title: string, icon: React.ReactNode) => {
    const isExpanded = expandedSections[key];
    return (
      <button
        type="button"
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/[0.08] transition duration-200"
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {icon}
          </div>
          <span className="font-bold text-lg font-heading">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen text-white font-sans flex flex-col bg-slate-950">
      
      {/* Header controls */}
      <header className="max-w-5xl mx-auto w-full px-6 pt-8 flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-white transition font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <Trophy className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">AI Accuracy: {accuracyScore}%</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="space-y-6">
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Improve AI Accuracy
            </h1>
            <p className="text-sm text-muted-foreground">
              Provide additional information about your academic profile, coding experience, and career preferences to increase roadmap personalization accuracy.
            </p>
          </div>

          {/* Accuracy Score Progress Bar */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 bg-white/[0.01]">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <span>Overall AI Accuracy Score</span>
              <span className="font-bold text-indigo-400 text-sm">{accuracyScore}%</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${accuracyScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {accuracyScore === 100
                ? '🎉 Perfect! Your profile is complete. Your roadmap is fully optimized.'
                : '💡 Tip: Complete optional coding stats, target companies, and projects to hit 100% accuracy.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* 1. Academic Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('academic', 'Academic Details', <GraduationCap className="h-5 w-5" />)}
              {expandedSections.academic && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 animate-slideDown">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">College Name</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 transition"
                        {...register('college')}
                      />
                      {errors.college && <span className="text-xs text-destructive">{errors.college.message}</span>}
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Branch / Major</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 transition"
                        {...register('branch')}
                      />
                      {errors.branch && <span className="text-xs text-destructive">{errors.branch.message}</span>}
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">CGPA (Out of 10)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 transition"
                        {...register('cgpa')}
                      />
                      {errors.cgpa && <span className="text-xs text-destructive">{errors.cgpa.message}</span>}
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Graduation Year</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 transition"
                        {...register('graduationYear')}
                      />
                      {errors.graduationYear && <span className="text-xs text-destructive">{errors.graduationYear.message}</span>}
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Current Semester</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/50 transition appearance-none"
                        {...register('currentSemester')}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem} className="bg-slate-900">Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Career Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('career', 'Career Details', <Sparkles className="h-5 w-5" />)}
              {expandedSections.career && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 animate-slideDown">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Preferred Career Goal</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:outline-none focus:border-primary/50 transition appearance-none"
                      {...register('preferredCareer')}
                    >
                      <option value="Software Engineer (SDE)" className="bg-slate-900">Software Engineer (SDE)</option>
                      <option value="Frontend Engineer" className="bg-slate-900">Frontend Engineer</option>
                      <option value="Backend Engineer" className="bg-slate-900">Backend Engineer</option>
                      <option value="Full Stack Developer" className="bg-slate-900">Full Stack Developer</option>
                      <option value="AI / ML Engineer" className="bg-slate-900">AI / ML Engineer</option>
                      <option value="Data Scientist / Analyst" className="bg-slate-900">Data Scientist / Analyst</option>
                      <option value="DevOps Engineer" className="bg-slate-900">DevOps Engineer</option>
                      <option value="Mobile App Developer" className="bg-slate-900">Mobile App Developer</option>
                    </select>
                  </div>

                  {/* Skills Tags input with chips */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Core Skills</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="React, Node.js, Python..."
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/25 text-blue-300 rounded-full text-xs font-semibold"
                        >
                          <span>{skill}</span>
                          <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-white transition">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_SKILLS.map((popSkill) => {
                          const isSelected = skills.includes(popSkill);
                          return (
                            <button
                              key={popSkill}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSkills(skills.filter((s) => s !== popSkill));
                                } else {
                                  setSkills([...skills, popSkill]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                                isSelected
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                  : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {popSkill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Interests with chips */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Interests</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                        placeholder="Open Source, AI..."
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddInterest()}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded-full text-xs font-semibold"
                        >
                          <span>{interest}</span>
                          <button type="button" onClick={() => setInterests(interests.filter(i => i !== interest))} className="hover:text-white transition">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_INTERESTS.map((popInt) => {
                          const isSelected = interests.includes(popInt);
                          return (
                            <button
                              key={popInt}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setInterests(interests.filter((i) => i !== popInt));
                                } else {
                                  setInterests([...interests, popInt]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                                isSelected
                                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                  : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {popInt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Coding Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('coding', 'Coding Background', <Code className="h-5 w-5" />)}
              {expandedSections.coding && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-5 animate-slideDown">
                  
                  {/* DSA Level - Segmented button control */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">DSA Skill Level</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 max-w-md">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                        const isSelected = watchedValues.dsaLevel === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setValue('dsaLevel', lvl)}
                            className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Programming Language */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Preferred Programming Language</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 max-w-md">
                      {['Java', 'Python', 'C++'].map((lang) => {
                        const isSelected = watchedValues.preferredProgrammingLanguage === lang;
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setValue('preferredProgrammingLanguage', lang as any)}
                            className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred DSA Language */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Preferred DSA Language</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 max-w-md">
                      {['Java', 'Python', 'C++'].map((lang) => {
                        const isSelected = watchedValues.preferredDsaLanguage === lang;
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setValue('preferredDsaLanguage', lang as any)}
                            className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* LeetCode count row */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">LeetCode Solved Problems</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-green-400">Easy</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center focus:outline-none"
                          {...register('leetcodeEasyCount')}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-amber-400">Medium</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center focus:outline-none"
                          {...register('leetcodeMediumCount')}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-red-400">Hard</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center focus:outline-none"
                          {...register('leetcodeHardCount')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Programming Languages with suggestions */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Programming Languages</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={progLangInput}
                        onChange={(e) => setProgLangInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProgLang())}
                        placeholder="Python, C++, TypeScript..."
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddProgLang()}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {programmingLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-green-500/10 border border-green-500/25 text-green-300 rounded-full text-xs font-semibold"
                        >
                          <span>{lang}</span>
                          <button type="button" onClick={() => setProgrammingLanguages(programmingLanguages.filter(l => l !== lang))} className="hover:text-white transition">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_LANGUAGES.map((lang) => {
                          const isSelected = programmingLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setProgrammingLanguages(programmingLanguages.filter((l) => l !== lang));
                                } else {
                                  setProgrammingLanguages([...programmingLanguages, lang]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                                isSelected
                                  ? 'bg-green-500/20 border-green-500 text-green-300'
                                  : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Frameworks with suggestions */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Frameworks & Libraries</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={frameworkInput}
                        onChange={(e) => setFrameworkInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFramework())}
                        placeholder="React, Django, Spring Boot..."
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFramework()}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded-full text-xs font-semibold"
                        >
                          <span>{fw}</span>
                          <button type="button" onClick={() => setFrameworks(frameworks.filter(f => f !== fw))} className="hover:text-white transition">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_FRAMEWORKS.map((fw) => {
                          const isSelected = frameworks.includes(fw);
                          return (
                            <button
                              key={fw}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setFrameworks(frameworks.filter((f) => f !== fw));
                                } else {
                                  setFrameworks([...frameworks, fw]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                                isSelected
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                  : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {fw}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Projects Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('projects', 'Projects Linked', <FolderGit2 className="h-5 w-5" />)}
              {expandedSections.projects && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 animate-slideDown">
                  
                  {projects.map((proj, idx) => (
                    <div key={idx} className="border border-white/5 p-4 rounded-xl space-y-4 text-left relative bg-white/[0.01]">
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="absolute top-4 right-4 p-1.5 hover:text-red-400 transition"
                        title="Delete project"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      <h4 className="text-sm font-semibold text-blue-400">Project #{idx + 1}</h4>
                      
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Project Title</label>
                          <input
                            type="text"
                            placeholder="E-Commerce API"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none"
                            value={proj.title}
                            onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Difficulty</label>
                          <select
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none"
                            value={proj.difficulty || 'Beginner'}
                            onChange={(e) => handleUpdateProject(idx, 'difficulty', e.target.value)}
                          >
                            <option value="Beginner" className="bg-slate-900">Beginner</option>
                            <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                            <option value="Advanced" className="bg-slate-900">Advanced</option>
                          </select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                          <textarea
                            placeholder="A scalable back-end supporting checkout operations..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none h-20 resize-none"
                            value={proj.description}
                            onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Github Repo Link</label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none"
                            value={proj.githubLink}
                            onChange={(e) => handleUpdateProject(idx, 'githubLink', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Live Deployment Link</label>
                          <input
                            type="url"
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none"
                            value={proj.liveLink}
                            onChange={(e) => handleUpdateProject(idx, 'liveLink', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Technologies Used (Comma Separated)</label>
                          <input
                            type="text"
                            placeholder="Node.js, Express, Postgres"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 focus:outline-none"
                            value={proj.technologies.join(', ')}
                            onChange={(e) => handleUpdateProject(idx, 'technologies', e.target.value.split(',').map((s) => s.trim()))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/20 transition flex items-center justify-center space-x-1.5 text-sm font-semibold"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Add Project</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Resume Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('resume', 'Profile Image & Socials', <Link2 className="h-5 w-5" />)}
              {expandedSections.resume && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-5 animate-slideDown">
                  
                  {/* Photo Upload layout */}
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white/5 border border-white/5 p-5 rounded-2xl">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold font-heading text-muted-foreground uppercase">
                          {user?.name?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <h4 className="text-sm font-semibold">Profile Photo</h4>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition mx-auto sm:mx-0"
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>Choose Image</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none"
                        {...register('linkedinUrl')}
                      />
                      {errors.linkedinUrl && <span className="text-xs text-destructive">{errors.linkedinUrl.message}</span>}
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">GitHub Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none"
                        {...register('githubUrl')}
                      />
                      {errors.githubUrl && <span className="text-xs text-destructive">{errors.githubUrl.message}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Preferences Accordion */}
            <div className="space-y-2">
              {renderSectionHeader('preferences', 'Career & Study Preferences', <Sliders className="h-5 w-5" />)}
              {expandedSections.preferences && (
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-5 animate-slideDown">
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Dream Target Company</label>
                      <input
                        type="text"
                        placeholder="Google, Microsoft, Stripe..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none"
                        {...register('dreamCompany')}
                      />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Daily Study Hours (1-12)</label>
                      <input
                        type="number"
                        placeholder="4"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none"
                        {...register('dailyStudyHours')}
                      />
                      {errors.dailyStudyHours && <span className="text-xs text-destructive">{errors.dailyStudyHours.message}</span>}
                    </div>
                  </div>

                  {/* Career Goal - Segmented buttons */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Career Preparation Focus</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 flex-wrap md:flex-nowrap">
                      {['Placement', 'Internship', 'Higher Studies', 'Freelancing', 'Startup'].map((goal) => {
                        const isSelected = watchedValues.careerGoal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => setValue('careerGoal', goal)}
                            className={`flex-1 text-center py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition duration-200 whitespace-nowrap ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Placement Timeline - Segmented buttons */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Preparation Timeline</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 max-w-md">
                      {['3 Months', '6 Months', '8 Months', '1 Year'].map((time) => {
                        const isSelected = watchedValues.placementTimeline === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setValue('placementTimeline', time)}
                            className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Company Type */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Target Company Type</label>
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1 max-w-md">
                      {['Product-Based', 'Service-Based'].map((type) => {
                        const isSelected = watchedValues.targetCompanyType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue('targetCompanyType', type as any)}
                            className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[10px] text-muted-foreground italic block mt-1">
                      {watchedValues.targetCompanyType === 'Product-Based'
                        ? 'Product-Based focus: Strong DSA, dynamic projects, CS Fundamentals, and System Design.'
                        : 'Service-Based focus: Aptitude, communication/soft skills, resume building, and foundational development.'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Roadmap regeneration trigger checkbox */}
            <div className="flex items-center space-x-2 pt-4 justify-start">
              <input
                type="checkbox"
                id="regenerateRoadmap"
                checked={regenerateRoadmap}
                onChange={(e) => setRegenerateRoadmap(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-slate-950 focus:ring-2 accent-blue-500 cursor-pointer"
              />
              <label htmlFor="regenerateRoadmap" className="text-sm font-semibold text-muted-foreground cursor-pointer hover:text-white transition">
                Regenerate my AI Roadmap using these updated parameters.
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white/5 border border-white/10 hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl transition duration-200 hover:opacity-90 flex items-center space-x-2 glow-primary disabled:opacity-50"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Profiles</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default CompleteProfile;
