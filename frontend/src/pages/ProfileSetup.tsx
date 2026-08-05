import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  X,
  Plus,
  Loader2,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  ArrowRight,
} from 'lucide-react';
import { CANONICAL_CAREER_PATHS } from '../constants/careerPaths';
import { POPULAR_BRANCHES } from '../constants/branches';
import { CollegeAutocomplete } from '../components/onboarding/CollegeAutocomplete';
import { SemesterChipSelector } from '../components/onboarding/SemesterChipSelector';
import { WhyWeAskCard } from '../components/onboarding/WhyWeAskCard';

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

const profileSetupSchema = z.object({
  college: z.string().min(2, 'College name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch name must be at least 2 characters'),
  cgpa: z.coerce
    .number({ invalid_type_error: 'CGPA must be a valid number' })
    .min(0, 'CGPA must be at least 0')
    .max(10, 'CGPA cannot exceed 10'),
  graduationYear: z.coerce.number().int().min(2020).max(2035, 'Invalid graduation year'),
  currentSemester: z.coerce.number().int().min(1).max(8),
  preferredCareer: z.string().min(2, 'Please select a preferred career path'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')),
  preferredProgrammingLanguage: z.enum(['Java', 'Python', 'C++']),
  preferredDsaLanguage: z.enum(['Java', 'Python', 'C++']),
  targetCompanyType: z.enum(['Product-Based', 'Service-Based']),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 9 }, (_, i) => currentYear + i);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      college: user?.college || '',
      branch: user?.branch || '',
      cgpa: user?.cgpa || 0,
      graduationYear: user?.graduationYear || currentYear + 2,
      currentSemester: user?.currentSemester || 3,
      preferredCareer: user?.preferredCareer || 'Software Engineer (SDE)',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      preferredProgrammingLanguage: user?.preferredProgrammingLanguage || 'Java',
      preferredDsaLanguage: user?.preferredDsaLanguage || 'Java',
      targetCompanyType: user?.targetCompanyType || 'Product-Based',
    },
  });

  const watchedValues = watch();

  const STEP_TITLES: Record<number, string> = {
    1: 'Academic Details',
    2: 'SDE Strategy',
    3: 'Career Preferences & Skills',
    4: 'Social Portfolios & Photo',
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['college', 'branch', 'cgpa', 'graduationYear', 'currentSemester']);
    } else if (step === 2) {
      isValid = true;
    } else if (step === 3) {
      isValid = await trigger(['preferredCareer']);
      if (skills.length === 0) {
        toast.error('Please add at least one skill.');
        return;
      }
      isValid = true;
    }
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInterest = interestInput.trim();
    if (cleanInterest && !interests.includes(cleanInterest)) {
      setInterests([...interests, cleanInterest]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

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

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsSubmitting(true);
    try {
      let profileImageUrl = user?.profileImage || '';

      if (imageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
          const uploadRes = await api.post('/users/profile/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          profileImageUrl = uploadRes.data.profileImage;
          toast.success('Profile picture uploaded successfully!');
        } catch (err) {
          console.error('Image upload failed, continuing with profile details:', err);
          toast.error('Failed to upload profile image.');
        } finally {
          setIsUploadingImage(false);
        }
      }

      const response = await api.patch('/users/profile', {
        ...data,
        skills,
        interests,
        profileImage: profileImageUrl,
      });

      updateUser(response.data.user);
      toast.success('Your profile setup is complete!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercent = Math.round((step / 4) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 py-8 sm:py-12 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Shimmer Blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 space-y-8">
        
        {/* Onboarding Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EngineerPath Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
            Let's build your personalized AI career roadmap 🚀
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            We'll use your academic profile to generate personalized roadmaps, internships, learning resources and placement recommendations.
          </p>
        </div>

        {/* Improved Progress Header */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wider">
                Step {step} of 4
              </span>
              <span className="text-slate-200 font-bold text-sm font-heading">{STEP_TITLES[step]}</span>
            </div>
            <span className="text-blue-400 font-bold tracking-wide">{completionPercent}% Complete</span>
          </div>

          {/* Animated Progress Track */}
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-blue-500/20"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Main Wizard Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: Academic Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-heading text-blue-400 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Academic Profile Details</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">All fields required</span>
              </div>

              <div className="space-y-5">
                
                {/* College Searchable Autocomplete */}
                <CollegeAutocomplete
                  value={watchedValues.college}
                  onChange={(val) => setValue('college', val, { shouldValidate: true })}
                  error={errors.college?.message}
                />

                {/* Branch Dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Branch / Major
                  </label>
                  <select
                    className={`w-full bg-slate-900/80 border ${
                      errors.branch ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    } rounded-xl py-3 px-4 text-sm text-slate-100 outline-none transition appearance-none cursor-pointer shadow-inner`}
                    {...register('branch')}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">Select your engineering branch...</option>
                    {POPULAR_BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-slate-100 py-1">
                        {b}
                      </option>
                    ))}
                  </select>
                  {errors.branch ? (
                    <p className="text-xs text-red-400 font-medium pt-0.5 animate-fadeIn">{errors.branch.message}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Select your core engineering field of study.</p>
                  )}
                </div>

                {/* CGPA & Graduation Year Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* CGPA Input */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-blue-400" />
                        <span>Cumulative CGPA</span>
                      </label>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                        Out of 10
                      </span>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 7.5, 8.43"
                      className={`w-full bg-slate-900/80 border ${
                        errors.cgpa ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                      } rounded-xl py-3 px-4 text-sm text-slate-100 outline-none transition shadow-inner font-mono`}
                      {...register('cgpa')}
                    />

                    {errors.cgpa ? (
                      <p className="text-xs text-red-400 font-medium pt-0.5 animate-fadeIn">{errors.cgpa.message}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Enter numeric decimal value (0 to 10 scale).</p>
                    )}
                  </div>

                  {/* Graduation Year Dropdown */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                      <span>Graduation Year</span>
                    </label>

                    <select
                      className={`w-full bg-slate-900/80 border ${
                        errors.graduationYear ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                      } rounded-xl py-3 px-4 text-sm text-slate-100 outline-none transition appearance-none cursor-pointer shadow-inner`}
                      {...register('graduationYear')}
                    >
                      {graduationYears.map((yr) => (
                        <option key={yr} value={yr} className="bg-slate-900 text-slate-100">
                          {yr} {yr === currentYear + 2 ? '(Expected Standard Batch)' : ''}
                        </option>
                      ))}
                    </select>

                    {errors.graduationYear ? (
                      <p className="text-xs text-red-400 font-medium pt-0.5 animate-fadeIn">{errors.graduationYear.message}</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Your target completion batch year.</p>
                    )}
                  </div>

                </div>

                {/* Semester Chip Selector */}
                <SemesterChipSelector
                  value={watchedValues.currentSemester}
                  onChange={(sem) => setValue('currentSemester', sem, { shouldValidate: true })}
                  error={errors.currentSemester?.message}
                />

                {/* Info Card */}
                <WhyWeAskCard />

              </div>
            </div>
          )}

          {/* STEP 2: SDE Placement Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold font-heading text-blue-400">
                  SDE Placement Strategy
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Tailor your preparation style to target specific types of recruiters.
                </p>
              </div>

              {/* Target Company Type */}
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target Company Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setValue('targetCompanyType', 'Product-Based')}
                    className={`p-5 rounded-2xl border text-left transition duration-200 hover:scale-[1.01] ${
                      watchedValues.targetCompanyType === 'Product-Based'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-sm sm:text-base text-slate-100">Product-Based Companies</div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Requires strong Data Structures & Algorithms, Projects, System Design (HLD/LLD), and CS Fundamentals.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('targetCompanyType', 'Service-Based')}
                    className={`p-5 rounded-2xl border text-left transition duration-200 hover:scale-[1.01] ${
                      watchedValues.targetCompanyType === 'Service-Based'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-sm sm:text-base text-slate-100">Service-Based Companies</div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Focuses on Quantitative Aptitude, Logical Reasoning, core programming syntax, and HR behavioral prep.
                    </div>
                  </button>
                </div>
              </div>

              {/* Preferred Programming Language */}
              <div className="space-y-3 text-left pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Preferred Programming Language
                </label>
                <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-2 max-w-md">
                  {['Java', 'Python', 'C++'].map((lang) => {
                    const isSelected = watchedValues.preferredProgrammingLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setValue('preferredProgrammingLanguage', lang as any)}
                        className={`flex-grow text-center py-2.5 text-xs sm:text-sm font-bold rounded-xl transition duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400 italic">
                  Used for SDE projects, syntax details, code snippets, and explanations.
                </span>
              </div>

              {/* Preferred DSA Language */}
              <div className="space-y-3 text-left pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Preferred DSA Language
                </label>
                <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-2 max-w-md">
                  {['Java', 'Python', 'C++'].map((lang) => {
                    const isSelected = watchedValues.preferredDsaLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setValue('preferredDsaLanguage', lang as any)}
                        className={`flex-grow text-center py-2.5 text-xs sm:text-sm font-bold rounded-xl transition duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400 italic">
                  Determines which language-specific DSA tutorials and curated videos will resolve in your roadmap.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Career Path & Skills */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold font-heading text-blue-400">
                  Career Goal & Core Skills
                </h3>
              </div>

              {/* Preferred Career Goal */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Preferred Career Goal
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition appearance-none cursor-pointer"
                  {...register('preferredCareer')}
                >
                  {CANONICAL_CAREER_PATHS.map((career) => (
                    <option key={career} value={career} className="bg-slate-900">
                      {career}
                    </option>
                  ))}
                </select>
                {errors.preferredCareer && <span className="text-xs text-red-400">{errors.preferredCareer.message}</span>}
              </div>

              {/* Skills Tags input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Core Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="React, Node.js, Python, Java..."
                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="bg-slate-800 hover:bg-slate-700 px-4 rounded-xl flex items-center justify-center transition border border-slate-700"
                  >
                    <Plus className="h-5 w-5 text-slate-200" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 text-blue-300 rounded-full text-xs font-semibold"
                    >
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white transition">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Popular Skills:</span>
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
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {popSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interests Tags input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Interests & Specializations
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    placeholder="Open Source, Competitive Coding, WebDev..."
                    className="flex-grow bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest()}
                    className="bg-slate-800 hover:bg-slate-700 px-4 rounded-xl flex items-center justify-center transition border border-slate-700"
                  >
                    <Plus className="h-5 w-5 text-slate-200" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded-full text-xs font-semibold"
                    >
                      <span>{interest}</span>
                      <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-white transition">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Popular Interests:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_INTERESTS.map((popInterest) => {
                      const isSelected = interests.includes(popInterest);
                      return (
                        <button
                          key={popInterest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setInterests(interests.filter((i) => i !== popInterest));
                            } else {
                              setInterests([...interests, popInterest]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                            isSelected
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {popInterest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Image & Social Links */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-lg font-bold font-heading text-blue-400">
                  Social Portfolios & Profile Photo
                </h3>
              </div>

              {/* Profile Image upload layout */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center shadow-lg">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold font-heading text-slate-400 uppercase">
                      {user?.name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-bold text-slate-200">Profile Photo</h4>
                  <p className="text-xs text-slate-400">JPG, PNG, or WEBP. Max 5MB file size.</p>
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
                    className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition mx-auto sm:mx-0 text-slate-200"
                  >
                    <UploadCloud className="h-4 w-4 text-blue-400" />
                    <span>Choose Image</span>
                  </button>
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 transition"
                  {...register('linkedinUrl')}
                />
                {errors.linkedinUrl && <span className="text-xs text-red-400">{errors.linkedinUrl.message}</span>}
              </div>

              {/* GitHub URL */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 outline-none focus:border-blue-500 transition"
                  {...register('githubUrl')}
                />
                {errors.githubUrl && <span className="text-xs text-red-400">{errors.githubUrl.message}</span>}
              </div>
            </div>
          )}

          {/* Sticky / Responsive Navigation Bar */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3 sticky bottom-0 bg-slate-900/90 py-3 sm:py-0 backdrop-blur-md z-20">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl transition duration-200 flex items-center gap-1.5 disabled:opacity-50 text-xs sm:text-sm active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3 rounded-xl transition duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 text-xs sm:text-sm ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition duration-200 flex items-center gap-2 shadow-xl shadow-blue-500/30 disabled:opacity-50 text-xs sm:text-sm ml-auto active:scale-95"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Finish Setup</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}

export default ProfileSetup;
